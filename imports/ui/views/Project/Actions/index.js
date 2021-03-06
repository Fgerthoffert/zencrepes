import React, { Component } from 'react';

import SelectSprint from './SelectSprint.js';
import Grid from '@material-ui/core/Grid';

import Refresh from './Refresh.js';

import AppBar from "@material-ui/core/AppBar/AppBar";
import Toolbar from "@material-ui/core/Toolbar/Toolbar";
import Exit from "./Exit.js";

class Actions extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <AppBar position="static" color="primary">
                <Toolbar>
                    <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="flex-start"
                        spacing={8}
                    >
                        <Grid item xs={12} sm container>
                            <SelectSprint />
                            <Refresh />
                        </Grid>
                        <Grid item>
                            <Grid
                                container
                                direction="row"
                                justify="flex-start"
                                alignItems="flex-start"
                                spacing={8}
                            >
                                <Grid item>
                                    <Exit />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>
        );
    }
}

export default Actions;
