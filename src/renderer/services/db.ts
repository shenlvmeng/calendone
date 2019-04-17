import Dexie from "dexie";

const DB_NAME = "calendone";
const CURRENT_VERSION = 1;

const enum PlanPriority {
    Unknown = 0,
    Normal = 1,
    Important = 2,
    Urgent = 3
}

const enum PlanStage {
    Unknown = 0,
    Doing = 1,
    Done = 2,
    Abandon = 3
}

export const enum EventPeriod {
    Unknown = 0,
    AllDay = 1,
    Morning = 2,
    Afternoon = 3,
    Night = 4
}

export const enum EventType {
    Unknown = 0,
    Normal = 1,
    Tracking = 2
}

const enum TrackStage {
    Unknown = 0,
    Doing = 1,
    Done = 2,
    Abandon = 3
}

const enum Mood {
    Unknown = 0,
    Happy = 1,
    Unamused = 2,
    Normal = 3,
    Angry = 4,
    Low = 5,
    Sleepy = 6,
    Sick = 7,
    Fearful = 8
}

interface IPlan {
    id?: number;
    content: string;
    priority: PlanPriority;
    start_time: number;
    end_time: number;
    stage: PlanStage;
}

export interface IEvent {
    content: string;
    period: EventPeriod;
    type: EventType;
    track_id?: number;
    track_title?: string;
    track_stage?: TrackStage;
}

export interface IDay {
    id?: number;
    date: number;
    mood: Mood;
    events: IEvent[];
}

export interface ITrackEvent {
    id?: number;
    name: string;
    start_time: number;
    end_time: number;
    stage: TrackStage;
}

class Db extends Dexie {
    plans: Dexie.Table<IPlan, number>;
    calendar: Dexie.Table<IDay, number>;
    trackEvents: Dexie.Table<ITrackEvent, number>;

    constructor() {
        super(DB_NAME);
        this.version(CURRENT_VERSION).stores({
            plans: "++id, priority, stage",
            calendar: "++id, date, mood",
            trackEvents: "++id, stage"
        });

        this.plans = this.table("plans");
        this.calendar = this.table("calendar");
        this.trackEvents = this.table("trackEvents");
    }

    public output() {
        // TODO
    }
}

const db = new Db();

export default db;
