import React, { Component } from "react";
import classNames from "classnames";
import find from "lodash/find";

import Option from "./option";
import "./index.less";

interface IProps {
    defaultValue?: string;
    useLabel?: boolean;
    style?: {
        [key: string]: number | string;
    };
    onChange: (
        value:
            | string
            | {
                value: string;
                label: string;
            }
    ) => void;
}

interface IState {
    value: string;
    active: boolean;
    options: {
        value: string;
        label: any;
    }[];
}

class Select extends Component<IProps, IState> {
    public readonly state: IState = {
        value: this.props.defaultValue || "",
        active: false,
        options: []
    };

    public componentDidMount() {
        if (this.props.children) {
            const options = React.Children.map(this.props.children, (child: React.ReactElement<any>) => ({
                value: child.props.value || child.props.label,
                label: child.props.label || child.props.children
            }));
            this.setState({ options });
        }
    }

    public render() {
        const { value, options, active } = this.state;
        let currLabel: string = "";
        if (options.length) {
            const currOption = find(options, option => option.value === value);
            if (currOption) {
                currLabel = currOption.label;
            }
        }
        return (
            <div
                className={classNames("calendone-select", { active })}
                tabIndex={0}
                onClick={this.handleClick}
                onBlur={this.handleBlur}
                style={this.props.style || {}}
            >
                <div className="current-value">{currLabel}</div>
                <ul>
                    {options.map((option, index) => (
                        <li
                            key={index}
                            data-value={option.value}
                            className={classNames({ active: value === option.value })}
                            onClick={this.handleChange}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    private handleBlur = () => {
        this.setState({ active: false });
    };

    private handleClick = () => {
        this.setState(prevState => ({
            active: !prevState.active
        }));
    };

    private handleChange = (e: React.MouseEvent<HTMLLIElement>) => {
        const value = e.currentTarget.dataset && e.currentTarget.dataset.value;
        if (value) {
            this.setState({ value });
            if (this.props.useLabel) {
                const option = find(this.state.options, option => option.value === value);
                this.props.onChange({
                    value,
                    label: option ? option.label : ""
                });
            } else {
                this.props.onChange(value);
            }
        }
    };
}

export default Select;
export { Option };
