/**
 * @desc use async/await paradigm instead of callback paradigm
 */
import Db, { IDay, ITrackEvent } from "./db";
import { currMonth, lastMonth, currYear } from "@/utils";

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
export async function addTrackEvent(name: string, date: number) {
    return Db.trackEvents.add({
        name,
        start_time: date,
        end_time: 0,
        stage: 1,
        create_time: Date.now(),
        update_time: Date.now()
    });
}

/**
 * @desc update status of a TrackEvent
 */
export async function updateTrackEventStatus(id: number, newStatus: number, date: number) {
    await Db.trackEvents.update(id, {
        stage: newStatus,
        end_time: date,
        update_time: Date.now()
    });
}

/**
 * @desc update certain day detail
 */
export async function updateCertainDay(params: Partial<IDay>, ts: number, id?: number) {
    if (id) {
        return await Db.calendar.update(id, params);
    }
    return await Db.calendar.add({
        date: ts,
        mood: params.mood || 0,
        events: params.events || []
    });
}

/*------------- stats --------------*/
function eventsInBound(start: number, end: number, type?: number) {
    return new Promise<number>(async (resolve, reject) => {
        try {
            await Db.calendar
                .where("date")
                .between(start, end, true, true)
                .toArray(res => {
                    const count = res.reduce((prev, curr) => {
                        const events = type ? curr.events.filter(event => event.type === type) : curr.events;
                        return prev + events.length;
                    }, 0);
                    resolve(count);
                });
        } catch (err) {
            reject(err);
        }
    });
}
export async function eventsInCurrMonth(type?: number) {
    const [currMonthStart, currMonthEnd] = currMonth();
    const [lastMonthStart, lastMonthEnd] = lastMonth();
    return await Promise.all([
        eventsInBound(currMonthStart, currMonthEnd, type),
        eventsInBound(lastMonthStart, lastMonthEnd, type)
    ]);
}

export async function eventsInCurrYear(type?: number) {
    const [currYearStart, currYearEnd] = currYear();
    return await eventsInBound(currYearStart, currYearEnd, type);
}

export async function moodsInCurrMonth() {
    const [currMonthStart, currMonthEnd] = currMonth();
    const days = await getEventsBetween(currMonthStart, currMonthEnd);
    return days.map(({ mood, date }) => ({
        mood,
        date
    }));
}

export async function moodsInCurrYear() {
    const [currYearStart, currYearEnd] = currYear();
    const days = await getEventsBetween(currYearStart, currYearEnd);
    return days.map(({ mood, date }) => ({
        mood,
        date
    }));
}
