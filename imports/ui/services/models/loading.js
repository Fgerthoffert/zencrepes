export default {
    state: {
        loading: false,             // Flag indicating something is loading
        loadingMsg: '',             // Message to be displayed in the modal or the snackbar
        loadingMsgAlt: '',          // Alternative message (2nd line) to be displayed in the modal or the snackbar
        loadingModal: true,         // True to display a modal, false to display a snackbar
        loadingIterateCurrent: 0,   // For progressbar, current count
        loadingIterateTotal: 0,     // For progressbar, maximum count
        loadingSuccess: false,      // Flag indicating if loading was successful
        loadingSuccessMsg:'',       // Message to be displayed at the end of loading (successful or not)

        onSuccess: () => {},        // Function to be executed on load Success
        onCancel: () => {},         // Function to be executed on load Cancel
        onFailure: () => {},        // Function to be executed on load Failure
    },
    reducers: {
        setLoading(state, payload) {return { ...state, loading: payload };},
        setLoadingMsg(state, payload) {return { ...state, loadingMsg: payload };},
        setLoadingMsgAlt(state, payload) {return { ...state, loadingMsgAlt: payload };},
        setLoadingModal(state, payload) {return { ...state, loadingModal: payload };},
        setLoadingIterateCurrent(state, payload) {return { ...state, loadingIterateCurrent: payload };},
        incLoadingIterateCurrent(state, payload) {return { ...state, loadingIterateCurrent: state.loadingIterateCurrent + payload };},
        setLoadingIterateTotal(state, payload) {return { ...state, loadingIterateTotal: payload };},
        setLoadingSuccess(state, payload) {return { ...state, loadingSuccess: payload };},
        setLoadingSuccessMsg(state, payload) {return { ...state, loadingSuccessMsg: payload };},

        setOnSuccess(state, payload) {return { ...state, onSuccess: payload };},
        setOnCancel(state, payload) {return { ...state, onCancel: payload };},
        setOnFailure(state, payload) {return { ...state, onFailure: payload };},
    },
    effects: {
        async cancelLoading() {
            this.setLoading(false);
            this.setLoadingMsg('');
        },

        async resetLoading() {
            this.setLoading(false);
            this.setLoadingMsg('');
            this.setLoadingMsgAlt('');
            this.setLoadingModal(true);
            this.setLoadingIterateCurrent(0);
            this.loadingIterateTotal(0);
            this.setLoadingSuccess(false);
            this.setLoadingSuccessMsg('');
        }
    }
};
