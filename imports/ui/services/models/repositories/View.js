import _ from 'lodash';

import { cfgIssues, cfgQueries, cfgRepositories } from '../../../data/Minimongo.js';

import { refreshBurndown } from '../../../utils/burndown/index.js';
import { buildFacets } from '../../../utils/facets/repositories.js';
import { refreshVelocity } from '../../../utils/velocity/index.js';

import { getAssigneesRepartition } from '../../../utils/repartition/index.js';

import subDays from 'date-fns/subDays';

export default {
    state: {
        repositories: [],
        repositoriesTotalCount: 0,
        repositoriesTotalGitHubCount: 0,
        repositoriesFirstUpdate: {},
        repositoriesLastUpdate: {},

        facets: [],
        queries: [],

        selectedTab: 'stats',           // Selected tab to be displayed
        tabStatsQuery: null,            // This stores the current query, used to identify if data refresh is needed
        tabWorkQuery: null,             // This stores the current query, used to identify if data refresh is needed
        tabGraphQuery: null,            // This stores the current query, used to identify if data refresh is needed

        query: {},

        defaultPoints: false,    // Default display to points, otherwise repositories count

        burndown: {},
        shouldBurndownDataReload: false,  // We don't want to reload the burndown data automatically when repositories are changed

        velocity: {},
        shouldVelocityDataReload: false,  // We don't want to reload the velocity data automatically when repositories are changed

        remainingWorkRepos: [],                  // List repos with open repositories
        remainingWorkAssignees: [],              // List assignees with open repositories
        shouldSummaryDataReload: false,

        statsCreatedSince: [],
        statsUpdatedSince: [],
        statsPushedSince: [],
        statsForkCount: [],
        statsStargazersCount: [],
        statsVulnerabilityAlertsCount: [],
        statsWatchersCount: [],

        statsIssuesPresent: [],
        statsPullRequestsPresent: [],
        statsReleasesPresent: [],
        statsProjectsPresent: [],
        statsMilestonesPresent: [],
        statsTeamsPresent: [],
        statsBranchProtectionPresent: [],
        statsIsFork: [],
        statsIsPrivate: [],
        statsHasCodeOfConduct: [],
        statsHasDescription: [],
        statsHasIssuesEnabled: [],
        statsHasWikiEnabled: [],

        showTimeModal: false,
        timeFields: [{idx: 'createdAt', name: 'Created'}, {idx: 'updatedAt', name: 'Updated'}, {idx: 'pushedAt', name: 'Pushed'}],
    },
    reducers: {
        setRepositories(state, payload) {return { ...state, repositories: payload };},
        setRepositoriesTotalCount(state, payload) {return { ...state, repositoriesTotalCount: payload };},
        setRepositoriesTotalGitHubCount(state, payload) {return { ...state, repositoriesTotalGitHubCount: payload };},
        setRepositoriesFirstUpdate(state, payload) {return { ...state, repositoriesFirstUpdate: JSON.parse(JSON.stringify(payload)) };},
        setRepositoriesLastUpdate(state, payload) {return { ...state, repositoriesLastUpdate: JSON.parse(JSON.stringify(payload)) };},
        setRepositoriesGraph(state, payload) {return { ...state, repositoriesGraph: payload };},

        setFacets(state, payload) {return { ...state, facets: payload };},
        setQueries(state, payload) {return { ...state, queries: payload };},
        setSelectedTab(state, payload) {return { ...state, selectedTab: payload };},
        setTabStatsQuery(state, payload) {return { ...state, tabStatsQuery: payload };},
        setTabWorkQuery(state, payload) {return { ...state, tabWorkQuery: payload };},
        setTabGraphQuery(state, payload) {return { ...state, tabGraphQuery: payload };},

        setQuery(state, payload) {return { ...state, query: JSON.parse(JSON.stringify(payload)) };},

        setDefaultPoints(state, payload) {return { ...state, defaultPoints: payload };},

        setShouldBurndownDataReload(state, payload) {return { ...state, shouldBurndownDataReload: payload };},
        setBurndown(state, payload) {return { ...state, burndown: JSON.parse(JSON.stringify(payload)) };},

        setShouldVelocityDataReload(state, payload) {return { ...state, shouldVelocityDataReload: payload };},
        setVelocity(state, payload) {return { ...state, velocity: JSON.parse(JSON.stringify(payload)) };},

        setShouldSummaryDataReload(state, payload) {return { ...state, shouldSummaryDataReload: payload };},
        setRemainingWorkRepos(state, payload) {return { ...state, remainingWorkRepos: payload };},
        setRemainingWorkAssignees(state, payload) {return { ...state, remainingWorkAssignees: payload };},

        setStatsCreatedSince(state, payload) {return { ...state, statsCreatedSince: payload };},
        setStatsUpdatedSince(state, payload) {return { ...state, statsUpdatedSince: payload };},
        setStatsPushedSince(state, payload) {return { ...state, statsPushedSince: payload };},
        setStatsForkCount(state, payload) {return { ...state, statsForkCount: payload };},
        setStatsStargazersCount(state, payload) {return { ...state, statsStargazersCount: payload };},
        setStatsVulnerabilityAlertsCount(state, payload) {return { ...state, statsVulnerabilityAlertsCount: payload };},
        setStatsWatchersCount(state, payload) {return { ...state, statsWatchersCount: payload };},

        setStatsIssuesPresent(state, payload) {return { ...state, statsIssuesPresent: payload };},
        setStatsPullRequestsPresent(state, payload) {return { ...state, statsPullRequestsPresent: payload };},
        setStatsReleasesPresent(state, payload) {return { ...state, statsReleasesPresent: payload };},
        setStatsProjectsPresent(state, payload) {return { ...state, statsProjectsPresent: payload };},
        setStatsMilestonesPresent(state, payload) {return { ...state, statsMilestonesPresent: payload };},
        setStatsBranchProtectionPresent(state, payload) {return { ...state, statsBranchProtectionPresent: payload };},
        setStatsTeamsPresent(state, payload) {return { ...state, statsTeamsPresent: payload };},
        setStatsIsFork(state, payload) {return { ...state, statsIsFork: payload };},
        setStatsIsPrivate(state, payload) {return { ...state, statsIsPrivate: payload };},
        setStatsHasCodeOfConduct(state, payload) {return { ...state, statsHasCodeOfConduct: payload };},
        setStatsHasDescription(state, payload) {return { ...state, statsHasDescription: payload };},
        setStatsHasIssuesEnabled(state, payload) {return { ...state, statsHasIssuesEnabled: payload };},
        setStatsHasWikiEnabled(state, payload) {return { ...state, statsHasWikiEnabled: payload };},

        setShowTimeModal(state, payload) {return { ...state, showTimeModal: payload };},
        setTimeFields(state, payload) {return { ...state, timeFields: payload };},
    },
    effects: {
        async updateQuery(query) {
            if (query === null) {
                this.setQuery({});
            } else {
                this.setQuery(query);
            }
            this.updateView();
        },

        async clearRepositories() {
            cfgRepositories.remove({});
            this.setRepositories([]);
            this.setQuery({});
            this.updateView();
        },

        async updateView(payload, rootState) {
            const log = rootState.global.log;
            log.info("Triggered updateView()");

            this.refreshQueries();
            this.refreshFacets();
            this.refreshRepositories();

            this.updateStats();
            this.updateWork();
        },

        async updateSelectedTab(payload, rootState) {
            const log = rootState.global.log;
            log.info("Triggered updateSelectedTab() - " + payload);
            this.setSelectedTab(payload);
            if (payload === 'stats' && !_.isEqual(rootState.repositoriesView.query, rootState.repositoriesView.tabStatsQuery)) {
                this.updateStats();
            }
        },

        async updateStats(payload, rootState) {
            if (rootState.repositoriesView.selectedTab === 'stats') {
                this.refreshBins();
                this.refreshForkBins();
                this.refreshStargazersBins();
                this.refreshVulnerabilityAlertsBins();
                this.refreshWatchersBins();
                this.refreshIssuesPresent();
                this.refreshPullRequestsPresent();
                this.refreshReleasesPresent();
                this.refreshProjectsPresent();
                this.refreshMilestonesPresent();
                this.refreshTeamsPresent();
                this.refreshBranchProtectionPresent();
                this.refreshIsFork();
                this.refreshIsPrivate();
                this.refreshHasCodeOfConduct();
                this.refreshHasDescription();
                this.refreshHasIssuesEnabled();
                this.refreshHasWikiEnabled();
                this.setTabStatsQuery(rootState.repositoriesView.query);
            }
        },

        async updateWork(payload, rootState) {
            if (rootState.repositoriesView.selectedTab === 'work' || rootState.repositoriesView.selectedTab === 'burndown' || rootState.repositoriesView.selectedTab === 'velocity') {
                this.setShouldBurndownDataReload(true);
                this.refreshSummary();
                this.refreshVelocity();
                this.setTabWorkQuery(rootState.repositoriesView.query);
            }
        },

        async refreshQueries() {
            this.setQueries(cfgQueries.find({}).fetch());
        },

        async saveQuery(queryName, rootState) {
            if (cfgQueries.find({filters: JSON.stringify(rootState.repositoriesView.query)}).count() === 0) {
                await cfgQueries.insert({
                    name: queryName,
                    filters: JSON.stringify(rootState.repositoriesView.query),
                });
            }
            this.refreshQueries();
        },

        async refreshRepositories(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();

            
            let repositories = cfgRepositories.find(rootState.repositoriesView.query).fetch();
            const firstUpdate = cfgRepositories.findOne(rootState.repositoriesView.query, {sort: {updatedAt: 1},reactive: false,transform: null});
            const lastUpdate = cfgRepositories.findOne(rootState.repositoriesView.query, {sort: {updatedAt: -1},reactive: false,transform: null});

            if (repositories.length > 0) {
                this.setRepositoriesFirstUpdate(firstUpdate);
                this.setRepositoriesLastUpdate(lastUpdate);
            }
            this.setRepositoriesTotalCount(cfgRepositories.find({}).count());

            this.setRepositories(repositories);
            var t1 = performance.now();
            log.info("refreshRepositories - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshSummary(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();

            let query = rootState.repositoriesView.query;
            let openedIssuesFilter = {...query, ...{'state':{$in:['OPEN']}}};
            let openedIssues = cfgIssues.find(openedIssuesFilter).fetch();

            let repos = [];
            let statesGroup = _.groupBy(openedIssues, 'repo.name');
            Object.keys(statesGroup).forEach(function(key) {
                repos.push({
                    count: statesGroup[key].length,
                    name: key,
                    repositories: statesGroup[key],
                    points: statesGroup[key].map(i => i.points).reduce((acc, points) => acc + points, 0)
                });
            });
            this.setRemainingWorkRepos(repos);

            const assignees = getAssigneesRepartition(openedIssues).map((assignee) => {
                let name = assignee.login;
                if (assignee.name !== undefined && assignee.name !== '' && assignee.name !== null) {name = assignee.name;}
                return {
                    name: name,
                    count: assignee.repositories.list.length,
                    points: assignee.repositories.points,
                    repositories: assignee.repositories.list,
                }
            });
            this.setRemainingWorkAssignees(assignees);

            var t1 = performance.now();
            log.info("refreshSummary - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshFacets(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();

            let updatedFacets = buildFacets(JSON.parse(JSON.stringify(rootState.repositoriesView.query)), cfgRepositories);
            this.setFacets(updatedFacets);

            var t1 = performance.now();
            log.info("refreshFacets - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshBurndown(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();

            this.setShouldBurndownDataReload(false);

            let burndownData = await refreshBurndown(JSON.parse(JSON.stringify(rootState.repositoriesView.query)), cfgIssues);

            this.setBurndown(burndownData);

            var t1 = performance.now();
            log.info("refreshBurndown - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshVelocity(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();

            this.setShouldVelocityDataReload(false);

            let velocityData = await refreshVelocity(JSON.parse(JSON.stringify(rootState.repositoriesView.query)), cfgIssues);

            this.setVelocity(velocityData);

            var t1 = performance.now();
            log.info("refreshVelocity - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshForkBins(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            //const repoWithMostForkCount = cfgRepositories.findOne({...query}, {sort: {forkCount: -1},reactive: false,transform: null});
            //console.log(repoWithMostForkCount)
            
            const forkCount = [{
                label: '1 - 5',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  1, $lt : 5}}).fetch()
            }, {
                label: '5 - 10',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  5, $lt : 10}}).fetch()
            }, {
                label: '10 - 20',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  10, $lt : 20}}).fetch()
            }, {
                label: '20 - 50',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  20, $lt : 50}}).fetch()
            }, {
                label: '50 - 100',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  50, $lt : 100}}).fetch()
            }, {
                label: '100 - 200',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  100, $lt : 200}}).fetch()
            }, {
                label: '200 - 500',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  200, $lt : 500}}).fetch()
            }, {     
                label: '500 - 1000',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  500, $lt : 1000}}).fetch()
            }, {                             
                label: '1000+',
                repositories: cfgRepositories.find({...query, 'forkCount':{ $gte :  1001}}).fetch()
            }];
            this.setStatsForkCount(forkCount);
            
           var t1 = performance.now();
           log.info("refreshForkBins - took " + (t1 - t0) + " milliseconds.");           
        },

        async refreshStargazersBins(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;
            
            const dataset = [{
                label: '1 - 5',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  1, $lt : 5}}).fetch()
            }, {
                label: '5 - 10',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  5, $lt : 10}}).fetch()
            }, {
                label: '10 - 20',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  10, $lt : 20}}).fetch()
            }, {
                label: '20 - 50',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  20, $lt : 50}}).fetch()
            }, {
                label: '50 - 100',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  50, $lt : 100}}).fetch()
            }, {
                label: '100 - 200',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  100, $lt : 200}}).fetch()
            }, {
                label: '200 - 500',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  200, $lt : 500}}).fetch()
            }, {     
                label: '500 - 1000',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  500, $lt : 1000}}).fetch()
            }, {                             
                label: '1000+',
                repositories: cfgRepositories.find({...query, 'stargazers.totalCount':{ $gte :  1001}}).fetch()
            }];
            this.setStatsStargazersCount(dataset);
            
           var t1 = performance.now();
           log.info("refreshStargazersBins - took " + (t1 - t0) + " milliseconds.");           
        },

        async refreshVulnerabilityAlertsBins(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            //const repoWithMostForkCount = cfgRepositories.findOne({...query}, {sort: {forkCount: -1},reactive: false,transform: null});
            //console.log(repoWithMostForkCount)
            
            const dataset = [{
                label: '1',
                repositories: cfgRepositories.find({...query, 'vulnerabilityAlerts.totalCount':{ $eq : 1}}).fetch()
            }, {
                label: '2',
                repositories: cfgRepositories.find({...query, 'vulnerabilityAlerts.totalCount':{ $eq : 2}}).fetch()
            }, {
                label: '3',
                repositories: cfgRepositories.find({...query, 'vulnerabilityAlerts.totalCount':{ $eq : 3}}).fetch()
            }, {
                label: '4',
                repositories: cfgRepositories.find({...query, 'vulnerabilityAlerts.totalCount':{ $eq : 4}}).fetch()     
            }, {
                label: '5 - 10',
                repositories: cfgRepositories.find({...query, 'vulnerabilityAlerts.totalCount':{ $gte : 5, $lt : 10}}).fetch()
            }, {
                label: '10 - 15',
                repositories: cfgRepositories.find({...query, 'vulnerabilityAlerts.totalCount':{ $gte :  10, $lt : 15}}).fetch()
            }, {
                label: '15 - 20',
                repositories: cfgRepositories.find({...query, 'vulnerabilityAlerts.totalCount':{ $gte :  15, $lt : 20}}).fetch()
            }, {                          
                label: '20+',
                repositories: cfgRepositories.find({...query, 'vulnerabilityAlerts.totalCount':{ $gte :  20}}).fetch()
            }];
            this.setStatsVulnerabilityAlertsCount(dataset);
            
           var t1 = performance.now();
           log.info("refreshVulnerabilityAlertsBins - took " + (t1 - t0) + " milliseconds.");           
        },

        async refreshWatchersBins(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            //const repoWithMostForkCount = cfgRepositories.findOne({...query}, {sort: {forkCount: -1},reactive: false,transform: null});
            //console.log(repoWithMostForkCount)
            
            const dataset = [{
                label: '1 - 5',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  1, $lt : 5}}).fetch()
            }, {
                label: '5 - 10',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  5, $lt : 10}}).fetch()
            }, {
                label: '10 - 20',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  10, $lt : 20}}).fetch()
            }, {
                label: '20 - 50',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  20, $lt : 50}}).fetch()
            }, {
                label: '50 - 100',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  50, $lt : 100}}).fetch()
            }, {
                label: '100 - 200',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  100, $lt : 200}}).fetch()
            }, {
                label: '200 - 500',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  200, $lt : 500}}).fetch()
            }, {     
                label: '500 - 1000',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  500, $lt : 1000}}).fetch()
            }, {                             
                label: '1000+',
                repositories: cfgRepositories.find({...query, 'watchers.totalCount':{ $gte :  1001}}).fetch()
            }];
            this.setStatsWatchersCount(dataset);
            
           var t1 = performance.now();
           log.info("refreshWatchersBins - took " + (t1 - t0) + " milliseconds.");           
        },

        async refreshBins(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const createdSince = [{
                label: '0 - 1 d',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt : subDays(new Date(), 1).toISOString()}}).fetch()
            }, {
                label: '1 - 7 d',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 7).toISOString(), $lte : subDays(new Date(), 1).toISOString()}}).fetch()
            }, {
                label: '1 - 2 wks',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 14).toISOString(), $lte : subDays(new Date(), 7).toISOString()}}).fetch()
            }, {
                label: '2 - 4 wks',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 30).toISOString(), $lte : subDays(new Date(), 14).toISOString()}}).fetch()
            }, {
                label: '1 - 3 mths',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 90).toISOString(), $lte : subDays(new Date(), 30).toISOString()}}).fetch()
            }, {
                label: '3 - 6 mths',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 120).toISOString(), $lte : subDays(new Date(), 90).toISOString()}}).fetch()
            }, {
                label: '6 - 12 mths',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 365).toISOString(), $lte : subDays(new Date(), 120).toISOString()}}).fetch()
            }, {
                label: '1 - 2 yrs',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 730).toISOString(), $lte : subDays(new Date(), 365).toISOString()}}).fetch()
            }, {     
                label: '2 - 3 yrs',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 1095).toISOString(), $lte : subDays(new Date(), 730).toISOString()}}).fetch()
            }, {                             
                label: '3 - 4 yrs',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $gt :  subDays(new Date(), 1460).toISOString(), $lte : subDays(new Date(), 1095).toISOString()}}).fetch()
            }, {
                label: '4 yr+',
                repositories: cfgRepositories.find({...query, 'createdAt':{ $lt :  subDays(new Date(), 1460).toISOString()}}).fetch()    
            }];
            this.setStatsCreatedSince(createdSince);

            const updatedSince = [{
                label: '0 - 1 d',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt : subDays(new Date(), 1).toISOString()}}).fetch()
            }, {
                label: '1 - 7 d',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 7).toISOString(), $lte : subDays(new Date(), 1).toISOString()}}).fetch()
            }, {
                label: '1 - 2 wks',
                repositories: cfgIssues.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 14).toISOString(), $lte : subDays(new Date(), 7).toISOString()}}).fetch()
            }, {
                label: '2 - 4 wks',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 30).toISOString(), $lte : subDays(new Date(), 14).toISOString()}}).fetch()
            }, {
                label: '1 - 3 mths',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 90).toISOString(), $lte : subDays(new Date(), 30).toISOString()}}).fetch()
            }, {
                label: '3 - 6 mths',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 120).toISOString(), $lte : subDays(new Date(), 90).toISOString()}}).fetch()
            }, {
                label: '6 - 12 mths',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 365).toISOString(), $lte : subDays(new Date(), 120).toISOString()}}).fetch()
            }, {
                label: '1 - 2 yrs',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 730).toISOString(), $lte : subDays(new Date(), 365).toISOString()}}).fetch()
            }, {     
                label: '2 - 3 yrs',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 1095).toISOString(), $lte : subDays(new Date(), 730).toISOString()}}).fetch()
            }, {                             
                label: '3 - 4 yrs',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $gt :  subDays(new Date(), 1460).toISOString(), $lte : subDays(new Date(), 1095).toISOString()}}).fetch()
            }, {
                label: '4 yr+',
                repositories: cfgRepositories.find({...query, 'updatedAt':{ $lt :  subDays(new Date(), 1460).toISOString()}}).fetch()
            }];
            this.setStatsUpdatedSince(updatedSince);

            const pushedSince = [{
                label: '0 - 1 d',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt : subDays(new Date(), 1).toISOString()}}).fetch()
            }, {
                label: '1 - 7 d',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 7).toISOString(), $lte : subDays(new Date(), 1).toISOString()}}).fetch()
            }, {
                label: '1 - 2 wks',
                repositories: cfgIssues.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 14).toISOString(), $lte : subDays(new Date(), 7).toISOString()}}).fetch()
            }, {
                label: '2 - 4 wks',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 30).toISOString(), $lte : subDays(new Date(), 14).toISOString()}}).fetch()
            }, {
                label: '1 - 3 mths',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 90).toISOString(), $lte : subDays(new Date(), 30).toISOString()}}).fetch()
            }, {
                label: '3 - 6 mths',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 120).toISOString(), $lte : subDays(new Date(), 90).toISOString()}}).fetch()
            }, {
                label: '6 - 12 mths',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 365).toISOString(), $lte : subDays(new Date(), 120).toISOString()}}).fetch()
            }, {
                label: '1 - 2 yrs',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 730).toISOString(), $lte : subDays(new Date(), 365).toISOString()}}).fetch()
            }, {     
                label: '2 - 3 yrs',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 1095).toISOString(), $lte : subDays(new Date(), 730).toISOString()}}).fetch()
            }, {                             
                label: '3 - 4 yrs',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $gt :  subDays(new Date(), 1460).toISOString(), $lte : subDays(new Date(), 1095).toISOString()}}).fetch()
            }, {
                label: '4 yr+',
                repositories: cfgRepositories.find({...query, 'pushedAt':{ $lt :  subDays(new Date(), 1460).toISOString()}}).fetch()                
            }];
            this.setStatsPushedSince(pushedSince);            

            var t1 = performance.now();
            log.info("refreshBins - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshIssuesPresent(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const issuesPresent = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'issues.totalCount':{ $gt : 0}}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'issues.totalCount':{ $eq : 0}}}).fetch()
            }];
            this.setStatsIssuesPresent(issuesPresent);

            var t1 = performance.now();
            log.info("refreshIssuesPresent - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshPullRequestsPresent(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const isPresent = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'pullRequests.totalCount':{ $gt : 0}}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'pullRequests.totalCount':{ $eq : 0}}}).fetch()
            }];
            this.setStatsPullRequestsPresent(isPresent);

            var t1 = performance.now();
            log.info("refreshPullRequestsPresent - took " + (t1 - t0) + " milliseconds.");
        },        

        async refreshReleasesPresent(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const isPresent = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'releases.totalCount':{ $gt : 0}}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'releases.totalCount':{ $eq : 0}}}).fetch()
            }];
            this.setStatsReleasesPresent(isPresent);

            var t1 = performance.now();
            log.info("refreshReleasesPresent - took " + (t1 - t0) + " milliseconds.");
        },  

        async refreshProjectsPresent(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const isPresent = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'projects.totalCount':{ $gt : 0}}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'projects.totalCount':{ $eq : 0}}}).fetch()
            }];
            this.setStatsProjectsPresent(isPresent);

            var t1 = performance.now();
            log.info("refreshProjectsPresent - took " + (t1 - t0) + " milliseconds.");
        },          

        async refreshMilestonesPresent(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const isPresent = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'milestones.totalCount':{ $gt : 0}}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'milestones.totalCount':{ $eq : 0}}}).fetch()
            }];
            this.setStatsMilestonesPresent(isPresent);

            var t1 = performance.now();
            log.info("refreshMilestonesPresent - took " + (t1 - t0) + " milliseconds.");
        },   

        async refreshTeamsPresent(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const isPresent = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'teams.totalCount':{ $gt : 0}}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query}).fetch().filter(r => r.teams === undefined || r.teams.totalCount === 0)
            }];
            this.setStatsTeamsPresent(isPresent);

            var t1 = performance.now();
            log.info("refreshTeamsPresent - took " + (t1 - t0) + " milliseconds.");
        },           

        async refreshBranchProtectionPresent(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const isPresent = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'branchProtectionRules.totalCount':{ $gt : 0}}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'branchProtectionRules.totalCount':{ $eq : 0}}}).fetch()
            }];
            this.setStatsBranchProtectionPresent(isPresent);

            var t1 = performance.now();
            log.info("refreshMilestonesPresent - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshIsFork(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const isFork = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'isFork': true}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'isFork': false}}).fetch()
            }];
            this.setStatsIsFork(isFork);

            var t1 = performance.now();
            log.info("refreshIsFork - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshIsPrivate(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const dataset = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'isPrivate': true}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'isPrivate': false}}).fetch()
            }];
            this.setStatsIsPrivate(dataset);

            var t1 = performance.now();
            log.info("refreshIsPrivate - took " + (t1 - t0) + " milliseconds.");
        },

        async refreshHasCodeOfConduct(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const hasCodeOfConduct = [{
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'codeOfConduct': null}}).fetch()
            }, {
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'codeOfConduct': {$ne:null}}}).fetch()
            }];
            this.setStatsHasCodeOfConduct(hasCodeOfConduct);

            var t1 = performance.now();
            log.info("refreshHasCodeOfConduct - took " + (t1 - t0) + " milliseconds.");
        },
        async refreshHasDescription(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const hasDescription = [{
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'description': null}}).fetch()
            }, {
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'description': {$ne:null}}}).fetch()
            }];
            this.setStatsHasDescription(hasDescription);

            var t1 = performance.now();
            log.info("refreshHasDescription - took " + (t1 - t0) + " milliseconds.");
        },
        async refreshHasIssuesEnabled(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const dataset = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'hasIssuesEnabled': true}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'hasIssuesEnabled': false}}).fetch()
            }];
            this.setStatsHasIssuesEnabled(dataset);

            var t1 = performance.now();
            log.info("refreshHasIssuesEnabled - took " + (t1 - t0) + " milliseconds.");
        },   
        async refreshHasWikiEnabled(payload, rootState) {
            const log = rootState.global.log;
            let t0 = performance.now();
            const query = rootState.repositoriesView.query;

            const dataset = [{
                name: 'Yes',
                color: '#2196f3',
                repositories: cfgRepositories.find({...query, ...{'hasWikiEnabled': true}}).fetch()
            }, {
                name: 'No',
                color: '#e0e0e0',
                repositories: cfgRepositories.find({...query, ...{'hasWikiEnabled': false}}).fetch()
            }];
            this.setStatsHasWikiEnabled(dataset);

            var t1 = performance.now();
            log.info("refreshHasWikiEnabled - took " + (t1 - t0) + " milliseconds.");
        },               
    }
};
