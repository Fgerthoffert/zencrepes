import _ from 'lodash';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import {connect} from "react-redux";

import Button from '@material-ui/core/Button';
import Snackbar from "@material-ui/core/Snackbar";

import {buildMongoSelector} from "../../../utils/mongo";
import {cfgIssues} from "../../../data/Minimongo";

import ProgressBar from "../../../components/Loading/Issues/ProgressBar";

const styles = theme => ({
    root: {
        textAlign: 'right'
    },
});
class Refresh extends Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { loadSuccess, setLoadSuccess } = this.props;
        if (prevProps.loadSuccess === false && loadSuccess === true) {
            //Set timer to actually set back success to false (and remove snackbar)
            setTimeout(() => {
                setLoadSuccess(false);
            }, 2000);
        }
    };

    refreshRepos = () => {
        console.log('refreshQuick');
        const { setLoadFlag, setLoadRepos, repositories } = this.props;
        //Get list of repositories for current query
        console.log(repositories);
        setLoadRepos(repositories.map(repository => repository.id));
        setLoadFlag({
            issues: 'true',
            labels: 'false'
        });

    };

    render() {
        const { classes, loading, loadSuccess, issuesLoadedCount, repositories } = this.props;

        if (repositories.length === 0) {
            return null;
        } else {
            return (
                <div className={classes.root}>
                    {!loading &&
                    <div>
                        <Button variant="raised" color="primary" className={classes.button} onClick={this.refreshRepos}>
                            Refresh Issues Repos
                        </Button>
                    </div>
                    }
                    {loading &&
                    <ProgressBar/>
                    }
                    <Snackbar
                        anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                        open={loadSuccess}
                        ContentProps={{
                            'aria-describedby': 'message-id',
                        }}
                        message={<span id="message-id">Loaded or updated {issuesLoadedCount} issues</span>}
                    />
                </div>
            )
        }
    };
}

Refresh.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapState = state => ({
    loading: state.githubFetchReposContent.loading,
    loadSuccess: state.githubFetchReposContent.loadSuccess,

    issuesLoadedCount: state.githubIssues.loadedCount,

    repositories: state.sprintPlanning.repositories,
});

const mapDispatch = dispatch => ({
    setLoadFlag: dispatch.githubFetchReposContent.setLoadFlag,
    setLoading: dispatch.githubFetchReposContent.setLoading,

    setLoadSuccess: dispatch.githubFetchReposContent.setLoadSuccess,
    setLoadRepos: dispatch.githubFetchReposContent.setLoadRepos,
});


export default connect(mapState, mapDispatch)(withStyles(styles)(Refresh));
