import React, { Component } from "react";
import moment from "moment";
import find from "lodash/find";
import groupBy from "lodash/groupBy";

import { getAllEvents, getTrackEvents } from "@/services/calendone";
import { getPlans } from "@/services/plans";
import { getLogs } from "@/services/data";
import { IDay, IPlan, OpType, PlanStage, TrackStage, EventPeriod, PlanPriority } from "@/services/db";
import { moods, periods, userNameStorageKey, userAvatarStorageKey } from "@/utils/constants";

interface IState {
    days: number;
    events: number;
    minEventsPerDay: number;
    maxEventsPerDay: number;
    mostMood: number;
    mostPeriod: number;
    trackedEvents: number;
    doneEvents: number;
    abandonEvents: number;
    longestEvent: number;
    plans: number;
    importantPlans: number;
    urgentPlans: number;
    importCount: number;
    exportCount: number;
    lastImportTime: number;
    lastExportTime: number;
    progress: number;
}

class AllStats extends Component<{}, IState> {
    public readonly state: IState = {
        days: 0,
        events: 0,
        minEventsPerDay: 0,
        maxEventsPerDay: 0,
        mostMood: 0,
        mostPeriod: 0,
        trackedEvents: 0,
        doneEvents: 0,
        abandonEvents: 0,
        longestEvent: 0,
        plans: 0,
        importantPlans: 0,
        urgentPlans: 0,
        importCount: 0,
        exportCount: 0,
        lastImportTime: 0,
        lastExportTime: 0,
        progress: 0
    };

    public daysRaw: IDay[] = [];
    public plansRaw: IPlan[] = [];

    public async componentDidMount() {
        await Promise.all([this.parseDays(), this.parsePlans(), this.parseTrackEvents(), this.parseDbLogs()]);
        this.computeProgress();
    }

    public async parseDays() {
        const events = await getAllEvents();
        this.daysRaw = events;

        let eventCount = 0;
        let minEventsPerDay = 0;
        let maxEventsPerDay = 0;
        const currMoods: {
            [key: number]: number;
        } = {};
        const currPeriods: {
            [key: number]: number;
        } = {};
        events.forEach(day => {
            const currEventCount = day.events.length;
            eventCount += currEventCount;
            if (currEventCount > 0) {
                if ((minEventsPerDay > 0 && currEventCount < minEventsPerDay) || minEventsPerDay === 0) {
                    minEventsPerDay = currEventCount;
                }
            }
            if (currEventCount > maxEventsPerDay) {
                maxEventsPerDay = currEventCount;
            }
            if (day.mood) {
                if (currMoods[day.mood] >= 0) {
                    currMoods[day.mood] += 1;
                } else {
                    currMoods[day.mood] = 1;
                }
            }
            day.events.forEach(event => {
                if (currPeriods[event.period] >= 0) {
                    currPeriods[event.period] += 1;
                } else {
                    currPeriods[event.period] = 1;
                }
            });
        });
        const maxMood = Math.max(...Object.values(currMoods));
        const maxPeriod = Math.max(...Object.values(currPeriods));

        this.setState({
            minEventsPerDay,
            maxEventsPerDay,
            days: events.length,
            events: eventCount,
            mostMood: +(find(Object.keys(currMoods), mood => currMoods[mood] === maxMood) || 0),
            mostPeriod: +(find(Object.keys(currPeriods), period => currPeriods[period] === maxPeriod) || 0)
        });
    }

    public async parseTrackEvents() {
        const trackEvents = await getTrackEvents(false);
        const [doneEvents, abandonEvents, longestEvent] = trackEvents.reduce(
            (prev, curr) => {
                let [done, abandon, longest] = prev;
                if (curr.stage === TrackStage.Done) {
                    done += 1;
                } else if (curr.stage === TrackStage.Abandon) {
                    abandon += 1;
                }
                if (curr.end_time && curr.end_time - curr.start_time > prev[2]) {
                    longest = curr.end_time - curr.start_time;
                }
                return [done, abandon, longest];
            },
            [0, 0, 0]
        );
        this.setState({
            doneEvents,
            abandonEvents,
            longestEvent,
            trackedEvents: trackEvents.length
        });
    }

    public async parsePlans() {
        const plans = await getPlans();
        this.plansRaw = plans;

        const plansLevelMap = groupBy(plans, "priority");
        this.setState({
            plans: plans.length,
            importantPlans: plansLevelMap[PlanPriority.Important] ? plansLevelMap[PlanPriority.Important].length : 0,
            urgentPlans: plansLevelMap[PlanPriority.Urgent] ? plansLevelMap[PlanPriority.Urgent].length : 0
        });
    }

    public async parseDbLogs() {
        const logs = await getLogs();
        let importCount = 0;
        let exportCount = 0;
        let lastImportTime = 0;
        let lastExportTime = 0;
        logs.forEach(log => {
            if (log.type === OpType.Import) {
                importCount += 1;
                lastImportTime = log.create_time;
            } else if (log.type === OpType.Export) {
                exportCount += 1;
                lastExportTime = log.create_time;
            }
        });
        this.setState({
            importCount,
            exportCount,
            lastImportTime,
            lastExportTime
        });
    }

