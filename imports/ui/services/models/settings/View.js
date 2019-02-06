import {
    cfgSources,
    cfgLabels,
    cfgMilestones,
    cfgIssues
} from '../../../data/Minimongo.js';

export default {
    state: {
        selectedRepos: [],
        availableRepos: [],

        orgCountTotal: 0,
        orgCountSelected: 0,
        issuesCountTotal: 0,
        issuesCountSelected: 0,
        issuesCountLoaded: 0,
        labelsCountTotal: 0,
        labelsCountSelected: 0,
        labelsCountLoaded: 0,
        milestonesCountTotal: 0,
        milestonesCountSelected: 0,
        milestonesCountLoaded: 0,
    },
    reducers: {
        setSelectedRepos(state, payload) {return { ...state, selectedRepos: payload };},
        setAvailableRepos(state, payload) {return { ...state, availableRepos: payload };},

        setOrgCountTotal(state, payload) {return { ...state, orgCountTotal: payload };},
        setOrgCountSelected(state, payload) {return { ...state, orgCountSelected: payload };},
        setIssuesCountTotal(state, payload) {return { ...state, issuesCountTotal: payload };},
        setIssuesCountSelected(state, payload) {return { ...state, issuesCountSelected: payload };},
        setIssuesCountLoaded(state, payload) {return { ...state, issuesCountLoaded: payload };},
        setLabelsCountTotal(state, payload) {return { ...state, labelsCountTotal: payload };},
        setLabelsCountSelected(state, payload) {return { ...state, labelsCountSelected: payload };},
        setLabelsCountLoaded(state, payload) {return { ...state, labelsCountLoaded: payload };},
        setMilestonesCountTotal(state, payload) {return { ...state, milestonesCountTotal: payload };},
        setMilestonesCountSelected(state, payload) {return { ...state, milestonesCountSelected: payload };},
        setMilestonesCountLoaded(state, payload) {return { ...state, milestonesCountLoaded: payload };},
    },

    effects: {
        async initView(payload, rootState) {
            console.log('initView');
            this.setSelectedRepos(cfgSources.find({active: true}).fetch());
            this.setAvailableRepos(cfgSources.find({}).fetch());

            this.updateCounts();
//            this.setMilestones(cfgMilestones.find(rootState.milestonesView.query).fetch());
        },

        async updateCounts(payload, rootState) {
            const log = rootState.global.log;
            const t0 = performance.now();

            const availableRepos = cfgSources.find({}).fetch();
            const selectedRepos = cfgSources.find({active: true}).fetch();

            this.setOrgCountTotal(Object.keys(_.groupBy(availableRepos, 'org.login')).length);
            this.setOrgCountSelected(Object.keys(_.groupBy(selectedRepos, 'org.login')).length);

            this.setIssuesCountTotal(availableRepos.map(repo => repo.issues.totalCount).reduce((acc, count) => acc + count, 0));
            this.setIssuesCountSelected(selectedRepos.map(repo => repo.issues.totalCount).reduce((acc, count) => acc + count, 0));
            this.setIssuesCountLoaded(cfgIssues.find().count());
            this.setLabelsCountTotal(availableRepos.map(repo => repo.labels.totalCount).reduce((acc, count) => acc + count, 0));
            this.setLabelsCountSelected(selectedRepos.map(repo => repo.labels.totalCount).reduce((acc, count) => acc + count, 0));
            this.setLabelsCountLoaded(cfgLabels.find().count());
            this.setMilestonesCountTotal(availableRepos.map(repo => repo.milestones.totalCount).reduce((acc, count) => acc + count, 0));
            this.setMilestonesCountSelected(selectedRepos.map(repo => repo.milestones.totalCount).reduce((acc, count) => acc + count, 0));
            this.setMilestonesCountLoaded(cfgMilestones.find().count());

            const t1 = performance.now();
            log.info("updateCounts - took " + (t1 - t0) + " milliseconds.");

        }
    }
};

