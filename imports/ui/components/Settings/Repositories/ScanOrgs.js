import React, { Component } from 'react';
import {connect} from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import PropTypes from "prop-types";

import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Snackbar from '@material-ui/core/Snackbar';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

import { cfgSources } from "../../../data/Minimongo.js";

const styles = {
    root: {
        margin: '10px',
        width: '100%',
    },
    title: {
        fontSize: 14,
    },
    loading: {
        flexGrow: 1,
    },
    button: {
        width: '120px',
    },
    cardActions: {
        display: 'inline',
    },
    cardContent: {
        paddingBottom: '0px',
    },
    actionButtons: {
        textAlign: 'right',
    }
};

class ScanOrgs extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { setLoadFlag, connectedUser, setLogin } = this.props;
        if (cfgSources.find({}).count() === 0) {
            setLogin(connectedUser.login);
            setLoadFlag(true);
        }
    }

    componentDidUpdate(prevProps) {
        const { loadSuccess, setLoadSuccess } = this.props;
        if (prevProps.loadSuccess === false && loadSuccess === true) {
            //Set timer to actually set back success to false (and remove snackbar)
            setTimeout(() => {
                setLoadSuccess(false);
            }, 2000);
        }
    }

    reloadRepos = () => {
        const { setLoadFlag, connectedUser, setLogin } = this.props;
        setLogin(connectedUser.login);
        setLoadFlag(true);
    };

    render() {
        const { classes, loading, loadSuccess, loadedOrgs, loadedRepos } = this.props;
        return (
            <div className={classes.root}>
                <Card>
                    <CardContent className={classes.cardContent} >
                        <Typography className={classes.title} color="textSecondary">
                            Affiliated GitHub Repositories & Organizations
                        </Typography>
                        {loading &&
                            <div className={classes.loading}>
                                <LinearProgress />
                                <Typography component="p">
                                    Fetched {loadedOrgs} Organizations and {loadedRepos} Repositories.
                                </Typography>
                            </div>
                        }
                    </CardContent>
                    {!loading &&
                        <CardActions className={classes.cardActions} >
                                <div className={classes.actionButtons} >
                                    <Button color="primary" variant="contained" className={classes.button} onClick={this.reloadRepos}>
                                        Scan and Add All
                                    </Button>
                                </div>
                        </CardActions>
                    }
                </Card>
                <Snackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'center'}}
                    open={loadSuccess}
                    ContentProps={{
                        'aria-describedby': 'message-id',
                    }}
                    message={<span id="message-id">Found {loadedRepos} repositories amongst {loadedOrgs} GitHub organizations</span>}
                />
            </div>
        );
    }
}

ScanOrgs.propTypes = {
    classes: PropTypes.object,
    loading: PropTypes.bool,
    loadSuccess: PropTypes.bool,
    loadedOrgs: PropTypes.number,
    loadedRepos: PropTypes.number,
    setLoadFlag: PropTypes.func,
    setLoadSuccess: PropTypes.func,
    connectedUser: PropTypes.object,
    setLogin: PropTypes.func,
};

const mapState = state => ({
    loading: state.githubFetchOrgs.loading,
    loadSuccess: state.githubFetchOrgs.loadSuccess,
    loadedOrgs: state.githubFetchOrgs.loadedOrgs,
    loadedRepos: state.githubFetchOrgs.loadedRepos,

    connectedUser: state.usersView.connectedUser,
});

const mapDispatch = dispatch => ({
    setLogin: dispatch.githubFetchOrgs.setLogin,
    setLoadFlag: dispatch.githubFetchOrgs.setLoadFlag,
    setLoadSuccess: dispatch.githubFetchOrgs.setLoadSuccess,
});

export default connect(mapState, mapDispatch)(withStyles(styles)(ScanOrgs));