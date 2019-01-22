import React, { Component } from 'react';

import PropTypes from 'prop-types';
import {connect} from "react-redux";

import IconButton from '@material-ui/core/IconButton';
import CreateNewFolderIcon from '@material-ui/icons/CreateNewFolder';

class AddRepoButton extends Component {
    constructor (props) {
        super(props);
    }

    addRepo = () => {
        const { labels, updateAvailableRepos, setOpenAddRepos, setAddReposSelected } = this.props;
        updateAvailableRepos(labels);
        setAddReposSelected([]);
        setOpenAddRepos(true);
    };

    render() {
        const { labels, reposCount } = this.props;
        if (labels.length < reposCount) {
            return (
                <IconButton onClick={this.addRepo} title="Add to Repositories">
                    <CreateNewFolderIcon />
                </IconButton>
            );
        } else {
            return null;
        }
    }
}

AddRepoButton.propTypes = {
    reposCount: PropTypes.number.isRequired,
    labels: PropTypes.array.isRequired,
//    setLabels: PropTypes.func.isRequired,
    setOpenAddRepos: PropTypes.func.isRequired,
    setAddReposSelected: PropTypes.func.isRequired,
    updateAvailableRepos: PropTypes.func.isRequired,
};

const mapState = state => ({
    reposCount: state.labelsView.reposCount,
});

const mapDispatch = dispatch => ({
    //setLabels: dispatch.labelsEdit.setLabels,
    setOpenAddRepos: dispatch.labelsEdit.setOpenAddRepos,
    setAddReposSelected: dispatch.labelsEdit.setAddReposSelected,
    updateAvailableRepos: dispatch.labelsEdit.updateAvailableRepos,
});

export default connect(mapState, mapDispatch)(AddRepoButton);
