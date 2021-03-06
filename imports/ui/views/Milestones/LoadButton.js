import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {connect} from "react-redux";

import Button from '@material-ui/core/Button';

const styles = {
    root: {
        textAlign: 'right'
    },
};
class LoadButton extends Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    loadMilestones = () => {
        const { setLoadFlag } = this.props;
        setLoadFlag(true);
    };

    render() {
        const { classes, loading } = this.props;

        return (
            <div className={classes.root}>
                {!loading &&
                <div>
                    <Button variant="contained" color="primary" className={classes.button} onClick={this.loadMilestones}>
                        Load/Refresh Milestones
                    </Button>
                </div>
                }
            </div>
        );
    }
}

LoadButton.propTypes = {
    classes: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    setLoadFlag: PropTypes.func.isRequired,
};

const mapState = state => ({
    loading: state.milestonesFetch.loading,
});

const mapDispatch = dispatch => ({
    setLoadFlag: dispatch.milestonesFetch.setLoadFlag,
});

export default connect(mapState, mapDispatch)(withStyles(styles)(LoadButton));
