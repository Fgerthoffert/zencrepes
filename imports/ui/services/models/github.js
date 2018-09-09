
export default {
    state: {
        totalOrgs: 0,
        totalRepos: 0,
        totalIssues: 0,
        totalLabels: 0,
        selectedOrgs: 0,
        selectedRepos: 0,
        selectedIssues: 0,
        selectedLabels: 0,
        loadedOrgs: 0,
        loadedRepos: 0,
        loadedIssues: 0,
        loadedIssuesBuffer: 0, // Only used for the progress bar buffer value
        loadedLabels: 0,
        loadedLabelsBuffer: 0, // Only used for the progress bar buffer value


        unfilteredIssues: 0,
        totalLoading: false,
        issuesLoading: false,           // Boolean to indicate issues are currently loading
        loadIssues: false,              // Boolean to trigger issue load
        labelsLoading: false,           // Boolean to indicate issues are currently loading
        loadLabels: false,              // Boolean to trigger issue load
    },
    reducers: {
        //Total are the overall items available to a user
        setTotalRepos(state, payload) {
            return { ...state, totalRepos: payload };
        },
        setTotalIssues(state, payload) {
            return { ...state, totalIssues: payload };
        },
        setTotalLabels(state, payload) {
            return { ...state, totalLabels: payload };
        },
        setTotalOrgs(state, payload) {
            return { ...state, totalOrgs: payload };
        },

        //Selected are the total items selected by a user for load
        setSelectedOrgs(state, payload) {
            return { ...state, selectedOrgs: payload };
        },
        incrementSelectedOrgs(state, payload) {
            return { ...state, selectedOrgs: state.selectedOrgs + payload };
        },
        setSelectedRepos(state, payload) {
            return { ...state, selectedRepos: payload };
        },
        incrementSelectedRepos(state, payload) {
            return { ...state, selectedRepos: state.selectedRepos + payload };
        },
        setSelectedIssues(state, payload) {
            return { ...state, selectedIssues: payload };
        },
        incrementSelectedIssues(state, payload) {
            return { ...state, selectedIssues: state.selectedIssues + payload };
        },
        setSelectedLabels(state, payload) {
            return { ...state, selectedLabels: payload };
        },
        incrementSelectedLabels(state, payload) {
            return { ...state, selectedLabels: state.selectedLabels + payload };
        },

        //Loaded are the total items actually loaded from GitHub
        setLoadedOrgs(state, payload) {
            return { ...state, loadedOrgs: payload };
        },
        incrementLoadedRepos(state, payload) {
            return { ...state, loadedRepos: state.loadedRepos + payload };
        },
        setLoadedRepos(state, payload) {
            return { ...state, loadedRepos: payload };
        },
        incrementLoadedIssues(state, payload) {
            return { ...state, loadedIssues: state.loadedIssues + payload };
        },
        incrementLoadedIssuesBuffer(state, payload) {
            return { ...state, loadedIssuesBuffer: state.loadedIssuesBuffer + payload };
        },
        setLoadedIssues(state, payload) {
            return { ...state, loadedIssues: payload };
        },
        setLoadedIssuesBuffer(state, payload) {
            return { ...state, loadedIssuesBuffer: payload };
        },
        incrementLoadedLabels(state, payload) {
            return { ...state, loadedLabels: state.loadedLabels + payload };
        },
        incrementLoadedLabelsBuffer(state, payload) {
            return { ...state, loadedLabelsBuffer: state.loadedLabelsBuffer + payload };
        },
        setLoadedLabels(state, payload) {
            return { ...state, loadedLabels: payload };
        },
        setLoadedLabelsBuffer(state, payload) {
            return { ...state, loadedLabelsBuffer: payload };
        },

        incrementTotalOrgs(state, payload) {
            return { ...state, totalOrgs: state.totalOrgs + payload };
        },
        incrementTotalRepos(state, payload) {
            return { ...state, totalRepos: state.totalRepos + payload };
        },
        incrementTotalIssues(state, payload) {
            return { ...state, totalIssues: state.totalIssues + payload };
        },
        incrementUnfilteredIssues(state, payload) {
            return { ...state, totalIssues: state.unfilteredIssues + payload };
        },
        incrementTotalLabels(state, payload) {
            return { ...state, totalLabels: state.totalLabels + payload };
        },
        updateTotalLoading(state, payload) {
            return { ...state, totalLoading: payload };
        },
        updateIssuesLoading(state, payload) {
            return { ...state, issuesLoading: payload };
        },
        setLoadIssues(state, payload) {
            return { ...state, loadIssues: payload };
        },
        setIssuesLoading(state, payload) {
            return { ...state, issuesLoading: payload };
        },
        updateLabelsLoading(state, payload) {
            return { ...state, issuesLoading: payload };
        },
        setLoadLabels(state, payload) {
            return { ...state, loadLabels: payload };
        },
        setLabelsLoading(state, payload) {
            return { ...state, labelsLoading: payload };
        },

        setLoadRepositories(state, payload) {
            return { ...state, loadRepositories: payload };
        },
        setRepositoriesLoading(state, payload) {
            return { ...state, issuesLoading: payload };
        },
    },
    effects: {

    }
};