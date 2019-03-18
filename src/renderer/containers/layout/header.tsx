import React from "react";

const Header: React.FunctionComponent<{}> = props => {
    return (
        <header>
            <div className="drag-bar" />
            <div className="notification" />
            <div className="user-info">
                <span className="capital">{"Shenlvmeng".toUpperCase().slice(0, 1)}</span>
                Shenlvmeng
            </div>
        </header>
    );
};

export default Header;
