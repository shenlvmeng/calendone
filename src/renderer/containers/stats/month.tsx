import React, { Component } from "react";
import moment from "moment";
import classNames from "classnames";
import find from "lodash/find";

import { eventsInCurrMonth, moodsInCurrMonth } from "@/services/calendone";
import { plansInCurrMonth } from "@/services/plans";
import { mapMood, sortMood } from "@/utils";
import { moods, moodsCategory } from "@/utils/constants";

type nullable<T> = T | null;

interface Indicator {
    value: number;
    delta: string;
}

interface IState {
    commonEvents: nullable<Indicator>;
    trackEvents: nullable<Indicator>;
    goals: nullable<Indicator>;
    realizedGoals: nullable<Indicator>;
    currMoods: {
        date: number;
        mood: number;
    }[];
}

const daysInMonth = moment().daysInMonth();
const firstWeekday =
    moment()
        .startOf("month")
        .day() - 1;
const weeks = ~~((daysInMonth + firstWeekday) / 7) + 1;

function safeAbs(num: string) {
    return +num < 0 ? Math.abs(+num) : num;
}

class MonthStats extends Component<{}, IState> {
    public readonly state: IState = {
        commonEvents: null,
        trackEvents: null,
        goals: null,
        realizedGoals: null,
        currMoods: []
    };

    public componentDidMount() {
        // events
        this.fetchMonthIndicator(false);
        this.fetchMonthIndicator(true);
        // plans
        this.fetchMonthPlans(false);
        this.fetchMonthPlans(true);
        // moods
        this.fetchMonthMoods();
    }

    public async fetchMonthIndicator(tracked: boolean) {
        const [curr, prev] = await eventsInCurrMonth(tracked ? 2 : 1);
        const delta = prev ? (((curr - prev) / prev) * 100).toFixed(0) : "-";
        if (tracked) {
            this.setState({
                trackEvents: {
                    delta,
                    value: curr
                }
            });
        } else {
            this.setState({
                commonEvents: {
                    delta,
                    value: curr
                }
            });
        }
    }

    public async fetchMonthPlans(done: boolean) {
        const [curr, prev] = await plansInCurrMonth(done);
        const delta = prev ? (((curr - prev) / prev) * 100).toFixed(0) : "-";
        if (done) {
            this.setState({
                realizedGoals: {
                    delta,
                    value: curr
                }
            });
        } else {
            this.setState({
                goals: {
                    delta,
                    value: curr
                }
            });
        }
    }

    public async fetchMonthMoods() {
        const res = await moodsInCurrMonth();
        this.setState({ currMoods: res });
    }

