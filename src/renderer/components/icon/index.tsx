import React from "react";

interface IProps {
    type: string;
}

const Icon: React.FunctionComponent<IProps> = props => <i className={`iconfont ${props.type}`} />;

export default Icon;
