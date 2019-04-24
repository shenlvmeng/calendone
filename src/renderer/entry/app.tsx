import * as React from "react";
import { HashRouter } from "react-router-dom";
import { hot } from "react-hot-loader";
import Layout from "../containers/layout";

import "../style/common.less";

const Home = function(): JSX.Element {
    return (
        <HashRouter>
            <Layout />
        </HashRouter>
    );
};

export default hot(module)(Home);
