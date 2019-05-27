import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import moment from "moment";
import classNames from "classnames";
import chunk from "lodash/chunk";
import find from "lodash/find";
import Drawer from "rc-drawer";
import produce from "immer";
import Dialog from "rc-dialog";
import "rc-drawer/assets/index.css";

import { StoreContext } from "@/store";
import { getEventsBetween, updateCertainDay } from "@/services/calendone";
import { IEvent } from "@/services/db";
import { noop } from "@/utils";
import { moods, hasSetNameStorageKey } from "@/utils/constants";
import Button from "@/components/button";
import DayDetail from "./day";
import "./index.less";

export interface IDate {
    year: number;
    month: number;
    day: number;
    timestamp: number;
}

export interface IDayEvent {
    id?: number;
    year: number;
    month: number;
    day: number;
    timestamp: number;
    date?: number;
    mood?: number;
    events?: IEvent[];
}

interface IState {
    days: IDayEvent[];
    now: moment.Moment;
    currIndex: number;
    hasSetName: boolean;
    userName: string;
}

moment.locale("zh-cn");

function generatePaddedMonth(start: moment.Moment, end: moment.Moment) {
    const dates: IDate[] = [];
    while (true) {
        dates.push({
            timestamp: +start,
            year: start.year(),
            month: start.month(),
            day: start.date()
        });
        start.add(1, "days");
        if (!start.isBefore(end)) {
            break;
        }
    }
    return dates;
}

/**
 * calendone part
 */
class Calendone extends Component<RouteComponentProps<{}>, IState> {
    public static contextType = StoreContext;

    public readonly state: IState = {
        days: [],
        now: moment(),
        currIndex: -1,
        hasSetName: !!localStorage.getItem(hasSetNameStorageKey),
        userName: ""
    };

    public async componentDidMount() {
        this.getCurrentEvents();
    }

    public async componentDidUpdate(prevProps: any, prevState: IState) {
        if (+prevState.now !== +this.state.now) {
            this.getCurrentEvents();
        }
    }

    public getCurrentBound() {
        return [
            moment(+this.state.now)
                .startOf("month")
                .startOf("week"),
            moment(+this.state.now)
                .endOf("month")
                .endOf("week")
        ];
    }

    public async getCurrentEvents() {
        const [monthStart, monthEnd] = this.getCurrentBound();
        const days = await getEventsBetween(+monthStart, +monthEnd);
        this.setState({
            days: generatePaddedMonth(monthStart, monthEnd).map(date => {
                const currDay = find(days, day => +day.date === date.timestamp);
                if (currDay) {
                    return {
                        ...date,
                        ...currDay
                    };
                }
                return date;
            })
        });
    }

    public renderDay(index: number, date: IDate) {
        const currDayDetail = this.state.days[index];
        const { mood, events } = currDayDetail;
        return (
            <React.Fragment>
                <div className="date-header">
                    {mood ? <span className="calendar-day-mood">{moods[mood]}</span> : null}
                    <span
                        className={classNames({
                            now: moment().isSame(date.timestamp, "day")
                        })}
                    >
                        {date.day}
                    </span>
                </div>
                <div className="date-events">
                    {(events || [])
                        .sort((a, b) => a.period - b.period)
                        .map((event, index) => (
                            <div
                                className={classNames("calendar-event-item", {
                                    morning: event.period === 2,
                                    afternoon: event.period === 3,
                                    night: event.period === 4,
                                    "track-event": event.type === 2,
                                    "track-finish": event.track_stage === 2,
                                    "track-abandon": event.track_stage === 3
                                })}
                                key={index}
                            >
                                <span className="event-title">
                                    {event.track_title ? `${event.track_title}` : ""}
                                    {event.track_title && event.content ? ": " : ""}
                                </span>
                                {event.content}
                            </div>
                        ))}
                </div>
            </React.Fragment>
        );
    }

