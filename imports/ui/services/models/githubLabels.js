export default {
    state: {
        loadFlag: false,        // Flag to indicate the data should be reloaded
        loading: false,         // Data is currently loading
        loadedCount: 0,         // Count of items actually loaded
        loadedCountBuffer: 0,   // Count of items that will be loaded in next increment
        totalCount: 0,          // Total number of items that should be loaded
        maxPoints: 13,          // Upper limit for story points
        color: '#ff1a1a',         // Color configuration for the labels
    },
    reducers: {
        setLoading(state, payload) {return { ...state, loading: payload };},
        setLoadFlag(state, payload) {return { ...state, loadFlag: payload };},
        setLoadedCount(state, payload) {return { ...state, loadedCount: payload };},
        setLoadedCountBuffer(state, payload) {return { ...state, loadedCountBuffer: payload };},
        setTotalCount(state, payload) {return { ...state, totalCount: payload };},
        setMaxPoints(state, payload) {return { ...state, maxPoints: payload };},
        setColor(state, payload) {return { ...state, color: payload };},

        incrementLoadedCount(state, payload) {return { ...state, loadedCount: state.loadedCount + payload };},
        incrementLoadedCountBuffer(state, payload) {return { ...state, loadedCountBuffer: state.loadedCountBuffer + payload };},
    },
    effects: {

    }
};