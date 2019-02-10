import _ from 'lodash';

import { cfgMilestones, cfgIssues, cfgSources } from "../../../data/Minimongo.js";

import {
    getAssigneesRepartition,
    getAssignees,
    getRepositories,
    getRepositoriesRepartition,
    getLabelsRepartition,
} from "../../../utils/repartition/index.js";

import {
    getFirstDay,
    getLastDay,
    initObject,
    populateClosed,
    populateObject,
    populateOpen,
    populateTicketsPerDay,
    populateTicketsPerWeek
} from "../../../utils/velocity/index.js";

export default {
    state: {
        query: {},
        sprints: [],
        selectedSprintTitle: null,
        selectedSprintDescription: null,
        selectedSprintDueDate: null,

        assignees: [],
        availableAssignees: [],
        filteredAvailableAssignees: [],
        availableAssigneesFilter: '',
        openAddAssignee: false,

        repositories: [],
        availableRepositories: [],
        filteredAvailableRepositories: [],
        availableRepositoryFilter: '',
        openAddRepository: false,
        addReposAvailable: [],
        addReposSelected: [],
        allRepos: [],           //All repos, unfiltered

        labels: [],

        issues: [],

        milestones: [],

        velocity: {},
    },
    reducers: {
        setQuery(state, payload) {return { ...state, query: payload };},

        setSprints(state, payload) {return { ...state, sprints: payload };},
        setSelectedSprintTitle(state, payload) {return { ...state, selectedSprintTitle: payload };},
        setSelectedSprintDescription(state, payload) {return { ...state, selectedSprintDescription: payload };},
        setSelectedSprintDueDate(state, payload) {return { ...state, selectedSprintDueDate: payload };},

        setAssignees(state, payload) {return { ...state, assignees: JSON.parse(JSON.stringify(payload)) };},
        setOpenAddAssignee(state, payload) {return { ...state, openAddAssignee: payload };},
        setAvailableAssignees(state, payload) {return { ...state, availableAssignees: JSON.parse(JSON.stringify(payload))};},
        setFilteredAvailableAssignees(state, payload) {return { ...state, filteredAvailableAssignees: JSON.parse(JSON.stringify(payload)) };},
        setAvailableAssigneesFilter(state, payload) {return { ...state, availableAssigneesFilter: payload };},

        setRepositories(state, payload) {return { ...state, repositories: JSON.parse(JSON.stringify(payload)) };},
        setOpenAddRepository(state, payload) {return { ...state, openAddRepository: payload };},
        setAvailableRepositories(state, payload) {return { ...state, availableRepositories: JSON.parse(JSON.stringify(payload))};},
        setFilteredAvailableRepositories(state, payload) {return { ...state, filteredAvailableRepositories: JSON.parse(JSON.stringify(payload)) };},
        setAvailableRepositoriesFilter(state, payload) {return { ...state, availableRepositoriesFilter: payload };},

        setAddReposAvailable(state, payload) {return { ...state, addReposAvailable: payload };},
        setAddReposSelected(state, payload) {return { ...state, addReposSelected: payload };},
        setAllRepos(state, payload) {return { ...state, allRepos: payload };},

        setIssues(state, payload) {return { ...state, issues: JSON.parse(JSON.stringify(payload)) };},

        setMilestones(state, payload) {return { ...state, milestones: JSON.parse(JSON.stringify(payload)) };},

        setVelocity(state, payload) {return { ...state, velocity: payload };},

        setLabels(state, payload) {return { ...state, labels: payload };},
    },
    effects: {
        async updateQuery(query, rootState) {
            this.setQuery(query);
            // Generate available sprints based on query, removing milestone title
            let sprintsQuery = JSON.parse(JSON.stringify(query)); //TODO - Replace this with something better to copy object ?
            if (sprintsQuery['title'] !== undefined) {
                delete sprintsQuery['title'];
            }

            const sprints = Object.keys(_.groupBy(cfgMilestones.find({'state':{'$in':['OPEN']}}).fetch(), 'title')).sort();
            this.setSprints(sprints);

            // If there was no sprint selected, if the query is blank, automatically select the first sprint in the array of sprints
            if (rootState.sprintsView.selectedSprintTitle === null && sprints[0] !== undefined && query === {}) {
                this.setSelectedSprintTitle(sprints[0]);
            }

            if (query.title !== undefined) {
                const currentMilestone = cfgMilestones.findOne(query);
                if (currentMilestone.title !== undefined) {
                    this.setSelectedSprintTitle(currentMilestone.title);
                    this.updateView();
                }
            }
        },

        async updateView(payload, rootState) {
            let selectedSprintTitle = rootState.sprintsView.selectedSprintTitle;
            let currentSprintFilter = {'milestone.title':{'$in':[selectedSprintTitle]}};

            // Create an array of assignees involved in a particular sprint
            let assignees = getAssigneesRepartition(cfgIssues.find(currentSprintFilter).fetch());
            this.setAssignees(assignees);

            let allAssignees = getAssignees(cfgIssues.find({}).fetch());
            let assigneesDifference = _.differenceBy(allAssignees, assignees, 'id');
            this.setAvailableAssignees(assigneesDifference);
            this.setFilteredAvailableAssignees(assigneesDifference);
            this.setAvailableAssigneesFilter('');

            let repositories = getRepositoriesRepartition(cfgMilestones.find({'title':{'$in':[selectedSprintTitle]}}).fetch(), cfgIssues.find(currentSprintFilter).fetch());
            this.setRepositories(repositories);
            this.setMilestones(repositories);

            let labels = getLabelsRepartition(cfgIssues.find(currentSprintFilter).fetch());
            this.setLabels(labels);

            let allRepositories = getRepositories(cfgIssues.find({}).fetch());
            let repositoriesDifference = _.differenceBy(allRepositories, repositories, 'id');
            this.setAvailableRepositories(repositoriesDifference);
            this.setFilteredAvailableRepositories(repositoriesDifference);
            this.setAvailableRepositoriesFilter('');

            if (selectedSprintTitle !== null) {
                this.setIssues(cfgIssues.find({'milestone.title':{'$in':[selectedSprintTitle]}}).fetch());
            }

            this.updateVelocity(assignees);

            this.updateDescriptionDate();

            this.updateAvailableRepos();

            this.updateAvailableSprints();
        },

        async initView() {
            this.refreshSprints();

            const allRepos = cfgSources.find({active: true}).fetch();
            this.setAllRepos(allRepos);

            this.updateView();
        },
        async refreshSprints() {
            let sprints = Object.keys(_.groupBy(cfgMilestones.find({'state':{'$in':['OPEN']}}).fetch(), 'title')).sort();
//            let sprints = Object.keys(_.groupBy(cfgMilestones.find({}).fetch(), 'title')).sort();
            this.setSprints(sprints);
            this.updateSelectedSprint(sprints[0]);
        },

        async updateAvailableSprints() {
            let sprints = Object.keys(_.groupBy(cfgMilestones.find({'state':{'$in':['OPEN']}}).fetch(), 'title')).sort();
//            let sprints = Object.keys(_.groupBy(cfgMilestones.find({}).fetch(), 'title')).sort();
            this.setSprints(sprints);
        },

        async updateSelectedSprint(selectedSprintTitle) {
            await this.setSelectedSprintTitle(selectedSprintTitle);
            this.updateView();
        },

        async addRepoUpdateSelected(selectedRepos) {
            this.setAddReposSelected(selectedRepos);
        },

        async updateAvailableRepos(payload, rootState) {
            const selectedSprintTitle = rootState.sprintsView.selectedSprintTitle;
            const milestones = cfgMilestones.find({'title':{'$in':[selectedSprintTitle]}}).fetch()
            const includedRepos = milestones.map((ms) => ms.repo);
            const allRepos = cfgSources.find({active: true}).fetch();
            const availableRepos = _.differenceBy(allRepos, includedRepos, 'id');
            this.setAddReposAvailable(availableRepos.map((repo) => {
                return {
                    value: repo.id,
                    label: repo.org.login + "/" + repo.name
                }
            }));
        },



        async updateVelocity(assignees, rootState) {
            //Build velocity based on past assignees performance
            let currentSprintFilter = {'state': { $eq : 'OPEN' }, 'milestone.title':{'$in':[rootState.sprintsView.selectedSprintTitle]}};

            let assigneesLogin = assignees.map((assignee) => assignee.login);
            let closedIssuesFilter = {'state': { $eq : 'CLOSED' },'assignees.edges':{'$elemMatch':{'node.login':{'$in':assigneesLogin}}}};
            //let closedIssues = cfgIssues.find(closedIssuesFilter).fetch()

            let firstDay = getFirstDay(closedIssuesFilter, cfgIssues);
            let lastDay = getLastDay(closedIssuesFilter, cfgIssues);

            let dataObject = initObject(firstDay, lastDay); // Build an object of all days and weeks between two dates
            dataObject = populateObject(dataObject, cfgIssues.find(closedIssuesFilter).fetch()); // Populate the object with count of days and weeks
            dataObject = populateOpen(dataObject, cfgIssues.find(currentSprintFilter).fetch()); // Populate remaining issues count and remaining points
            dataObject = populateClosed(dataObject, cfgIssues.find(closedIssuesFilter).fetch()); // Populate closed issues count and points
            dataObject = populateTicketsPerDay(dataObject);
            dataObject = populateTicketsPerWeek(dataObject);

            this.setVelocity(dataObject);
        },

        async updateDescriptionDate(payload, rootState) {
            /*
            this.setSelectedSprintDescription('# Live demo\n' +
                '\n' +
                'Changes are automatically rendered as you type.\n' +
                '\n' +
                '* Implements [GitHub Flavored Markdown](https://github.github.com/gfm/)\n' +
                '* Renders actual, "native" React DOM elements\n' +
                '* Allows you to escape or skip HTML (try toggling the checkboxes above)\n' +
                '* If you escape or skip the HTML, no `dangerouslySetInnerHTML` is used! Yay!\n' +
                '\n');
                */
            if (rootState.sprintsView.milestones[0] !== undefined) {
                this.setSelectedSprintDescription(rootState.sprintsView.milestones[0].description);
            } else {
                this.setSelectedSprintDescription(null);
            }
            if (rootState.sprintsView.milestones[0] !== undefined) {
                this.setSelectedSprintDueDate(rootState.sprintsView.milestones[0].dueOn);
            } else {
                this.setSelectedSprintDueDate(null);
            }
        },

        async updateAvailableAssigneesFilter(payload, rootState) {
            this.setAvailableAssigneesFilter(payload);
            let filteredSet = _.filter(rootState.sprintsView.availableAssignees, function(assignee) {
                if (assignee.name !== null) {
                    if (assignee.name.toLowerCase().indexOf(payload.toLowerCase()) !== -1) {return true;}
                }
                else if (assignee.login.toLowerCase().indexOf(payload.toLowerCase()) !== -1) {return true;}
                else {return false;}
            });
            this.setFilteredAvailableAssignees(filteredSet);
        },

        async addAssignee(payload, rootState) {
            let currentAssignees = rootState.sprintsView.assignees;
            currentAssignees.push(payload);
            this.setAssignees(currentAssignees);

            let allAssignees = getAssignees(cfgIssues.find({}).fetch());
            let assigneesDifference = _.differenceBy(allAssignees, currentAssignees, 'id');
            this.setAvailableAssignees(assigneesDifference);

            this.updateAvailableAssigneesFilter(rootState.sprintsView.availableAssigneesFilter);

            this.updateVelocity(currentAssignees);
        },

        async updateAvailableRepositoriesFilter(payload, rootState) {
            this.setAvailableRepositoriesFilter(payload);
            let filteredSet = _.filter(rootState.sprintsView.availableRepositories, function(repository) {
                if (repository.name.toLowerCase().indexOf(payload.toLowerCase()) !== -1) {return true;}
                else if (repository.org.login.toLowerCase().indexOf(payload.toLowerCase()) !== -1) {return true;}
                else {return false;}
            });
            this.setFilteredAvailableRepositories(filteredSet);
        },

        async addRepository(payload, rootState) {
            let currentRepositories = rootState.sprintsView.repositories;
            currentRepositories.push(payload);
            this.setRepositories(currentRepositories);

            let allRepositories = getRepositories(cfgIssues.find({}).fetch());
            let repositoriesDifference = _.differenceBy(allRepositories, currentRepositories, 'id');
            this.setAvailableRepositories(repositoriesDifference);

            this.updateAvailableRepositoriesFilter(rootState.sprintsView.availableRepositoriesFilter);

            this.updateVelocity(currentRepositories);
        },

    }
};
