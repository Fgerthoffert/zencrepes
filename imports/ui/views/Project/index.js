import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
import PropTypes from "prop-types";

import Grid from '@material-ui/core/Grid';

import General from '../../layouts/General/index.js';
import IssuesFetch from '../../data/Issues/Fetch/index.js';
import IssuesEdit from '../../data/Issues/Edit/index.js';

import Actions from './Actions/index.js';

import CurrentCompletion from "./CurrentCompletion/index.js";
import RemainingPoints from "./RemainingPoints/index.js";
import DaysToCompletion from "./DaysToCompletion/index.js";
import Burndown from "./Burndown/index.js";
import VelocityWeeks from "./VelocityWeeks/index.js";
import Issues from "./Issues/index.js";

import Assignees from "./Assignees/index.js";
import Milestones from "./Milestones/index.js";
import Labels from "./Labels/index.js";
import Columns from "./Columns/index.js";
import Summary from "./Summary/index.js";

class Project extends Component {
    constructor(props) {
        super(props);
    }

    //https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
    componentDidMount() {
        const { updateQuery } = this.props;
        const params = new URLSearchParams(this.props.location.search);
        const queryUrl = params.get('q');
        if (queryUrl === null) {
            updateQuery({});
        } else {
            updateQuery(JSON.parse(queryUrl));
        }
    }

    componentDidUpdate(prevProps) {
        const { updateQuery } = this.props;
        const params = new URLSearchParams(this.props.location.search);
        const queryUrl = params.get('q');

        const oldParams = new URLSearchParams(prevProps.location.search);
        const oldQueryUrl = oldParams.get('q');

        if (queryUrl !== oldQueryUrl) {
            updateQuery(JSON.parse(queryUrl));
        }
    }

    render() {
        const { issues, assignees, burndown, velocity, defaultPoints, projects } = this.props;
        return (
            <General>
                <Actions />
                <IssuesFetch />
                <IssuesEdit />
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={8}
                >
                    <Grid item xs={12} sm={12} md={12}>
                        <Summary projects={projects}/>
                    </Grid>
                </Grid>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={8}
                >
                    <Grid item xs={12} sm={6} md={4}>
                        <CurrentCompletion
                            issues={issues}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <RemainingPoints
                            assignees={assignees}
                            issues={issues}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <DaysToCompletion />
                    </Grid>
                </Grid>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={8}
                >
                    <Grid item xs={12} sm={6} md={6}>
                        <Burndown
                            burndown={burndown}
                            defaultPoints={defaultPoints}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={6}>
                        <VelocityWeeks
                            velocity={velocity}
                            defaultPoints={defaultPoints}
                        />
                    </Grid>
                </Grid>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={8}
                >
                    <Grid item xs={12} sm={12} md={12}>
                        <Issues />
                    </Grid>
                </Grid>
                <Grid
                    container
                    direction="row"
                    justify="flex-start"
                    alignItems="flex-start"
                    spacing={8}
                >
                    <Grid item xs={12} sm={6} md={3}>
                        <Assignees />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Columns />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Milestones />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Labels />
                    </Grid>
                </Grid>
            </General>
        );
    }
}

Project.propTypes = {
    assignees: PropTypes.array.isRequired,
    issues: PropTypes.array.isRequired,
    velocity: PropTypes.object.isRequired,
    burndown: PropTypes.object.isRequired,
    defaultPoints: PropTypes.bool.isRequired,

    initView: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    projects: PropTypes.array.isRequired,
    updateQuery: PropTypes.func.isRequired,
};

const mapState = state => ({
    assignees: state.projectView.assignees,
    issues: state.projectView.issues,
    velocity: state.projectView.velocity,
    burndown: state.projectView.burndown,
    projects: state.projectView.projects,
    defaultPoints: state.projectView.defaultPoints,
});

const mapDispatch = dispatch => ({
    initView: dispatch.projectView.initView,
    updateQuery: dispatch.projectView.updateQuery,
});

export default connect(mapState, mapDispatch)(withRouter(Project));

