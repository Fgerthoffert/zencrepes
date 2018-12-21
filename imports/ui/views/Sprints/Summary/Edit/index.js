import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Moment from 'react-moment';
import ReactMarkdown from 'react-markdown';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

import SprintDescription from './SprintDescription.js';
import SprintDueDate from './SprintDueDate.js';
import SprintTitle from './SprintTitle.js';

import CancelButton from './CancelButton.js';
import SaveButton from './SaveButton.js';

const styles = theme => ({
    root: {
        width: '100%',
    }
});

class Edit extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            classes,
        } = this.props;

        return (
            <div className={classes.root}>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={8}
                >
                    <Grid item xs={12} sm container>
                        <SprintTitle />
                    </Grid>
                    <Grid item >
                        <SprintDueDate />
                    </Grid>
                </Grid>
                <SprintDescription />
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={8}
                >
                    <Grid item xs={12} sm container>
                    </Grid>
                    <Grid item >
                        <CancelButton />
                        <SaveButton />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

Edit.propTypes = {
    classes: PropTypes.object,
};

export default withStyles(styles)(Edit);