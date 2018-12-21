import _ from 'lodash';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {connect} from "react-redux";

import Snackbar from "@material-ui/core/Snackbar";

import LoadMessage from './LoadMessage.js';

const styles = theme => ({
    root: {
    },
});
class LoadSnackbar extends Component {
    constructor (props) {
        super(props);
    }

    render() {
        const { classes, verifying, verifyingMsg } = this.props;

        return (
            <div className={classes.root}>
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    open={verifying}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={
                        <LoadMessage
                            message={verifyingMsg}
                        />
                    }
                />
            </div>
        );
    };
}

LoadSnackbar.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapState = state => ({
    verifying: state.issuesEdit.verifying,
    verifyingMsg: state.issuesEdit.verifyingMsg,
});

const mapDispatch = dispatch => ({

});

export default connect(mapState, mapDispatch)(withStyles(styles)(LoadSnackbar));