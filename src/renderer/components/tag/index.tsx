import React from "react";

import "./index.less";

interface IProps {
    type?: "info" | "warn" | "danger" | "primary" | "neon";
    children: React.ReactNode;
}

const Tag: React.FunctionComponent<IProps> = (props: IProps) => {
    return <div className={`calendone-tag ${props.type}`}>{props.children}</div>;
};

export default Tag;
