import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import { connect } from "react-redux";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';

import TablePaginationActions from './TablePaginationActions.js';
import Issue from './Issue.js';

import Header from './Header/index.js';

const styles = theme => ({
    root: {
        /*
        flexGrow: 1,
        zIndex: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        */
    },
});


class IssuesTable extends Component {
    constructor (props) {
        super(props);
        this.state = {
            page: 0,
            rowsPerPage: 25,
        };
    }

    handleChangePage = (event, page) => {
        this.setState({ page });
    };

    handleChangeRowsPerPage = event => {
        this.setState({ rowsPerPage: event.target.value });
    };

    render() {
        const { classes, filteredIssues, pagination } = this.props;
        const { rowsPerPage, page } = this.state;

        let emptyRows = 0;
        let issues = filteredIssues;
        if (pagination === true) {
            emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredIssues.length - page * rowsPerPage);
            issues = filteredIssues.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
            if (issues.length < rowsPerPage) {
                emptyRows = 0;
            }
        }

        return (
            <div className={classes.root}>
                <Table className={classes.table}>
                    <Header
                        filteredIssues={filteredIssues}
                    />
                    <TableBody>
                        {issues.map(issue => {
                            return (
                                <Issue issue={issue} key={issue.id} />
                            );
                        })}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 48 * emptyRows }}>
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                    {pagination === true &&
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    colSpan={3}
                                    count={filteredIssues.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onChangePage={this.handleChangePage}
                                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                                    ActionsComponent={TablePaginationActions}
                                />
                            </TableRow>
                        </TableFooter>
                    }
                </Table>
            </div>
        );
    }
}

IssuesTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(IssuesTable);