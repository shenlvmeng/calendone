import React, { Component } from "react";
import moment from "moment";
import classNames from "classnames";

import { EventPeriod, IEvent } from "@/services/db";
import Mood from "@/components/day-mood";
import { IDayEvent } from "./index";
import NewEvent from "./new-event";
import "./day.less";

interface IProps {
    info: IDayEvent | null;
    onDayChange: (delta: { mood?: number; events?: IEvent[] }) => void;
    onClose: () => void;
}

interface IState {
    currInputPeriod: EventPeriod;
    currIndex: number;
    currEvent: {
        step?: number;
        content?: string;
        isTracking?: boolean;
        trackTitle?: string;
        trackId?: string;
        trackContent?: string;
    };
}

class Day extends Component<IProps, IState> {
    public readonly state: IState = {
        currInputPeriod: 0,
        currIndex: 0,
        currEvent: {}
    };

    public render() {
        if (!this.props.info) {
            return null;
        }
        const { currInputPeriod, currEvent } = this.state;
        const { year, month, day, timestamp, mood = 0, events = [] } = this.props.info;
        return (
            <div className="day-detail">
                <div className="iconfont close-btn" onClick={this.handleCloseSelf} />
                <h2 className={classNames({ now: moment().isSame(timestamp, "day") })}>
                    {year}-{month + 1}-{day}
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
                                        <NewEvent
                                            {...currEvent}
                                            currDate={timestamp}
                                            onCancel={this.handleCancelAdd}
                                            onFinish={this.handlePutEvent}
                                        />
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
                                                    "track-event": event.type === 2,
                                                    "track-finish": event.track_stage === 2,
                                                    "track-abandon": event.track_stage === 3
                                                })}
                                                key={index}
                                                data-index={index}
                                                onClick={this.handleUpdateEvent}
                                            >
                                                <div
                                                    className="iconfont close-btn"
                                                    data-index={index}
                                                    onClick={this.handleDeleteEvent}
                                                />
                                                {event.type === 2 ? (
                                                    <div className="event-title">
                                                        #{event.track_id}: {event.track_title}
                                                    </div>
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
        this.setState({
            currEvent: { step: 0 },
            currInputPeriod: 2
        });
    };

    private handleAddAfternoon = () => {
        this.setState({
            currEvent: { step: 0 },
            currInputPeriod: 3
        });
    };

    private handleAddNight = () => {
        this.setState({
            currEvent: { step: 0 },
            currInputPeriod: 4
        });
    };

    private handleAddAllday = () => {
        this.setState({
            currEvent: { step: 0 },
            currInputPeriod: 1
        });
    };

    private handleCancelAdd = () => {
        this.setState({ currInputPeriod: 0 });
    };

    private handleDeleteEvent = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        const index = e.currentTarget.dataset && e.currentTarget.dataset.index;
        if (!this.props.info || !index) {
            return;
        }
        this.props.onDayChange({
            events: this.props.info.events!.sort((a, b) => a.period - b.period).filter((event, id) => id !== +index)
        });
    };

    private handlePutEvent = (event: {
        content: string;
        isTracking: boolean;
        trackId?: string;
        trackTitle?: string;
        trackStage?: number;
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
                track_stage: event.trackStage || 1
            };
        }

        let newEvents: IEvent[] = [];
        if (this.state.currEvent.step && this.props.info && this.props.info.events) {
            newEvents = this.props.info.events.slice();
            newEvents[this.state.currIndex] = newEvent;
        } else {
            newEvents =
                this.props.info && this.props.info.events ? [...(this.props.info.events || []), newEvent] : [newEvent];
        }
        this.props.onDayChange({
            events: newEvents
        });
        this.setState(prevState => ({ currInputPeriod: 0 }));
    };

    private handleUpdateEvent = (e: React.MouseEvent<HTMLDivElement>) => {
        const sortedIndex = e.currentTarget.dataset && e.currentTarget.dataset.index;
        if (!sortedIndex || !this.props.info || !this.props.info.events) {
            return;
        }

        const event: IEvent = this.props.info.events.sort((a, b) => a.period - b.period)[+sortedIndex];
        const { period, type, content } = event;

        if (type === 1) {
            this.setState({
                currIndex: +sortedIndex,
                currInputPeriod: period,
                currEvent: {
                    content,
                    step: 1,
                    isTracking: false
                }
            });
        } else if (type === 2) {
            this.setState({
                currIndex: +sortedIndex,
                currInputPeriod: period,
                currEvent: {
                    step: 2,
                    isTracking: true,
                    trackTitle: event.track_title,
                    trackContent: event.content,
                    trackId: `${event.track_id}`
                }
            });
        }
    };
}

export default Day;
