import React from "react";
import moment from "moment";
import chunk from "lodash/chunk";
import classNames from "classnames";
import Drawer from "rc-drawer";
import "rc-drawer/assets/index.css";

import Layout from "../layout";
import { IDay } from "@/utils/db";
import "./index.less";

interface IDate {
    month: number;
    date: number;
    timestamp: number;
}

interface IState {
    days: IDay[];
    now: moment.Moment;
}

moment.locale("zh-cn");

function generatePaddedMonth(start: moment.Moment, end: moment.Moment) {
    const dates: IDate[] = [];
    while (true) {
        dates.push({
            timestamp: +start,
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
        now: moment()
    };

    public renderMain() {
        const { now } = this.state;
        const monthStart = moment(+now)
            .startOf("month")
            .startOf("week");
        const monthEnd = moment(+now)
            .endOf("month")
            .endOf("week");
        const weeks = chunk(generatePaddedMonth(monthStart, monthEnd), 7);
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
                        {weeks.map((week, index) => (
                            <tr key={index}>
                                {week.map((date, index) => (
                                    <td
                                        key={index}
                                        className={classNames({
                                            disabled: moment().isBefore(date.timestamp, "day"),
                                            "not-same-month": date.month !== now.month()
                                        })}
                                    >
                                        <div className="date-header">
                                            <span
                                                className={classNames({ now: moment().isSame(date.timestamp, "day") })}
                                            >
                                                {date.date}
                                            </span>
                                        </div>
                                        <div className="date-events" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Drawer width="720px" level={null} handler={false} open={true} placement="right">
                    Test
                </Drawer>
            </div>
        );
    }

    private handlePrevMonth = () => {
        this.setState(prevState => ({
            now: prevState.now.subtract(1, "months")
        }));
    };

    private handleNextMonth = () => {
        this.setState(prevState => ({
            now: prevState.now.add(1, "months")
        }));
    };

    private handlePrevYear = () => {
        this.setState(prevState => ({
            now: prevState.now.subtract(1, "years")
        }));
    };

    private handleNextYear = () => {
        this.setState(prevState => ({
            now: prevState.now.add(1, "years")
        }));
    };
}

export default Calendone;
