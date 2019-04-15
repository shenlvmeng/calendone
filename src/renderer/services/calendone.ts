import Db, { IDay, ITrackEvent } from "@/utils/db";

/**
 * @desc get Events between certain moments
 */
export async function getEventsBetween(start: number, end: number, cb: (days: IDay[]) => void) {
    await Db.calendar
        .where("date")
        .between(start, end, true, true)
        .sortBy("date", cb);
}

export async function getTrackEvents(isActive: boolean, cb: (events: ITrackEvent[]) => void) {
    const stages = isActive ? [1] : [1, 2, 3];
    await Db.trackEvents
        .where("stage")
        .anyOf(...stages)
        .toArray(cb);
}
