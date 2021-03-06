import React, { Component } from "react";

import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import classNames from "classnames";

import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import RefreshIcon from "@material-ui/icons/Refresh";
import { connect } from "react-redux";

const styles = theme => ({
  root: {},
  button: {
    color: "#fff"
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  }
});
class Refresh extends Component {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null
    };
  }

  refreshAllRepos = () => {
    const {
      reposSetLoadFlag,
      reposSetLoadRepos,
      setOnSuccess,
      updateView
    } = this.props;
    setOnSuccess(updateView);
    reposSetLoadRepos([]);
    reposSetLoadFlag(true);
    this.setState({ anchorEl: null });
  };

  refreshFilteredRepos = () => {
    const {
      reposSetLoadFlag,
      reposSetLoadRepos,
      repositories,
      setOnSuccess,
      updateView
    } = this.props;

    //Get list of repositories for current query
    setOnSuccess(updateView);
    reposSetLoadRepos(repositories.map(repo => repo.id));
    reposSetLoadFlag(true);
    this.setState({ anchorEl: null });
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  render() {
    const { classes } = this.props;
    const { anchorEl } = this.state;

    return (
      <div className={classes.root}>
        <Button
          aria-owns={anchorEl ? "simple-menu" : undefined}
          aria-haspopup="true"
          onClick={this.handleClick}
          className={classes.button}
        >
          <RefreshIcon
            className={classNames(classes.leftIcon, classes.iconSmall)}
          />
          Refresh Repositories
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.refreshAllRepos}>All</MenuItem>
          <MenuItem onClick={this.refreshFilteredRepos}>
            Filtered Repositories
          </MenuItem>
        </Menu>
      </div>
    );
  }
}

Refresh.propTypes = {
  classes: PropTypes.object.isRequired,
  reposSetLoadFlag: PropTypes.func.isRequired,
  reposSetLoadRepos: PropTypes.func.isRequired,

  setOnSuccess: PropTypes.func.isRequired,
  updateView: PropTypes.func.isRequired,

  repositories: PropTypes.array.isRequired
};

const mapState = state => ({
  repositories: state.repositoriesView.repositories
});

const mapDispatch = dispatch => ({
  reposSetLoadFlag: dispatch.repositoriesFetch.setLoadFlag,
  reposSetLoadRepos: dispatch.repositoriesFetch.setLoadRepos,

  updateView: dispatch.repositoriesView.updateView,

  loading: dispatch.loading.setOnSuccess,
  setOnSuccess: dispatch.loading.setOnSuccess
});

export default connect(
  mapState,
  mapDispatch
)(withStyles(styles)(Refresh));
