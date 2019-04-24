import React from "react";
import { RouteComponentProps } from "react-router";
import { Switch, Route, withRouter } from "react-router-dom";

import Nav from "./nav";
import Header from "./header";
import Calendone from "../calendone";
import Plans from "../plans";
import "./index.less";

/**
 * base app layout
 */
const BasicLayout: React.FunctionComponent<RouteComponentProps<{}>> = props => {
    return (
        <div className="layout">
            <Nav location={props.location} />
            <div className="layout-main">
                <Header {...props} />
                <div className="layout-main-content">
                    <Switch>
                        <Route path="/" exact={true} component={Calendone} />
                        <Route path="/plans" component={Plans} />
                    </Switch>
                </div>
            </div>
        </div>
    );
};

export default withRouter(BasicLayout);
