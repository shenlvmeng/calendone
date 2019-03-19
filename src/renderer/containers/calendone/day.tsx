import React, { Component } from "react";

import Mood from "@/components/day-mood";
import { IDate, IDayEvent } from "./index";

interface IProps {
    info: IDayEvent | IDate | null;
}

interface IState {}

class Day extends Component<IProps, IState> {
    public render() {
        if (!this.props.info) {
            return null;
        }
        const { year, month, date, mood = 0, events = [] } = this.props.info as IDayEvent;
        return (
            <div className="day-detail">
                <h2>
                    {year}-{month + 1}-{date}
                </h2>
                <div className="day-mood">
                    Mood: <Mood defaultMood={mood} onChange={this.handleMoodChange} />
                </div>
                <div className="day-events">{events}</div>
            </div>
        );
    }

    private handleMoodChange = (mood: number) => {
        // TODO
    };
}

export default Day;
