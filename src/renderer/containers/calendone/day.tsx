import React, { Component } from "react";
import moment from "moment";
import classNames from "classnames";

import { EventPeriod, IEvent } from "@/services/db";
import Mood from "@/components/day-mood";
import { IDate, IDayEvent } from "./index";
import NewEvent from "./new-event";
import "./day.less";

interface IProps {
    info: IDayEvent | IDate | null;
    onDayChange: (delta: { mood?: number; events?: IEvent[] }) => void;
    onClose: () => void;
}

interface IState {
    currInputPeriod: EventPeriod;
}

class Day extends Component<IProps, IState> {
    public readonly state: IState = {
        currInputPeriod: 0
    };

    public render() {
        if (!this.props.info) {
            return null;
        }
        const { currInputPeriod } = this.state;
        const { year, month, date, timestamp, mood = 0, events = [] } = this.props.info as IDayEvent;
        return (
            <div className="day-detail">
                <div className="iconfont close-drawer" onClick={this.handleCloseSelf} />
                <h2 className={classNames({ now: moment().isSame(timestamp, "day") })}>
                    {year}-{month + 1}-{date}
                </h2>
                <div className="day-mood">
                    Mood: <Mood defaultMood={mood} onChange={this.handleMoodChange} />
                </div>
                <div className="day-events-container">
                    <div className="day-events">
                        <div className="day-event-input">
                            <div className="allday-input" onClick={this.handleAddAllday}>
                                <span className="iconfont add-icon" />
                                添加全天事件
                            </div>
                            <div className="periods-input">
                                <div className="period-input" onClick={this.handleAddMorning}>
                                    <span className="iconfont add-icon" />
                                    添加上午事件
                                </div>
                                <div className="period-input" onClick={this.handleAddAfternoon}>
                                    <span className="iconfont add-icon" />
                                    添加下午事件
                                </div>
                                <div className="period-input" onClick={this.handleAddNight}>
                                    <span className="iconfont add-icon" />
                                    添加夜晚事件
                                </div>
                            </div>
                        </div>
                        <div className="day-event-list">
                            <div className="day-split">
                                <div className="split" />
                                <div className="split" />
                                <div className="split" />
                            </div>
                            <div className={classNames("day-event-input-content", { visible: currInputPeriod > 0 })}>
                                <div
                                    className={classNames({
                                        allday: currInputPeriod === 1,
                                        morning: currInputPeriod === 2,
                                        afternoon: currInputPeriod === 3,
                                        night: currInputPeriod === 4
                                    })}
                                >
                                    {currInputPeriod > 0 ? (
                                        <NewEvent onCancel={this.handleCancelAdd} onFinish={this.handleAddEvent} />
                                    ) : null}
                                </div>
                            </div>
                            {events.length ? (
                                events
                                    .sort((a, b) => a.period - b.period)
                                    .map((event, index) => {
                                        return (
                                            <div
                                                className={classNames("day-event-item", {
                                                    morning: event.period === 2,
                                                    afternoon: event.period === 3,
                                                    night: event.period === 4,
                                                    "track-event": event.type === 2
                                                })}
                                                key={index}
                                            >
                                                {event.type === 2 ? (
                                                    <div className="event-title">{event.track_title}</div>
                                                ) : null}
                                                <div className="event-body">{event.content}</div>
                                            </div>
                                        );
                                    })
                            ) : (
                                <div className="empty-hint">暂无事件，请添加一个</div>
                            )}
                        </div>
                    </div>
                    <div className="events-period">
                        <span>6:00</span>
                        <span>12:00</span>
                        <span>20:00</span>
                        <span>6:00</span>
                    </div>
                </div>
            </div>
        );
    }

    private handleCloseSelf = () => {
        this.props.onClose();
    };

    private handleMoodChange = (mood: number) => {
        this.props.onDayChange({ mood });
    };

    private handleAddMorning = () => {
        this.setState({ currInputPeriod: 2 });
    };

    private handleAddAfternoon = () => {
        this.setState({ currInputPeriod: 3 });
    };

    private handleAddNight = () => {
        this.setState({ currInputPeriod: 4 });
    };

    private handleAddAllday = () => {
        this.setState({ currInputPeriod: 1 });
    };

    private handleCancelAdd = () => {
        this.setState({ currInputPeriod: 0 });
    };

    private handleAddEvent = (event: {
        content: string;
        isTracking: boolean;
        trackId?: string;
        trackTitle?: string;
    }) => {
        let newEvent: IEvent = {
            content: event.content,
            period: this.state.currInputPeriod,
            type: event.isTracking ? 2 : 1
        };
        if (event.trackId) {
            newEvent = {
                ...newEvent,
                track_id: +event.trackId,
                track_title: event.trackTitle,
                track_stage: 1
            };
        }
        this.props.onDayChange({ events: [newEvent] });
        this.setState(prevState => ({ currInputPeriod: 0 }));
    };
}

export default Day;
