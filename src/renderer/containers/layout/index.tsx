import React, { Component } from "react";
import { RouteComponentProps } from "react-router";

import Nav from "./nav";
import Header from "./header";
import "./index.less";

/**
 * base app layout
 */
abstract class BasicLayout<T> extends Component<RouteComponentProps<{}>, T> {
    public abstract renderMain(): React.ReactNode;
    render() {
        return (
            <div className="layout">
                <Nav location={this.props.location} />
                <div className="layout-main">
                    <Header />
                    <div className="layout-main-content">{this.renderMain()}</div>
                </div>
            </div>
        );
    }
}

export default BasicLayout;