    public computeProgress() {
        const {
            doneEvents,
            abandonEvents,
            mostMood,
            plans,
            importantPlans,
            urgentPlans,
            importCount,
            exportCount
        } = this.state;
        let indicator = 0;
        // common: 4 periods
        let periodBitmap = 0b0000;
        this.daysRaw.some(day => {
            day.events.some(event => {
                const lastBitmap = periodBitmap;
                if (event.period === EventPeriod.AllDay) {
                    periodBitmap |= 0b1000;
                }
                if (event.period === EventPeriod.Morning) {
                    periodBitmap |= 0b0100;
                }
                if (event.period === EventPeriod.Afternoon) {
                    periodBitmap |= 0b0010;
                }
                if (event.period === EventPeriod.Night) {
                    periodBitmap |= 0b0001;
                }
                if (periodBitmap !== lastBitmap) {
                    indicator += 1;
                }
                if (periodBitmap === 0b1111) {
                    return true;
                }
                return false;
            });
            return false;
        });
        // track events: done & abandon
        if (doneEvents > 0) {
            indicator += 1;
        }
        if (abandonEvents > 0) {
            indicator += 1;
        }
        // mood
        if (mostMood > 0) {
            indicator += 1;
        }
        // plans: 3 levels
        if (plans > 0) {
            indicator += 1;
        }
        if (importantPlans > 0) {
            indicator += 1;
        }
        if (urgentPlans > 0) {
            indicator += 1;
        }
        if (find(this.plansRaw, plan => plan.stage === PlanStage.Done)) {
            indicator += 1;
        }
        if (find(this.plansRaw, plan => plan.deadline > 0)) {
            indicator += 1;
        }
        // stats
        indicator += 1;
        // import/export
        if (importCount > 0) {
            indicator += 1;
        }
        if (exportCount > 0) {
            indicator += 1;
        }
        // user: name and avatar
        if (localStorage.getItem(userNameStorageKey)) {
            indicator += 1;
        }
        if (localStorage.getItem(userAvatarStorageKey)) {
            indicator += 1;
        }
        this.setState({ progress: indicator / 17 });
    }

    public render() {
        const {
            days,
            events,
            minEventsPerDay,
            maxEventsPerDay,
            mostMood,
            mostPeriod,
            trackedEvents,
            doneEvents,
            abandonEvents,
            longestEvent,
            plans,
            importantPlans,
            urgentPlans,
            importCount,
            exportCount,
            lastImportTime,
            lastExportTime,
            progress
        } = this.state;
        return (
            <div className="stats-common-content all-stats">
                <section className="stats-all">
                    <div className="stats-divider">
                        <span className="divider-content">Calendar</span>
                    </div>
                    <div className="stats-item">
                        累计日记
                        <span className="stats-count">{days} 天</span>
                    </div>
                    <div className="stats-item">
                        累计计事
                        <span className="stats-count">{events} 件</span>
                    </div>
                    <div className="stats-item">
                        单日最多事件
                        <span className="stats-count">{maxEventsPerDay} 件</span>
                    </div>
                    <div className="stats-item">
                        单日最少事件
                        <span className="stats-count">{minEventsPerDay} 件</span>
                    </div>
                    <div className="stats-item">
                        最常使用心情
                        <span className="stats-count">{mostMood ? moods[mostMood] : "-"}</span>
                    </div>
                    <div className="stats-item">
                        最活跃时段
                        <span className="stats-count">{mostPeriod ? periods[mostPeriod] : "-"}</span>
                    </div>
                    <div className="stats-divider">
                        <span className="divider-content">Track Events</span>
                    </div>
                    <div className="stats-item">
                        累计跟踪事项
                        <span className="stats-count">{trackedEvents} 件</span>
                    </div>
                    <div className="stats-item">
                        完成跟踪事项
                        <span className="stats-count">{doneEvents} 件</span>
                    </div>
                    <div className="stats-item">
                        中止跟踪事项
                        <span className="stats-count">{abandonEvents} 件</span>
                    </div>
                    <div className="stats-item">
                        最长追踪时间
                        <span className="stats-count">{moment.duration(longestEvent).asDays()} 天</span>
                    </div>
                    <div className="stats-divider">
                        <span className="divider-content">Plans</span>
                    </div>
                    <div className="stats-item">
                        累计计划
                        <span className="stats-count">{plans} 件</span>
                    </div>
                    <div className="stats-item">
                        关键计划
                        <span className="stats-count">{importantPlans} 件</span>
                    </div>
                    <div className="stats-item">
                        紧要计划
                        <span className="stats-count">{urgentPlans} 件</span>
                    </div>
                    <div className="stats-divider">
                        <span className="divider-content">Import / Export</span>
                    </div>
                    <div className="stats-item">
                        备份
                        <span className="stats-count">{exportCount} 次</span>
                    </div>
                    <div className="stats-item">
                        恢复
                        <span className="stats-count">{importCount} 次</span>
                    </div>
                    {exportCount > 0 ? (
                        <div className="stats-item">
                            上次备份
                            <span className="stats-count">
                                {moment.duration(Date.now() - lastExportTime).humanize(true)}
                            </span>
                        </div>
                    ) : null}
                    {importCount > 0 ? (
                        <div className="stats-item">
                            上次恢复
                            <span className="stats-count">
                                {moment.duration(Date.now() - lastImportTime).humanize(true)}
                            </span>
                        </div>
                    ) : null}
                    <div className="stats-divider">
                        <span className="divider-content">功能探索进度</span>
                    </div>
                    <div className="stats-progress-wrapper">
                        <div className="stats-progress">
                            <div className="stats-progress-content" style={{ width: `${progress * 100}%` }} />
                        </div>
                        <div className="stats-progress-text">{(progress * 100).toFixed(1)}%</div>
                    </div>
                </section>
            </div>
        );
    }
}

export default AllStats;
