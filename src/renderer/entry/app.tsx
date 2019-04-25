import React from "react";
import { HashRouter } from "react-router-dom";
import { hot } from "react-hot-loader";

import Layout from "../containers/layout";
import Provider from "../store";
import "../style/common.less";

const Home = function(): JSX.Element {
    return (
        <Provider>
            <HashRouter>
                <Layout />
            </HashRouter>
        </Provider>
    );
};

export default hot(module)(Home);
