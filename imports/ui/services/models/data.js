import _ from 'lodash';


import {cfgIssues} from "../../data/Issues";

//Add the payload to current filters
const addToFilters = (payload, currentFilters, currentFacets) => {
    console.log('addToFilters');

    //Look for facet data corresponding to the selected filter
    let facetIdx = _.findIndex(currentFacets, function(v) { return v.group == payload.group; });

    //Initialize the filter with default values
    if (currentFilters[payload.group] === undefined) {
        currentFilters[payload.group] = Object.assign({}, currentFacets[facetIdx]);
        delete currentFilters[payload.group].data;
        if (currentFacets[facetIdx].type === 'text' || currentFacets[facetIdx].type === 'textCount') {
            currentFilters[payload.group].in = [];
            currentFilters[payload.group].nullSelected = false;
        } else if (currentFacets[facetIdx].type === 'range') {
            currentFilters[payload.group].min = 0;
            currentFilters[payload.group].max = 1;
        }
    }

    //If current filter is of type text, look for name in the 'in' array
    if (currentFacets[facetIdx].type === 'text' || currentFacets[facetIdx].type === 'textCount') {
        const currentIndex = currentFilters[payload.group].in.indexOf(payload.name);
        if (currentIndex === -1) {
            let updatedFilters = JSON.parse(JSON.stringify(currentFilters)); //TODO - Replace this with something better to copy object ?
            updatedFilters[payload.group].in.push(payload.name);
            return updatedFilters;
        }
    }

    if (currentFacets[facetIdx].type === 'range') {
        if (payload.min !== currentFilters[payload.group].min || payload.max !== currentFilters[payload.group].max) {
            let updatedFilters = JSON.parse(JSON.stringify(currentFilters)); //TODO - Replace this with something better to copy object ?
            updatedFilters[payload.group].min = payload.min;
            updatedFilters[payload.group].max = payload.max;
            return updatedFilters;
        }
    }

    console.log('addToFilters - No updating filters');
    return currentFIlters;

    /*
    if (currentFilters[payload.group] === undefined) {currentFilters[payload.group] = [];}
    const currentIndex = currentFilters[payload.group].map((v) => {return v.name}).indexOf(payload.name);
    if (currentIndex === -1) {
        let updatedFilters = JSON.parse(JSON.stringify(currentFilters)); //TODO - Replace this with something better to copy object ?
        updatedFilters[payload.group].push(payload);
        return updatedFilters;
    } else {
        return currentFilters;
    }
    */
};
//Remove the payload from current filters
const removeFromFilters = (payload, currentFilters) => {
    console.log(payload);
    console.log(currentFilters);
    if (currentFilters[payload.group].type === 'text' || currentFilters[payload.group].type === 'textCount') {
        //Search for payload in 'in' array
        const currentIndex = currentFilters[payload.group].in.indexOf(payload.name);
        if (currentIndex !== -1) {
            let updatedFilters = JSON.parse(JSON.stringify(currentFilters)); //TODO - Replace this with something better to copy object ?
            updatedFilters[payload.group].in.splice(currentIndex, 1);

            //If array is empty, entirely remove the filter
            if (updatedFilters[payload.group].in.length === 0) {
                delete updatedFilters[payload.group];
            }
            return updatedFilters;
        }
    } else if (currentFilters[payload.group].type === 'range') {
        if (payload.min === null && payload.max === null) { // If either max or min are null, the entire filter is dropped
            let updatedFilters = JSON.parse(JSON.stringify(currentFilters)); //TODO - Replace this with something better to copy object ?
            delete updatedFilters[payload.group]
        }
    }
    return currentFilters;
    /*
    if (currentFilters[payload.group] === undefined) {return currentFilters;}
    const currentIndex = currentFilters[payload.group].map((v) => {return v.name}).indexOf(payload.name);
    if (currentIndex === -1) {
        return currentFilters;
    } else {
        let updatedFilters = JSON.parse(JSON.stringify(currentFilters)); //TODO - Replace this with something better to copy object ?
        updatedFilters[payload.group].splice(currentIndex, 1);
        return updatedFilters;
    }
    */
};



