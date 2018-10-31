import React, { Component } from 'react';

import PropTypes from 'prop-types';
import { connect } from "react-redux";

import { withStyles } from 'material-ui/styles';
import Button from 'material-ui/Button';
import List from 'material-ui/List';

import FacetSelector from './FacetSelector.js';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';

const styles = theme => ({
    root: {
        marginBottom: '10px',
    },
    card: {
        padding: '0px',
    },
    cardContent: {
        padding: '0px',
    },
    cardHeader: {
        padding: '5px',
    }
});

const ExpandButton = (props) => {
    if (props.collapsed && props.length > 5) {
        return ( <Button color="primary" size="small" className={props.classes.button} onClick={props.onClick(false)}>more...</Button>);
    } else if (!props.collapsed && props.length > 5) {
        return (<Button color="primary" size="small" className={props.classes.button} onClick={props.onClick(true)}>less</Button>);
    } else {
        return null;
    }
};

const SelectAllButton = (props) => {
    if (props.selectAll && props.length > 5) {
        return ( <Button color="primary" size="small" className={props.classes.button} onClick={props.onClick(false)}>Unselect All</Button>);
    } else if (!props.selectAll && props.length > 5) {
        return (<Button color="primary" size="small" className={props.classes.button} onClick={props.onClick(true)}>Select All</Button>);
    } else {
        return null;
    }
};

class TermFacet extends Component {
    constructor (props) {
        super(props);
        this.state = {
            collapsed: true,
            selectAll: false,
        };
    }

    collapseFacet = value => () => {
        this.setState({collapsed: value})
    };

    clickItem = (clickedValue) => {
        console.log('clickItem');
        const { facet, addRemoveQuery } = this.props;
        addRemoveQuery(clickedValue, facet);
    };

    render() {
        const { classes, facet, query, addRemoveQuery } = this.props;
        const { collapsed, selectAll } = this.state;

        let selectedValues = [];
        let facetKey = facet.key;
        if (facet.nested === true) {
            facetKey = facetKey + '.edges';
        }
        if (query[facetKey] !== undefined) {
            if (facet.nested === false) {
                selectedValues = query[facetKey]['$in'];
            } else {
                let nestedKey = 'node.' + facet.nestedKey;
                selectedValues = query[facetKey]['$elemMatch'][nestedKey]['$in'];
            }
        }

        let group = 'abcd';
        let currentFilters = [];

        let facetsData = facet.values;
        if (collapsed) {
            facetsData = facet.values.slice(0, 5);
        }

        return (
            <div className={classes.root}>
                <Card className={classes.card}>
                    <CardHeader title={facet.name} className={classes.cardHeader} />
                    <CardContent className={classes.cardContent}>
                        <List dense={this.state.dense}>
                            {facetsData.map(value => (
                                <FacetSelector
                                    data={value}
                                    key={value.name}
                                    clickItem={this.clickItem}
                                    selected={selectedValues.indexOf(value.name) !== -1}
                                />
                            ))}
                        </List>
                    </CardContent>
                    <CardActions>
                        <ExpandButton collapsed={collapsed} length={facet.values.length} classes={classes} onClick={this.collapseFacet}/>
                    </CardActions>
                </Card>
            </div>
        );
    }
}

TermFacet.propTypes = {
    classes: PropTypes.object.isRequired,
};

const mapDispatch = dispatch => ({
    addFilterRefresh: dispatch.data.addFilterRefresh,
    removeFilterRefresh: dispatch.data.removeFilterRefresh,
});

const mapState = state => ({
    currentFilters: state.data.filters,
});

export default connect(mapState, mapDispatch)(withStyles(styles)(TermFacet));