import React, { Component } from "react";
import classNames from "classnames";

import "./index.less";

interface IProps {
    options: {
        key: string;
        label: string;
    }[];
    defaultOption?: string;
    onChange: (option: string) => void;
}

interface IState {
    currKey: string;
}

class RadioGroup extends Component<IProps, IState> {
    public readonly state: IState = {
        currKey: this.props.defaultOption || this.props.options[0].key
    };

    private radioName: number = Date.now();

    public render() {
        const { currKey } = this.state;
        return (
            <div className="radio-group" onChange={this.handleChange}>
                {this.props.options.map((option, index) => (
                    <div className="radio-item" key={index}>
                        <input
                            type="radio"
                            id={`radio-${option.key}`}
                            name={`radio-${this.radioName}`}
                            value={option.key}
                            defaultChecked={option.key === currKey}
                        />
                        <label htmlFor={`radio-${option.key}`}>
                            <span className={classNames("radio-checkbox", { active: option.key === currKey })} />
                            {option.label}
                        </label>
                    </div>
                ))}
            </div>
        );
    }

    private handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) {
            this.setState({ currKey: value });
            this.props.onChange(value);
        }
    };
}

export default RadioGroup;