//Rebuild the data output based on filters
const buildMongoFilter = (filters) => {
    //Build Mongo filter
    console.log('Current Filters: ' + JSON.stringify(filters));
        /*
        TEST DATA
         let filters = {
         "repo.name": [
         {"count": 135, "name": "SONG", "group": "repo.name","nested": false,"nullName":"EMPTY"},
         {"count": 190,"name": "kf-api-dataservice","group": "repo.name","nested": false,"nullName":"EMPTY"},
         {"count": 190,"name": "EMPTY","group": "repo.name","nested": false,"nullName":"EMPTY"}
         ],
         "author.login": [
         {"count": 61, "name": "dankolbman", "group": "author.login","nested": false}
         ],
         "labels": [
         {"count":948,"name":"EMPTY","group":"labels","nested":"name","nullName":"EMPTY"},
         {"count":159,"name":"bug","group":"labels","nested":"name","nullName":"EMPTY"}
         ]
         };

         Codepen: https://codepen.io/anon/pen/dKyOXo?editors=0010
         */

    let mongoFilter = Object.keys(filters).map(idx => {
        console.log('Building filter for group: ' + idx);
        console.log('Values: ' + JSON.stringify(filters[idx]));

        let currentQuery = {};
        // If filter type if text
        let currentFilter = filters[idx];
        if (currentFilter.type === 'text' || currentFilter.type === 'textCount') {
            //Only do something if there is content to be filtered on.
            if (currentFilter.in.length > 0) {
                let filteredValues = filters[idx].in;
                //If the facet is of type textCount, convert all values to numbers.
                if (currentFilter.type  === 'textCount') {filteredValues = currentFilter.in.map(v => parseInt(v));}

                if (filters[idx].nested === false ) {
                    currentQuery[idx] = { $in : filteredValues.filter(val => val !== currentFilter.nullName) }; // Filter out nullName value
                    // Test if array of values contains a "nullName" (name taken by undefined or non-existing field);
                    if (filteredValues.includes(currentFilter.nullName)) {
                        if (filteredValues.length === 1) { //This means there is only 1 filtered item, and it has to be the null one
                            return currentFilter.nullFilter;
                        } else {
                            return {$or :[currentFilter.nullFilter,currentQuery]}; // Wrapping the regular filters in an OR condition with the nullName value
                        }
                    }
                } else {
                    let subFilter = "node." + filters[idx].nested;
                    currentQuery[idx + ".edges"] = {$elemMatch: {}};
                    currentQuery[idx + ".edges"]["$elemMatch"][subFilter] = {};
                    currentQuery[idx + ".edges"]["$elemMatch"][subFilter]["$in"] = filteredValues.filter(val => val !== currentFilter.nullName);
                    // Test if array of values contains a "nullName" (name taken by undefined or non-existing field);
                    if (filteredValues.includes(currentFilter.nullName)) {
                        console.log('The array contains an empty value');
                        if (filteredValues.length === 1) { //This means there is only 1 filtered item, and it has to be the null one
                            return currentFilter.nullFilter;
                        } else {
                            // If it contains an empty value, it becomes necessary to add an "or" statement
                            //{ $or: [{"labels.totalCount":{"$eq":0}}, {"labels.edges":{"$elemMatch":{"node.name":{"$in":["bug"]}}}}] }
                            //let masterFilter = {$or :[currentFilter, filters[idx][0].nullFilter]};
                            // masterFilter["$or"][1][idx + ".totalCount"] = { $eq : 0 };
                            return {$or :[currentQuery, currentFilter.nullFilter]};
                        }
                    }
                }
            }
        } else if (currentFilter.type === 'range') {
            let gte = {};
            gte[idx] = {$gte:currentFilter.min};
            let lte = {};
            lte[idx] = {$lte:currentFilter.max};
            currentQuery = {$and:[gte, lte]};
        }
        return currentQuery;


        /*
        // Build an array of values;
        let filteredValues = filters[idx].in.map(v => v.name);

        if (filteredValues.length > 0) { // Do not do anything if there are no values
            //If the facet is of type textCount, convert all values to numbers.
            if (filters[idx].type  === 'textCount') {filteredValues = filters[idx].map(v => parseInt(v.name));}

            console.log(filteredValues);

            //For text values
            let currentFilter = {};
            if (filters[idx].type === 'range' ) {
                let gte = {};
                gte[idx] = {$gte:filters[idx].min};
                let lte = {};
                lte[idx] = {$lte:filters[idx].max};
                currentFilter = {$and:[gte, lte]};
            } else if (filters[idx].nested === false ) {
                currentFilter[idx] = { $in : filteredValues.filter(val => val !== filters[idx][0].nullName) }; // Filter out nullName value
                // Test if array of values contains a "nullName" (name taken by undefined or non-existing field);
                if (filteredValues.includes(filters[idx].nullName)) {
                    if (filteredValues.length === 1) { //This means there is only 1 filtered item, and it has to be the null one
                        return filters[idx].nullFilter;
                    } else {
                        return {$or :[filters[idx].nullFilter,currentFilter]}; // Wrapping the regular filters in an OR condition with the nullName value
                        //currentFilter["$or"][1][idx] = { $in : filteredValues.filter(val => val !== filters[idx][0].nullName) };
                    }
                }
            } else { // If we are searching in a nest array
                //db.multiArr.find({'Keys':{$elemMatch:{$elemMatch:{$in:['carrot']}}}})
                //{"state":{"$in":["OPEN"]}}
                //window.issues.find({"assignees.edges":{$elemMatch:{"node.login":"USERLOGIN"}}}).fetch();
                //mongoFilter[idx] = {$elemMatch:{$elemMatch:{"name": { $in : filterValues }}}};
                //labels.totalCount
                let subFilter = "node." + filters[idx].nested;
                currentFilter[idx + ".edges"] = {$elemMatch: {}};
                //currentFilter[idx + ".edges"]["$elemMatch"] = {};
                currentFilter[idx + ".edges"]["$elemMatch"][subFilter] = {};
                currentFilter[idx + ".edges"]["$elemMatch"][subFilter]["$in"] = filteredValues.filter(val => val !== filters[idx][0].nullName);
                // Test if array of values contains a "nullName" (name taken by undefined or non-existing field);
                if (filteredValues.includes(filters[idx].nullName)) {
                    console.log('The array contains an empty value');
                    if (filteredValues.length === 1) { //This means there is only 1 filtered item, and it has to be the null one
                        return filters[idx].nullFilter;
                    } else {
                        // If it contains an empty value, it becomes necessary to add an "or" statement
                        //{ $or: [{"labels.totalCount":{"$eq":0}}, {"labels.edges":{"$elemMatch":{"node.name":{"$in":["bug"]}}}}] }
                        //let masterFilter = {$or :[currentFilter, filters[idx][0].nullFilter]};
                        // masterFilter["$or"][1][idx + ".totalCount"] = { $eq : 0 };
                        return {$or :[currentFilter, filters[idx].nullFilter]};
                    }

                }
            }
            return currentFilter;
        }
        */
    });

    console.log('Mongo Filter: ' + JSON.stringify(mongoFilter));

    // Convert array of objects to an object that can be parsed by Mongo
    /*
        Example 1:
        From: [{"state":{"$in":["OPEN"]}}]
        To: {"state":{"$in":["OPEN"]}}

        Example 2:
        From: [{"org.name":{"$in":["Overture"]}},{"state":{"$in":["OPEN"]}}]
        To: [{"org.name":{"$in":["Overture"]}},{"state":{"$in":["OPEN"]}}]

        Example 3:
        From: [{"org.name":{"$in":["Overture","ICGC DCC"]}},{"state":{"$in":["OPEN"]}}]
        To: {"org.name":{"$in":["Overture","ICGC DCC"]},"state":{"$in":["OPEN"]}}

        Example 4:
        From: [null]
        To: {}
     */

    // Strip all null values (example 4)
    mongoFilter = mongoFilter.filter(v => v !== undefined);

    if (mongoFilter.length === 0) {
        mongoFilter = {};
    } else  {
        let convertedMongoFilter = {};
        mongoFilter.forEach(value => {
            idx = Object.keys(value)[0];
            convertedMongoFilter[idx] = value[idx];
        });
        mongoFilter = convertedMongoFilter;
    }

    console.log('Mongo Filter: ' + JSON.stringify(mongoFilter));
    console.log('Number of matched issues: ' + cfgIssues.find(mongoFilter).count());
    return mongoFilter
};

