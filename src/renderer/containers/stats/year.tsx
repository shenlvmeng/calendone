import React, { Component } from "react";
import moment from "moment";
import classNames from "classnames";
import findIndex from "lodash/findIndex";
import cloneDeep from "lodash/cloneDeep";

import { eventsInCurrYear, moodsInCurrYear } from "@/services/calendone";
import { plansInCurrYear } from "@/services/plans";
import { mapMood, sortMood } from "@/utils";
import { oneDay, moods, moodsCategory } from "@/utils/constants";

interface IState {
    commonEvents: number;
    trackEvents: number;
    goals: number;
    realizedGoals: number;
    currMoods: {
        date: number;
        mood: number;
    }[];
}

const firstWeekday =
    moment()
        .startOf("year")
        .day() - 1;
const totalDays = moment().isLeapYear() ? 366 : 365;
const startDay = +moment()
    .startOf("year")
    .startOf("week");

class YearStats extends Component<{}, IState> {
    public readonly state: IState = {
        commonEvents: -1,
        trackEvents: -1,
        goals: -1,
        realizedGoals: -1,
        currMoods: []
    };
    public currentDays = moment().dayOfYear();

    public componentDidMount() {
        // events
        this.fetchYearIndicator(false);
        this.fetchYearIndicator(true);
        // plans
        this.fetchYearPlans(false);
        this.fetchYearPlans(true);
        // moods
        this.fetchYearMoods();
    }

    public async fetchYearIndicator(tracked: boolean) {
        const count = await eventsInCurrYear(tracked ? 2 : 1);
        if (tracked) {
            this.setState({ trackEvents: count });
        } else {
            this.setState({ commonEvents: count });
        }
    }

    public async fetchYearPlans(done: boolean) {
        const count = await plansInCurrYear(done);
        if (done) {
            this.setState({ realizedGoals: count });
        } else {
            this.setState({ goals: count });
        }
    }

    public async fetchYearMoods() {
        const res = await moodsInCurrYear();
        this.setState({ currMoods: res });
    }

    public render() {
        const { commonEvents, trackEvents, goals, realizedGoals, currMoods } = this.state;
        const tmpMoods = currMoods.slice(0);
        const pureMoods = currMoods.map(mood => mood.mood);
        return (
            <div className="stats-common-content year-stats">
                <section className="indicators">
                    <div className="indicator-item">
                        <div className="indicator-name">日常事务量</div>
                        <div className="indicator-content">{commonEvents > 0 ? commonEvents : "-"}</div>
                    </div>
                    <div className="indicator-item">
                        <div className="indicator-name">追踪事务量</div>
                        <div className="indicator-content">{trackEvents > 0 ? trackEvents : "-"}</div>
                    </div>
                    <div className="indicator-item">
                        <div className="indicator-name">制定计划</div>
                        <div className="indicator-content">{goals > 0 ? goals : "-"}</div>
                    </div>
                    <div className="indicator-item">
                        <div className="indicator-name">完成计划</div>
                        <div className="indicator-content">{realizedGoals > 0 ? realizedGoals : "-"}</div>
                    </div>
                </section>
                <section className="moods">
                    <div className="moods-calendar">
                        <div className="moods-header">情绪图</div>
                        <div className="moods-months">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May</span>
                            <span>Jun</span>
                            <span>Jul</span>
                            <span>Aug</span>
                            <span>Sep</span>
                            <span>Oct</span>
                            <span>Nov</span>
                            <span>Dec</span>
                        </div>
                        <div className="moods-dates">
                            <div className="moods-weekdays">
                                <div>Mon</div>
                                <div>Wed</div>
                                <div>Fri</div>
                                <div>Sun</div>
                            </div>
                            <div className="moods-days">
                                {Array(totalDays + firstWeekday)
                                    .fill("")
                                    .map((_, index) => {
                                        const currDayTimestamp = startDay + index * oneDay;
                                        const id = findIndex(tmpMoods, mood => mood.date === +currDayTimestamp);
                                        let currMood: number = 0;
                                        if (id > -1) {
                                            currMood = cloneDeep(tmpMoods[id].mood);
                                            // for efficiency
                                            tmpMoods.splice(id, 1);
                                        }
                                        return (
                                            <div
                                                className={classNames("moods-day", {
                                                    invisible: index < firstWeekday || index > totalDays + firstWeekday,
                                                    after: index - 1 > this.currentDays,
                                                    happy: mapMood(currMood) === moodsCategory.happy,
                                                    neutral: mapMood(currMood) === moodsCategory.neutral,
                                                    unhappy: mapMood(currMood) === moodsCategory.unhappy,
                                                    low: mapMood(currMood) === moodsCategory.low,
                                                    scared: mapMood(currMood) === moodsCategory.scared
                                                })}
                                                key={index}
                                            >
                                                <span className="content">{moods[currMood]}</span>
                                            </div>
                                        );
                                    })}
                            </div>
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
                    {pureMoods.length ? (
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
                    ) : null}
                </section>
            </div>
        );
    }
}

export default YearStats;
