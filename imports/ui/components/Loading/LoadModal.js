import React, { Component } from 'react';

import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import LoadMessage from './LoadMessage.js';

class LoadModal extends Component {
    constructor (props) {
        super(props);
    }

    cancel = () => {
        const { cancelLoading } = this.props;
        cancelLoading();
    };

    render() {
        const { loadingTitle } = this.props;

        return (
            <Dialog aria-labelledby="simple-dialog-title" open={true} fullWidth={true} maxWidth="sm">
                <DialogTitle id="simple-dialog-title">
                    {loadingTitle === null ? (
                        <React.Fragment>Loading ...</React.Fragment>
                    ) : (
                        <React.Fragment>{loadingTitle}</React.Fragment>
                    )}
                </DialogTitle>
                <DialogContent>
                    <LoadMessage />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.cancel} color="primary" autoFocus>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

LoadModal.propTypes = {
    loadingTitle: PropTypes.string,
    cancelLoading: PropTypes.func.isRequired,
};

export default LoadModal;