//{ $or: [{"labels.totalCount":{"$eq":0}}, {"labels.edges":{"$elemMatch":{"node.name":{"$in":["bug"]}}}}] }

const clearIssuesFilters = async () => {
//    console.log('clearIssuesFilters - Total issues before: ' + cfgIssues.find({filtered: false}).count());
    await cfgIssues.update({}, { $set: { filtered: false } }, {multi: true});
//    console.log('clearIssuesFilters - Total issues after: ' + cfgIssues.find({filtered: false}).count());
}

/**
 * filterMongo() Set the filtered state to minimongo
 *
 * Arguments:
 * - mongoFilter: to use for filtered items
 */
const filterMongo = async (mongoFilter) => {
    //Filter Mongo to only return specific data
    await cfgIssues.update({}, { $set: { filtered: true } }, {multi: true});
    await cfgIssues.update(mongoFilter, { $set: { filtered: false } }, {multi: true});
}


/**
 * isFacetSelected() returns true if the facet currently has of its elements selected.
 *
 * Arguments:
 * - facet: Current facet being processed
 * - updatedFilters: List of selected filters
 */
const isFacetSelected = (facet, updatedFilters) => {
    if (updatedFilters[facet.group] === undefined) {
        return false;
    } else {
        return true;
    }
};

/**
 * getFacetAggregations() returns data to be displayed in the facet.
 *   If the facet has one of its element already selected, display all available elements for that facet.
 *
 * Arguments:
 * - facet: Current facet being processed
 * - mongoFilter: Mongo filter used to collect relevant data
 */
