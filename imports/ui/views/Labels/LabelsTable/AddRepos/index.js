import React, { Component } from 'react';

import PropTypes from 'prop-types';
import {connect} from "react-redux";

import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Button from '@material-ui/core/Button';

import 'react-dual-listbox/lib/react-dual-listbox.css';
import DualListBox from 'react-dual-listbox';

class AddRepos extends Component {
    constructor (props) {
        super(props);
    }

    cancel = () => {
        const { setOpenAddRepos } = this.props;
        setOpenAddRepos(false);
    };

    apply = () => {
        const { setOpenAddRepos } = this.props;

//        console.log('Apply');
        setOpenAddRepos(false);

        /*
        const {
            setOpenAddRepository,
            addReposSelected,
            allRepos,
            setStageFlag,
            setVerifFlag,
            setVerifying,
            setRepos,
            setMilestoneTitle,
            setMilestoneDescription,
            setMilestoneDueDate,
            selectedSprintTitle,
            selectedSprintDescription,
            selectedSprintDueDate,
            setOnSuccess,
            updateView,
        } = this.props;

        setOpenAddRepository(false);

        const selectedRepos = addReposSelected.map((r) => {
            const repoFound = allRepos.filter(repo => r === repo.id);
            return repoFound[0];
        });
        setRepos(selectedRepos);
        setMilestoneTitle(selectedSprintTitle);
        setMilestoneDescription(selectedSprintDescription);
        setMilestoneDueDate(selectedSprintDueDate);
        setOnSuccess(updateView);
        setVerifying(true);
        setStageFlag(true);
        setVerifFlag(true);
        */
    };

    render() {
        const { openAddRepos, addReposAvailable, addReposSelected, addRepoUpdateSelected } = this.props;

        if (openAddRepos) {
            return (
                <Dialog aria-labelledby="simple-dialog-title" open={openAddRepos}>
                    <DialogTitle id="simple-dialog-title">Add Label to Repos</DialogTitle>
                    <DialogContent>
                        <DualListBox
                            canFilter
                            options={addReposAvailable}
                            selected={addReposSelected}
                            onChange={(selected) => {
                                addRepoUpdateSelected(selected);
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.cancel} color="primary" autoFocus>
                            Cancel
                        </Button>
                        <Button onClick={this.apply} color="primary" autoFocus>
                            Apply
                        </Button>
                    </DialogActions>
                </Dialog>
            );
        } else {
            return null;
        }
    }
}

AddRepos.propTypes = {
    openAddRepos: PropTypes.bool.isRequired,
    addReposAvailable: PropTypes.array.isRequired,
    addReposSelected: PropTypes.array.isRequired,

    setOpenAddRepos: PropTypes.func.isRequired,
    addRepoUpdateSelected: PropTypes.func.isRequired,

    /*
    allRepos: PropTypes.array.isRequired,
    selectedSprintTitle: PropTypes.string,
    selectedSprintDescription: PropTypes.string,
    selectedSprintDueDate: PropTypes.string,

    setStageFlag: PropTypes.func.isRequired,
    setVerifFlag: PropTypes.func.isRequired,
    setVerifying: PropTypes.func.isRequired,
    setRepos: PropTypes.func.isRequired,
    setMilestoneTitle: PropTypes.func.isRequired,
    setMilestoneDescription: PropTypes.func.isRequired,
    setMilestoneDueDate: PropTypes.func.isRequired,
    setOnSuccess: PropTypes.func.isRequired,
    updateView: PropTypes.func.isRequired,
    */
};

const mapState = state => ({
    openAddRepos: state.labelsEdit.openAddRepos,

    addReposAvailable: state.labelsEdit.addReposAvailable,
    addReposSelected: state.labelsEdit.addReposSelected,


    allRepos: state.sprintsView.allRepos,

    selectedSprintTitle: state.sprintsView.selectedSprintTitle,
    selectedSprintDescription: state.sprintsView.selectedSprintDescription,
    selectedSprintDueDate: state.sprintsView.selectedSprintDueDate,

});

const mapDispatch = dispatch => ({
    setOpenAddRepos: dispatch.labelsEdit.setOpenAddRepos,
    addRepoUpdateSelected: dispatch.labelsEdit.addRepoUpdateSelected,

    setStageFlag: dispatch.milestonesCreate.setStageFlag,
    setVerifFlag: dispatch.milestonesCreate.setVerifFlag,
    setVerifying: dispatch.milestonesCreate.setVerifying,

    setRepos: dispatch.milestonesCreate.setRepos,

    setMilestoneTitle: dispatch.milestonesCreate.setMilestoneTitle,
    setMilestoneDescription: dispatch.milestonesCreate.setMilestoneDescription,
    setMilestoneDueDate: dispatch.milestonesCreate.setMilestoneDueDate,

    setOnSuccess: dispatch.milestonesCreate.setOnSuccess,

    updateView: dispatch.sprintsView.updateView,
});

export default connect(mapState, mapDispatch)(AddRepos);