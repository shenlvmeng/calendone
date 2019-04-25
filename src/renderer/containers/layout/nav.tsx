import React from "react";
import { Location } from "history";
import { Link } from "react-router-dom";
import classNames from "classnames";

interface IProps {
    location: Location<{}>;
}

const Nav: React.FunctionComponent<IProps> = (props: IProps) => {
    const currPath = props.location.pathname || "/";
    return (
        <div className="nav-side">
            <div className={classNames("nav-tab", { active: currPath === "/" })}>
                {currPath === "/" ? (
                    <div className="tab-content">
                        <i className="iconfont calendar" />
                        Calendar
                    </div>
                ) : (
                    <Link to="/">
                        <i className="iconfont calendar" />
                        Calendar
                    </Link>
                )}
            </div>
            <div className={classNames("nav-tab", { active: currPath === "/plans" })}>
                {currPath === "/plans" ? (
                    <div className="tab-content">
                        <i className="iconfont plans" />
                        Plans
                    </div>
                ) : (
                    <Link to="/plans">
                        <i className="iconfont plans" />
                        Plans
                    </Link>
                )}
            </div>
            <div className={classNames("nav-tab", { active: currPath === "/stats" })}>
                {currPath === "/stats" ? (
                    <div className="tab-content">
                        <i className="iconfont stats" />
                        Statistics
                    </div>
                ) : (
                    <Link to="/stats">
                        <i className="iconfont stats" />
                        Statistics
                    </Link>
                )}
            </div>
            <section className="rare-operation">
                <div className={classNames("nav-tab", { active: currPath === "/user" })}>
                    {currPath === "/user" ? (
                        <div className="tab-content">
                            <i className="iconfont user" />
                            User
                        </div>
                    ) : (
                        <Link to="/user">
                            <i className="iconfont user" />
                            User
                        </Link>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Nav;
