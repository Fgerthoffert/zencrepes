import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from "prop-types";
import {withRouter} from "react-router-dom";

import { withStyles } from '@material-ui/core/styles';
import { ResponsiveTreeMap } from '@nivo/treemap';

const style = {
    root: {
        height: '150px'
    },
};


class IssuesTree extends Component {
    constructor(props) {
        super(props);
    }

    buildDataset() {
        const { dataset, emptyName, defaultPoints } = this.props;
        let metric = 'points';
        if (!defaultPoints) {metric = 'count';}
        let chartData = {
            name: emptyName,
            color: 'hsl(67, 70%, 50%)',
            children: dataset.map((v) => {
                return {name: v.name, count: v[metric], issues: v.issues};
            })
        };
        return chartData;
    }

    clickIssues = ({ data }) => {
        const { dataset, exclude } = this.props;
        if (exclude) {
            // Build an array containing all issues
            const allIssues = dataset.reduce((acc, category) => {
                const pushIssues = category.issues.filter(issue => acc.find(i => i.id === issue.id) === undefined);
                return [...acc, ...pushIssues];
            }, []);
            // Filter out all issues that are in the selected element
            const filteredIssues = allIssues.filter(issue => data.issues.find(i => i.id === issue.id) === undefined);
            const issuesArrayQuery = filteredIssues.map(issue => issue.id);
            const query = {'id': {'$in': issuesArrayQuery}};
            this.props.history.push({
                pathname: '/issues/list',
                search: '?q=' + encodeURIComponent(JSON.stringify(query)),
                state: { detail: query }
            });
        } else {
            const issuesArrayQuery = data.issues.map(issue => issue.id);
            const query = {'id': {'$in': issuesArrayQuery}};
            this.props.history.push({
                pathname: '/issues/list',
                search: '?q=' + encodeURIComponent(JSON.stringify(query)),
                state: { detail: query }
            });            
        }
    };

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <ResponsiveTreeMap
                    root={this.buildDataset()}
                    identity="name"
                    value="count"
                    innerPadding={3}
                    outerPadding={3}
                    leavesOnly={true}
                    margin={{
                        "top": 0,
                        "right": 0,
                        "bottom": 0,
                        "left": 0
                    }}
                    label={(e) => _.truncate(e.name, {length: 10, omission: '...'})}
                    labelFormat=''
                    labelSkipSize={40}
                    labelTextColor={{
                        "from": "color",
                        "modifiers": [
                            [
                                "darker",
                                1.2
                            ]
                        ]
                    }}
                    colorBy="name"
                    colors={{
                        "scheme": "pastel1"
                    }}
                    borderColor={{
                        "from": "color",
                        "modifiers": [
                            [
                                "darker",
                                0.3
                            ]
                        ]
                    }}
                    animate={true}
                    onClick={this.clickIssues}
                    motionStiffness={90}
                    motionDamping={11}
                />
            </div>
        );
    }
}

IssuesTree.propTypes = {
    classes: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    dataset: PropTypes.array,
    exclude: PropTypes.boolean,
    emptyName: PropTypes.string.isRequired,
    defaultPoints: PropTypes.bool.isRequired,
};

export default withRouter(withStyles(style)(IssuesTree));
