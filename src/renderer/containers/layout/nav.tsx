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
                    <React.Fragment>
                        <i className="iconfont calendar" />
                        Calendar
                    </React.Fragment>
                ) : (
                    <Link to="/">
                        <i className="iconfont calendar" />
                        Calendar
                    </Link>
                )}
            </div>
            <div className={classNames("nav-tab", { active: currPath === "/plans" })}>
                {currPath === "/plans" ? (
                    <React.Fragment>
                        <i className="iconfont plans" />
                        Plans
                    </React.Fragment>
                ) : (
                    <Link to="/plans">
                        <i className="iconfont plans" />
                        Plans
                    </Link>
                )}
            </div>
            <div className={classNames("nav-tab", { active: currPath === "/stats" })}>
                {currPath === "/stats" ? (
                    <React.Fragment>
                        <i className="iconfont stats" />
                        Statistics
                    </React.Fragment>
                ) : (
                    <Link to="/plans">
                        <i className="iconfont stats" />
                        Statistics
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Nav;
