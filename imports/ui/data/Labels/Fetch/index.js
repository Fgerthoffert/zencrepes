import React, { Component } from 'react';

import Data from './Data.js';

class LabelsFetch extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <React.Fragment>
                <Data />
            </React.Fragment>
        );
    }
}

export default LabelsFetch;
