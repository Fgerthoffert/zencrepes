import _ from 'lodash';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import { withApollo } from 'react-apollo';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

import classNames from 'classnames';

import dashboardStyle from "../../../../assets/jss/material-dashboard-react/views/dashboardStyle.jsx";

import { ResponsivePie } from '@nivo/pie'

import Card from "../../../../components/Card/Card";
import CardHeader from "../../../../components/Card/CardHeader";
import CardBody from "../../../../components/Card/CardBody";

const styles = theme => ({
    root: {
        height: '150px'
    },

});

class SelectedColors extends Component {
    constructor(props) {
        super(props);
    }

    buildDataset() {
        const { selectedRepos, selectedLabels, setNewColor } = this.props;
        let colorElements = _.groupBy(selectedLabels, 'color');
        let colors = Object.keys(colorElements).map(idx => {
            return {
                items: colorElements[idx],
                count: colorElements[idx].length,
                name: "#" + idx,
                color: "#" + idx,
            }
        });
        colors = _.sortBy(colors, [function(o) {return o.count;}]);
        colors = colors.reverse();
        return colors.map((c) => {
            return {id: c.name, label: c.name, value: c.count, color: c.color};
        })
    };

    render() {
        const { classes, setNewColor } = this.props;
        return (
            <Card>
                <CardHeader color="success">
                    <h4 className={classes.cardTitleWhite}>Label Colors</h4>
                    <p className={classes.cardCategoryWhite}>
                        Repartition of colors amongst selected repositories
                    </p>
                </CardHeader>
                <CardBody style={{height: "150px"}}>
                    <ResponsivePie
                        data={this.buildDataset()}
                        margin={{
                            "top": 0,
                            "right": 200,
                            "bottom": 0,
                            "left": 0
                        }}
                        innerRadius={0.5}
                        padAngle={0.7}
                        cornerRadius={3}
                        colors="nivo"
                        colorBy={function(e){return e.color}}
                        onClick={function(c){setNewColor(c.color);}}
                        borderWidth={1}
                        borderColor="inherit:darker(0.2)"
                        enableRadialLabels={false}
                        radialLabelsSkipAngle={10}
                        radialLabelsTextXOffset={6}
                        radialLabelsTextColor="#333333"
                        radialLabelsLinkOffset={0}
                        radialLabelsLinkDiagonalLength={16}
                        radialLabelsLinkHorizontalLength={24}
                        radialLabelsLinkStrokeWidth={1}
                        radialLabelsLinkColor="inherit"
                        slicesLabelsSkipAngle={10}
                        slicesLabelsTextColor="#333333"
                        animate={true}
                        motionStiffness={90}
                        motionDamping={15}
                        theme={{
                            "tooltip": {
                                "container": {
                                    "fontSize": "13px"
                                }
                            },
                            "labels": {
                                "textColor": "#555"
                            }
                        }}
                        legends={[
                            {
                                "anchor": "right",
                                "direction": "column",
                                "translateY": 0,
                                "translateX": 100,
                                "itemWidth": 100,
                                "itemHeight": 18,
                                "symbolSize": 18,
                                "symbolShape": "circle"
                            }
                        ]}
                    />
                </CardBody>
            </Card>
        );
    }
}

SelectedColors.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapState = state => ({
    selectedRepos: state.labelsEdit.selectedRepos,
    selectedLabels: state.labelsEdit.selectedLabels,
});

const mapDispatch = dispatch => ({
    setNewColor: dispatch.labelsEdit.setNewColor,

});

export default connect(mapState, mapDispatch)(withStyles(dashboardStyle)(SelectedColors));