    public render() {
        const { now, days, currIndex, hasSetName, userName } = this.state;
        const weeks = chunk(days, 7);
        return (
            <div className="calendone">
                <h1>Calendar / 日记</h1>
                <div className="current-month">
                    <span className="fast-prev" onClick={this.handlePrevYear} />
                    <span className="prev" onClick={this.handlePrevMonth} />
                    {now.format("MMMM")} {now.year()}
                    <span className="next" onClick={this.handleNextMonth} />
                    <span className="fast-next" onClick={this.handleNextYear} />
                </div>
                <div className="calendar-head">
                    <div className="week-day">MON</div>
                    <div className="week-day">TUE</div>
                    <div className="week-day">WED</div>
                    <div className="week-day">THU</div>
                    <div className="week-day">FRI</div>
                    <div className="week-day weekend">SAT</div>
                    <div className="week-day weekend">SUN</div>
                </div>
                <table>
                    <tbody>
                        {weeks.map((week, wIndex) => (
                            <tr key={wIndex}>
                                {week.map((date, index) => {
                                    const disabled = moment().isBefore(date.timestamp, "day");
                                    return (
                                        <td
                                            key={index}
                                            data-index={wIndex * 7 + index}
                                            className={classNames({
                                                disabled,
                                                "not-same-month": date.month !== now.month()
                                            })}
                                            onClick={disabled ? noop : this.handleDayClick}
                                        >
                                            {this.renderDay(wIndex * 7 + index, date)}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Drawer
                    width="720px"
                    level={null}
                    handler={false}
                    open={currIndex >= 0}
                    placement="right"
                    onMaskClick={this.handleCloseDrawer}
                >
                    <DayDetail
                        info={currIndex >= 0 ? days[currIndex] : null}
                        onDayChange={this.handleDayChange}
                        onClose={this.handleCloseDrawer}
                    />
                </Drawer>
                <Dialog
                    wrapClassName="common-dialog-wrap"
                    className="common-dialog set-user-name"
                    visible={!hasSetName}
                    animation="zoom"
                    maskAnimation="fade"
                    closable={false}
                    onClose={this.handleCloseDialog}
                    destroyOnClose={true}
                >
                    <div className="close-btn iconfont" onClick={this.handleCloseDialog} />
                    <div className="title">How can I call you?</div>
                    <div className="hint">不超过20字符，随时可以在「User」中修改</div>
                    <input
                        className={classNames("user-name", { error: !userName.trim() })}
                        placeholder="e.g. Bebop Ed"
                        maxLength={20}
                        onChange={this.handleUserNameChange}
                    />
                    <Button type="primary" onClick={this.handleSetUserName} disabled={!userName.trim()}>
                        确 认
                    </Button>
                </Dialog>
            </div>
        );
    }

    private handlePrevMonth = () => {
        this.setState(
            prevState => ({
                now: prevState.now.subtract(1, "months")
            }),
            () => this.getCurrentEvents()
        );
    };

    private handleNextMonth = () => {
        this.setState(
            prevState => ({
                now: prevState.now.add(1, "months")
            }),
            () => this.getCurrentEvents()
        );
    };

    private handlePrevYear = () => {
        this.setState(
            prevState => ({
                now: prevState.now.subtract(1, "years")
            }),
            () => this.getCurrentEvents()
        );
    };

    private handleNextYear = () => {
        this.setState(
            prevState => ({
                now: prevState.now.add(1, "years")
            }),
            () => this.getCurrentEvents()
        );
    };

    private handleDayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const index = e.currentTarget.dataset && e.currentTarget.dataset.index;
        if (index) {
            this.setState({ currIndex: +index });
        }
    };

    private handleDayChange = async (delta: { mood?: number; events?: IEvent[] }) => {
        const { currIndex, days } = this.state;
        if (!currIndex) {
            return;
        }

        const currDay = days[currIndex];
        if (currDay) {
            const id = await updateCertainDay(delta, currDay.timestamp, currDay.id);
            if (!currDay.id) {
                currDay.id = id;
            }
        }

        this.setState(
            produce((draft: IState) => {
                const { mood, events } = delta;
                const currDay = draft.days[draft.currIndex];
                if (mood) {
                    currDay.mood = mood;
                }
                if (events) {
                    currDay.events = events;
                }
            })
        );
    };

    private handleCloseDrawer = () => {
        this.setState({ currIndex: -1 });
    };

    private handleCloseDialog = () => {
        localStorage.setItem(hasSetNameStorageKey, "yes");
        this.setState({ hasSetName: true });
    };

    private handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ userName: e.currentTarget.value });
    };

    private handleSetUserName = () => {
        const newName = this.state.userName.trim();
        if (!newName) {
            return;
        }
        this.context.setUser &&
            this.context.setUser({
                name: newName
            });
        this.setState({ hasSetName: true });
    };
}

export default Calendone;