const getFacetAggregations = (facet, mongoFilter) => {
//    console.log('getFacetAggregations - Process Facet Group: ' + facet.group);
//    console.log('getFacetAggregations - Mongo Query: ' + JSON.stringify(mongoFilter));
    let statesGroup = [];
    if (facet.nested) {
        let allValues = [];
        cfgIssues.find(mongoFilter).forEach((issue) => {
            if (issue[facet.group].totalCount === 0) {
                //console.log('getFacetAggregations - processing: ' + facet.group + ' - Null value: ' + facet.nullName);
                //console.log(allValues);
                let pushObj = {};
                pushObj[facet.nested] = facet.nullName;
                allValues.push(pushObj);
            } else {
                issue[facet.group].edges.map((nestedValue) => {
                    if (nestedValue.node[facet.nested] === null || nestedValue.node[facet.nested] === '' || nestedValue.node[facet.nested] === undefined ) {
                        //console.log({...nestedValue.node, name: nestedValue.node.login});
                        allValues.push({...nestedValue.node, name: nestedValue.node.login});
                    } else {
                        allValues.push(nestedValue.node);
                    }
                })
            }
        });
        statesGroup = _.groupBy(allValues, facet.nested);
    } else {
        statesGroup = _.groupBy(cfgIssues.find(mongoFilter).fetch(), facet.group);
        //statesGroup = _.groupBy(cfgIssues.find({ $or: [{filtered: false}, {'repo.name': facet.group}]}).fetch(), facet.group);
    }

    // If the key is 'undefined', replace with default facet name
    if (statesGroup['undefined'] !== undefined) {
        statesGroup[facet.nullName] = statesGroup['undefined'];
        delete statesGroup['undefined'];
    }

    let states = [];
    Object.keys(statesGroup).forEach(function(key) {
        //if (key === null || key === undefined || key === 'undefined' || key === 'null') {facetItemName = facet.nullName;} // If name is undefined or null, replace with its nullValue
        //Check to avoid any duplicate keys
        //if (states.findIndex((v) => { console.log(v.name + " == " + facetItemName);return v.name === facetItemName;}) === -1) {
            states.push({count: statesGroup[key].length, name: key, group: facet.group, nested: facet.nested, type: facet.type, nullName: facet.nullName, nullFilter: facet.nullFilter});
        //}
    });
    //Return the array sorted by count
    return states.sort((a, b) => b.count - a.count);
};

