/**
 * @desc use async/await paradigm instead of callback paradigm
 */
import Db, { IDay, ITrackEvent } from "@/utils/db";

/**
 * @desc get Events between certain moments
 */
export async function getEventsBetween(start: number, end: number) {
    return new Promise<IDay[]>(async (resolve, reject) => {
        try {
            await Db.calendar
                .where("date")
                .between(start, end, true, true)
                .sortBy("date", resolve);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * @desc get TrackEvents
 */
export async function getTrackEvents(isActive: boolean) {
    const stages = isActive ? [1] : [1, 2, 3];
    return new Promise<ITrackEvent[]>(async (resolve, reject) => {
        try {
            await Db.trackEvents
                .where("stage")
                .anyOf(...stages)
                .toArray(resolve);
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * @desc insert a TrackEvent
 */
export async function addTrackEvent(name: string) {
    return Db.trackEvents.add({
        name,
        start_time: Date.now(),
        end_time: 0,
        stage: 1
    });
}
