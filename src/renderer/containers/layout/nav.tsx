import React from "react";
import { Location } from "history";
import { Link } from "react-router-dom";
import classNames from "classnames";

import Icon from "@/components/icon";
import { openLink } from "@/utils";

interface IProps {
    location: Location<{}>;
}

function openGithub() {
    openLink("https://github.com/shenlvmeng/calendone");
}

const Nav: React.FunctionComponent<IProps> = (props: IProps) => {
    const currPath = props.location.pathname || "/";
    return (
        <div className="nav-side">
            <div className={classNames("nav-tab", { active: currPath === "/" })}>
                {currPath === "/" ? (
                    <div className="tab-content">
                        <Icon type="calendar" />
                        Calendar
                    </div>
                ) : (
                    <Link to="/">
                        <Icon type="calendar" />
                        Calendar
                    </Link>
                )}
            </div>
            <div className={classNames("nav-tab", { active: currPath === "/plans" })}>
                {currPath === "/plans" ? (
                    <div className="tab-content">
                        <Icon type="plans" />
                        Plans
                    </div>
                ) : (
                    <Link to="/plans">
                        <Icon type="plans" />
                        Plans
                    </Link>
                )}
            </div>
            <div className={classNames("nav-tab", { active: currPath === "/track" })}>
                {currPath === "/track" ? (
                    <div className="tab-content">
                        <Icon type="track" />
                        Track Events
                    </div>
                ) : (
                    <Link to="/track">
                        <Icon type="track" />
                        Track Events
                    </Link>
                )}
            </div>
            <div className={classNames("nav-tab", { active: currPath === "/stats" })}>
                {currPath === "/stats" ? (
                    <div className="tab-content">
                        <Icon type="stats" />
                        Statistics
                    </div>
                ) : (
                    <Link to="/stats">
                        <Icon type="stats" />
                        Statistics
                    </Link>
                )}
            </div>
            <section className="rare-operation">
                <div className={classNames("nav-tab", { active: currPath === "/data" })}>
                    {currPath === "/data" ? (
                        <div className="tab-content">
                            <Icon type="data" />
                            Data
                        </div>
                    ) : (
                        <Link to="/data">
                            <Icon type="data" />
                            Data
                        </Link>
                    )}
                </div>
                <div className={classNames("nav-tab", { active: currPath === "/user" })}>
                    {currPath === "/user" ? (
                        <div className="tab-content">
                            <Icon type="user" />
                            User
                        </div>
                    ) : (
                        <Link to="/user">
                            <Icon type="user" />
                            User
                        </Link>
                    )}
                </div>
            </section>
            <section className="github-part">
                <span onClick={openGithub}>
                    <Icon type="github" />
                </span>
            </section>
        </div>
    );
};

export default Nav;