    public render() {
        const { commonEvents, trackEvents, goals, realizedGoals, currMoods } = this.state;
        const pureMoods = currMoods.map(mood => mood.mood);
        const firstDay = moment().startOf("month");
        firstDay.subtract(firstWeekday, "days");
        return (
            <div className="stats-common-content month-stats">
                <section className="indicators">
                    <div className="indicator-item">
                        <div className="indicator-name">日常事务量</div>
                        <div className="indicator-content">
                            {commonEvents ? commonEvents.value : "-"}
                            <span
                                className={classNames("indicator-delta", {
                                    up: commonEvents && +commonEvents.delta > 0,
                                    down: commonEvents && +commonEvents.delta < 0
                                })}
                            >
                                {commonEvents ? safeAbs(commonEvents.delta) : "-"}%
                            </span>
                            {commonEvents && commonEvents.delta === "-" ? <aside>无上月数据</aside> : null}
                        </div>
                    </div>
                    <div className="indicator-item">
                        <div className="indicator-name">追踪事务量</div>
                        <div className="indicator-content">
                            {trackEvents ? trackEvents.value : "-"}
                            <span
                                className={classNames("indicator-delta", {
                                    up: trackEvents && +trackEvents.delta > 0,
                                    down: trackEvents && +trackEvents.delta < 0
                                })}
                            >
                                {trackEvents ? safeAbs(trackEvents.delta) : "-"}%
                            </span>
                            {trackEvents && trackEvents.delta === "-" ? <aside>无上月数据</aside> : null}
                        </div>
                    </div>
                    <div className="indicator-item">
                        <div className="indicator-name">制定计划</div>
                        <div className="indicator-content">
                            {goals ? goals.value : "-"}
                            <span
                                className={classNames("indicator-delta", {
                                    up: goals && +goals.delta > 0,
                                    down: goals && +goals.delta < 0
                                })}
                            >
                                {goals ? safeAbs(goals.delta) : "-"}%
                            </span>
                            {goals && goals.delta === "-" ? <aside>无上月数据</aside> : null}
                        </div>
                    </div>
                    <div className="indicator-item">
                        <div className="indicator-name">完成计划</div>
                        <div className="indicator-content">
                            {realizedGoals ? realizedGoals.value : "-"}
                            <span
                                className={classNames("indicator-delta", {
                                    up: realizedGoals && +realizedGoals.delta > 0,
                                    down: realizedGoals && +realizedGoals.delta < 0
                                })}
                            >
                                {realizedGoals ? safeAbs(realizedGoals.delta) : "-"}%
                            </span>
                            {realizedGoals && realizedGoals.delta === "-" ? <aside>无上月数据</aside> : null}
                        </div>
                    </div>
                </section>
                <section className="moods">
                    <div className="moods-calendar">
                        <div className="moods-header">情绪图</div>
                        <div className="moods-dates">
                            <div className="moods-weekdays">
                                <span>Mon</span>
                                <span>Tue</span>
                                <span>Wed</span>
                                <span>Thu</span>
                                <span>Fri</span>
                                <span>Sat</span>
                                <span>Sun</span>
                            </div>
                            {Array(weeks)
                                .fill("")
                                .map((_, yIndex) => (
                                    <div className="moods-week" key={yIndex}>
                                        {Array(7)
                                            .fill("")
                                            .map((_, xIndex) => {
                                                const mood = find(currMoods, mood => mood.date === +firstDay);
                                                const currMood = mood ? mood.mood : 0;
                                                firstDay.add(1, "days");
                                                return (
                                                    <div
                                                        className={classNames("moods-day", {
                                                            invisible:
                                                                7 * yIndex + xIndex < firstWeekday ||
                                                                7 * yIndex + xIndex >= daysInMonth + firstWeekday,
                                                            happy: mapMood(currMood) === moodsCategory.happy,
                                                            neutral: mapMood(currMood) === moodsCategory.neutral,
                                                            unhappy: mapMood(currMood) === moodsCategory.unhappy,
                                                            low: mapMood(currMood) === moodsCategory.low,
                                                            scared: mapMood(currMood) === moodsCategory.scared
                                                        })}
                                                        key={xIndex}
                                                    >
                                                        <span className="content">{moods[currMood]}</span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ))}
                        </div>
                        <div className="moods-hints">
                            <span className="moods-hint">
                                <span className="hint" />
                                未知
                            </span>
                            <span className="moods-hint">
                                <span className="hint happy" />
                                开心
                            </span>
                            <span className="moods-hint">
                                <span className="hint unhappy" />
                                不开心
                            </span>
                            <span className="moods-hint">
                                <span className="hint low" />
                                低落
                            </span>
                            <span className="moods-hint">
                                <span className="hint neutral" />
                                普通
                            </span>
                            <span className="moods-hint">
                                <span className="hint scared" />
                                害怕
                            </span>
                        </div>
                    </div>
                    <div className="moods-stat">
                        <div className="moods-header">情绪比例</div>
                        <div className="moods-item-list">
                            {sortMood(pureMoods).map((mood, index) => (
                                <div className="moods-item" key={index}>
                                    {moods[mood.value]}
                                    <span className="moods-count">
                                        {mood.count} / {((mood.count / currMoods.length) * 100).toFixed(0)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        );
    }
}

export default MonthStats;
