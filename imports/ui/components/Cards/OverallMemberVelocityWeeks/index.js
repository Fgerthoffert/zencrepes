//https://github.com/creativetimofficial/material-dashboard-react/blob/master/src/components/Cards/StatsCard.jsx
import _ from 'lodash';
import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import cx from "classnames";

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';

import regularCardStyle from './regularCardStyle.jsx';

import VelocityLine from './VelocityLine.js';

import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {getWeekYear} from "../../../utils/velocity";

class OverallMemberVelocityWeeks extends Component {
    constructor (props) {
        super(props);
        this.state = {};
    }

    /*
     getVelocityLine(): Massage data to be displayed in the chart
     TODO - This needs to be reworked and optimized, very dirty implementation
     */

    getVelocityLine(repartition) {
        console.log(repartition);
        if (repartition.length > 0 ) {
            //Create a blank array with all possible 'X' datapoints
            let emptyDataset = [];
            repartition.forEach((assignee) => {
                assignee.weeks.forEach((week) => {
                    if(!_.find(emptyDataset, {x: week.weekStart})) {
                        emptyDataset.push({
                            x: week.weekStart,
                            y: null,
                        });
                    }
                });
            });
            emptyDataset = _.sortBy(emptyDataset, 'x');
            console.log(emptyDataset);

            let dataset = [];
            repartition.forEach((assignee) => {
                let assigneeData = [];
                emptyDataset.forEach((week) => {
                    let currentValue = _.find(assignee.weeks, {weekStart: week.x});
                    if(!currentValue) {
                        assigneeData.push(week);
                    } else {
                        assigneeData.push({x: currentValue.weekStart, y: currentValue.issues.velocity});
                    }
                });

//                let assigneeData = assignee.weeks.map((v) => {
//                    //return {x: getWeekYear(new Date(v.weekStart)).toString(), y: v.issues.velocity}
//                    return {x: v.weekStart, y: v.issues.velocity}
//                });
                //https://stackoverflow.com/questions/43872983/merge-object-arrays-without-duplicates-in-angular-2
                assigneeData = assigneeData.filter(v => v.y !== undefined);
                dataset.push({id: assignee.login, data: assigneeData});
                //dataset.push({id: assignee.login, data: _.uniqBy([...assigneeData, ...emptyDataset], 'x')});
            });
            console.log(dataset);
/*            dataset = dataset.map((v) => {
                return {x: getWeekYear(new Date(v.weekStart)).toString(), y: v.issues.velocity}
            });*/
            return dataset;
//            return [{id: 'rolling', data: []}];

            //return [{id: 'rolling', data: dataset}];
        } else {
            return [{id: 'rolling', data: []}];
        }
    }

    buildDataset() {
        const { repartition } = this.props;
        return repartition.filter( v => v.weeks !== undefined);
    }

    getThisWeekCompleted(dataset) {
        let idx = dataset.length - 1;
        if (idx >= 0) {
            return dataset[idx].issues.count;
        } else {
            return '-';
        }
    }


    render() {
        const {
            classes,
            headerColor,
            plainCard,
            content,
            footer
        } = this.props;
        const plainCardClasses = cx({
            [" " + classes.cardPlain]: plainCard
        });
        const cardPlainHeaderClasses = cx({
            [" " + classes.cardPlainHeader]: plainCard
        });


        let dataset = this.buildDataset();
        console.log(dataset);
        console.log(this.getVelocityLine(dataset));

        return (
            <Card className={classes.card + plainCardClasses}>
                <CardHeader
                    classes={{
                        root:
                        classes.cardHeader +
                        " " +
                        classes[headerColor + "CardHeader"] +
                        cardPlainHeaderClasses,
                        title: classes.cardTitle,
                        subheader: classes.cardSubtitle
                    }}
                    title='Overall weekly velocity throughout the entire period'
                />
                <CardContent>
                    <VelocityLine data={this.getVelocityLine(dataset)} />
                </CardContent>
                {footer !== undefined ? (
                    <CardActions className={classes.cardActions}>{footer}</CardActions>
                ) : null}
            </Card>
        )
    };
}

/*
 <RepartitionTreemap />
 */

OverallMemberVelocityWeeks.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapDispatch = dispatch => ({
});


const mapState = state => ({
    repartition: state.repartition.repartition,
});

export default connect(mapState, mapDispatch)(withStyles(regularCardStyle)(OverallMemberVelocityWeeks));
