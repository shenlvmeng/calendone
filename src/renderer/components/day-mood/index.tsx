import React, { Component } from "react";
import classNames from "classnames";

import { moods } from "@/utils/constants";
import "./index.less";

interface IProps {
    defaultMood?: number;
    onChange: (mood: number) => void;
}

interface IState {
    mood: number;
    active: boolean;
}

class MoodSelector extends Component<IProps, IState> {
    public readonly state: IState = {
        mood: this.props.defaultMood || 0,
        active: false
    };

    public render() {
        const { mood, active } = this.state;
        return (
            <div
                className={classNames("mood-selector", { active })}
                tabIndex={0}
                onFocus={this.handleFocus}
                onBlur={this.handleBlur}
            >
                {moods[mood]}
                <ul>
                    {Object.keys(moods).map(key => (
                        <li
                            key={key}
                            data-key={key}
                            className={classNames({ active: +key === mood })}
                            onClick={this.handleChange}
                        >
                            {moods[key]}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    private handleChange = (e: React.MouseEvent<HTMLLIElement>) => {
        const key = e.currentTarget.dataset && e.currentTarget.dataset.key;
        if (key) {
            this.setState({
                mood: +key,
                active: false
            });
            this.props.onChange(+key);
        }
    };

    private handleFocus = () => {
        this.setState({ active: true });
    };

    private handleBlur = () => {
        this.setState({ active: false });
    };
}

export default MoodSelector;
