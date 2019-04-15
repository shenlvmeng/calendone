import React from "react";
import moment from "moment";
import chunk from "lodash/chunk";
import classNames from "classnames";
import find from "lodash/find";
import Drawer from "rc-drawer";
import "rc-drawer/assets/index.css";

import Layout from "../layout";
import { getEventsBetween } from "@/services/calendone";
import { IDay } from "@/utils/db";
import { noop } from "@/utils";
import DayDetail from "./day";
import "./index.less";

export interface IDate {
    year: number;
    month: number;
    date: number;
    timestamp: number;
}

export interface IDayEvent extends IDate, IDay {}

interface IState {
    days: (IDayEvent | IDate)[];
    now: moment.Moment;
    currIndex: number;
}

moment.locale("zh-cn");

function generatePaddedMonth(start: moment.Moment, end: moment.Moment) {
    const dates: IDate[] = [];
    while (true) {
        dates.push({
            timestamp: +start,
            year: start.year(),
            month: start.month(),
            date: start.date()
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
class Calendone extends Layout<IState> {
    public readonly state: IState = {
        days: [],
        now: moment(),
        currIndex: -1
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

    public renderMain() {
        const { now, days, currIndex } = this.state;
        const weeks = chunk(days, 7);
        return (
            <div className="calendone">
                <h1>Calendar</h1>
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
                                            <div className="date-header">
                                                <span
                                                    className={classNames({
                                                        now: moment().isSame(date.timestamp, "day")
                                                    })}
                                                >
                                                    {date.date}
                                                </span>
                                            </div>
                                            <div className="date-events" />
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
                    <DayDetail info={currIndex >= 0 ? days[currIndex] : null} onClose={this.handleCloseDrawer} />
                </Drawer>
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

    private handleCloseDrawer = () => {
        this.setState({ currIndex: -1 });
    };
}

export default Calendone;
