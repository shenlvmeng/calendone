import React, { useState, useEffect, useCallback } from "react";
import classNames from "classnames";
import moment from "moment";
import Switch from "rc-switch";

import { ITrackEvent, TrackStage } from "@/services/db";
import { getTrackEvents, updateTrackEventStatus } from "@/services/calendone";
import Icon from "@/components/icon";
import confirm from "@/components/confirm";

import "rc-switch/assets/index.css";
import "./index.less";

const TrackEvents: React.FunctionComponent<{}> = () => {
    const [events, setEvents] = useState<ITrackEvent[]>([]);
    const [onlySeeActive, setSeeActive] = useState<boolean>(true);

    useEffect(() => {
        getTrackEvents(false).then(events => {
            if (events) {
                events.sort((e1, e2) => e2.update_time - e1.start_time);
                setEvents(events);
            }
        });
    }, []);

    const handleChange = useCallback(
        (val: boolean) => {
            setSeeActive(!val);
        },
        [setSeeActive]
    );

    const handleDelete = (id: number) => {
        confirm({
            title: "删除",
            message: "当前跟踪事项将被删除，是否继续",
            closable: true,
            onConfirm: async () => {
                await updateTrackEventStatus(id, 4, Date.now());
                setEvents(events.filter(e => e.id !== id));
            }
        });
    };

    let renderedEvents: ITrackEvent[] = events;
    if (onlySeeActive) {
        renderedEvents = renderedEvents.filter(event => event.stage === TrackStage.Doing);
    }
    return (
        <div className="track-events-wrap">
            <h1>Track Events / 跟踪事项</h1>
            <div className="switch">
                <Switch onChange={handleChange} checkedChildren="全部" unCheckedChildren="进行" />
            </div>
            {renderedEvents.length ? (
                <article className="track-events">
                    {renderedEvents.map(event => (
                        <div className="track-event-item" key={event.id}>
                            <div className="track-event-id">#{event.id}</div>
                            <div
                                className={classNames("stage-dot", {
                                    doing: event.stage === TrackStage.Doing,
                                    done: event.stage === TrackStage.Done
                                })}
                            />
                            <div className="track-delete" onClick={() => handleDelete(event.id!)}>
                                删除
                            </div>
                            <div className="track-event-content">
                                <h3>{event.name}</h3>
                                <div className="track-event-date">
                                    {event.stage === TrackStage.Doing
                                        ? "已跟踪"
                                        : event.stage === TrackStage.Done
                                        ? "完成于"
                                        : "中止于"}
                                    {event.stage === TrackStage.Doing ? (
                                        <span className="track-duration">
                                            {moment
                                                .duration(Date.now() - event.start_time)
                                                .asDays()
                                                .toFixed(0)}
                                            天
                                        </span>
                                    ) : (
                                        ` ${moment
                                            .duration(event.end_time - event.start_time)
                                            .asDays()
                                            .toFixed(0)}天后`
                                    )}
                                </div>
                                <div className="track-event-date">
                                    <p>开始时间: {moment(event.start_time).format("YYYY-MM-DD")}</p>
                                    <p>创建时间: {moment(event.create_time).format("YYYY-MM-DD")}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </article>
            ) : (
                <div className="empty-hint">
                    <Icon type={onlySeeActive ? "yes" : "info"} />
                    <p className="hint-content">
                        {onlySeeActive ? "暂无进行中的跟踪事项，请继续加油~" : "暂无跟踪事项记录，可以在日历中添加"}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TrackEvents;
