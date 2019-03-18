import * as React from "react";
import { HashRouter, Switch, Route } from "react-router-dom";
import { hot } from "react-hot-loader";

import Calendone from "../containers/calendone";
import Plans from "../containers/plans";

import "../style/common.less";

const Home = function(): JSX.Element {
    return (
        <HashRouter>
            <Switch>
                <Route path="/" exact={true} component={Calendone} />
                <Route path="/plans" component={Plans} />
            </Switch>
        </HashRouter>
    );
};

export default hot(module)(Home);