export default {
    state: {
        facets: [ // Statically define facets to be displayed
            //header: Header text displayed on the facet
            //group: Minimongo field to group on
            //text: Type of facet
            //nested: Is this going through nested data, if yes, on which idx ?
            //nullName: Name to be displayed if empty or undefined
            //data: Facets data
            {header: 'States', group: 'state', type: 'text', nested: false, data: [] },
            {header: 'Organizations', group: 'org.name', type: 'text', nested: false, data: [] },
            {header: 'Repositories', group: 'repo.name', type: 'text', nested: false, data: [] },
            {header: 'Authors', group: 'author.login', type: 'text', nested: false, data: [] },
            {header: 'Labels', group: 'labels', type: 'text', nested: 'name', nullName: 'NO LABEL', nullFilter: {'labels.totalCount': { $eq : 0 }},data: []},
            {header: 'Assignees', group: 'assignees', type: 'text', nested: 'login', nullName: 'UNASSIGNED', nullFilter: {'assignees.totalCount': { $eq : 0 }}, data: [] },
            {header: 'Milestones', group: 'milestone.title', type: 'text', nested: false, nullName: 'NO MILESTONE', nullFilter: {'milestone': { $eq : null }},data: []} ,
            {header: 'Milestones States', group: 'milestone.state', type: 'text', nested: false, data: [] },
            {header: 'Comments', group: 'comments.totalCount', type: 'textCount', nested: false, data: [] },
            {header: 'Created Since', group: 'createdSince', type: 'text', nested: false, data: [] },
            {header: 'Last updated Since', group: 'updatedSince', type: 'text', nested: false, data: [] },
            {header: 'Closed Since', group: 'stats.closedSince', type: 'range', nested: false, data: [] },
        ],
        filters: {},
        results: [],
        mongoFilters: null,
        loading: false,
    },
    reducers: {
        clearFilters(state) {return {...state, filters: {}};},
        clearResults(state) {return { ...state, results: []};},
        addFilter(state, payload) {
            return {...state, filters: addToFilters(payload, state.filters, state.facets)}
        },
        removeFilter(state, payload) {
            return {...state, filters: removeFromFilters(payload, state.filters)}
        },
        updateFacets(state, payload) {
            return { ...state, facets: payload };
        },
        updateResults(state, payload) {
            return { ...state, results: payload };
        },
        updateLoading(state, payload) {
            return { ...state, loading: payload };
        },
        updateMongoFilters(state, payload) {
            return { ...state, mongoFilters: payload };
        }
    },
    effects: {
        //Add a filter, then refresh the data points
        async addFilterRefresh(payload, rootState) {
            //Get the list of updated filters, and push received filter payload to state
            let updatedFilters = addToFilters(payload, rootState.data.filters, rootState.data.facets);
            this.addFilter(payload);

            // Build the mongo filter from the filters state, set the filtered state in the mongo records.
            let mongoFilter = await buildMongoFilter(updatedFilters);
            await filterMongo(mongoFilter);
            this.updateMongoFilters(mongoFilter);

            // Refresh/populate the facets data from mongo
            let newFacets = JSON.parse(JSON.stringify(rootState.data.facets)).map((facet) => {
                let facetMongoFilter = mongoFilter;
                if (isFacetSelected(facet, updatedFilters) === true) {facetMongoFilter = {};} // If the facet is currently selected, do not filter the facet's content
                return {...facet, data: getFacetAggregations(facet, facetMongoFilter)};
            });
            await this.updateFacets(newFacets);

            // Update the results
            this.updateResults(cfgIssues.find(mongoFilter).fetch());
        },
        async removeFilterRefresh(payload, rootState) {
            let updatedFilters = removeFromFilters(payload, rootState.data.filters);
            this.removeFilter(payload);

            // Build the mongo filter from the filters state, set the filtered state in the mongo records.
            let mongoFilter = await buildMongoFilter(updatedFilters);
            await filterMongo(mongoFilter);
            this.updateMongoFilters(mongoFilter);

            // Refresh/populate the facets data from mongo
            let newFacets = JSON.parse(JSON.stringify(rootState.data.facets)).map((facet) => {
                let facetMongoFilter = mongoFilter;
                if (isFacetSelected(facet, updatedFilters) === true) {facetMongoFilter = {};} // If the facet is currently selected, do not filter the facet's content
                return {...facet, data: getFacetAggregations(facet, facetMongoFilter)};
            });
            await this.updateFacets(newFacets);

            // Update the results
            this.updateResults(cfgIssues.find(mongoFilter).fetch());
        },
        async initFacets(payload, rootState) {
            this.updateLoading(true);

            await clearIssuesFilters();

            // Build the mongo filter from the filters state, set the filtered state in the mongo records.
            let mongoFilter = await buildMongoFilter(rootState.data.filters);

            await filterMongo(mongoFilter);
            this.updateMongoFilters(mongoFilter);

            // Refresh/populate the facets data from mongo
            let newFacets = JSON.parse(JSON.stringify(rootState.data.facets)).map((facet) => {
                return {...facet, data: getFacetAggregations(facet, mongoFilter)};
            });
            await this.updateFacets(newFacets);

            // Update the results
            this.updateResults(cfgIssues.find(mongoFilter).fetch());

            this.updateLoading(false);
        }
    }
};
