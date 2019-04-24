import React from "react";
import classNames from "classnames";

import "./index.less";

interface IProps {
    type?: "primary" | "info" | "warn" | "danger" | "neon";
    disabled?: boolean;
    onClick?: () => void;
}

const Button: React.FunctionComponent<IProps> = props => {
    const { onClick, type, disabled } = props;
    function handleClick() {
        onClick && onClick();
    }

    return (
        <button
            className={classNames("calendone-button", {
                primary: type === "primary",
                info: type === "info",
                warn: type === "warn",
                danger: type === "danger",
                neon: type === "neon"
            })}
            disabled={disabled}
            onClick={handleClick}
        >
            {props.children}
        </button>
    );
};

export default Button;
