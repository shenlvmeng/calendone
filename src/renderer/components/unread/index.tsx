import React from "react";

import "./index.less";

interface IProps {
    count: number;
}

const Unread: React.FunctionComponent<IProps> = (props: IProps) => (
    <span className="unread-count">{props.count > 99 ? "99+" : props.count}</span>
);

export default Unread;
