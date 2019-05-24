/**
 * @desc use async/await paradigm instead of callback paradigm
 */

import Db, { IDbOperationLog, OpType } from "./db";
import { getAllEvents, getTrackEvents } from "./calendone";
import { getPlans } from "./plans";

/**
 * @desc import
 */
export async function importFrom(data: any, log: (message: string) => void) {
    await Db.transaction("rw", Db.calendar, Db.plans, Db.trackEvents, async () => {
        log("开始导入数据库");
        const { calendar, plans, trackEvents } = data;
        // 清除已有数据
        await Promise.all([Db.calendar.clear(), Db.plans.clear(), Db.trackEvents.clear()]);
        // 更换新数据
        await Promise.all([
            Db.calendar.bulkPut(calendar),
            Db.plans.bulkPut(plans),
            Db.trackEvents.bulkPut(trackEvents)
        ]);
        log("完成导入");
    });
    await Db.opLogs.add({
        type: OpType.Import,
        create_time: Date.now()
    });
}

/**
 * @desc export
 */
export async function exportTo(log: (message: string) => void) {
    const data: any = {};
    await Promise.all([
        (async function() {
            data.calendar = await getAllEvents();
            log("完成日历数据备份");
        })(),
        (async function() {
            data.trackEvents = await getTrackEvents(false);
            log("完成跟踪事件备份");
        })(),
        (async function() {
            const plans = await getPlans();
            data.plans = plans.reverse();
            log("完成计划备份");
        })()
    ]);
    await Db.opLogs.add({
        type: OpType.Export,
        create_time: Date.now()
    });
    return data;
}

/**
 * @desc get all logs
 */
export async function getLogs() {
    return new Promise<IDbOperationLog[]>(async (resolve, reject) => {
        try {
            await Db.opLogs.toArray(resolve);
        } catch (err) {
            reject(err);
        }
    });
}
/**
 * @desc get latest logs
 */
export async function getLastLog(type: OpType) {
    return new Promise<IDbOperationLog | null>(async (resolve, reject) => {
        try {
            await Db.opLogs
                .where("type")
                .equals(type)
                .last(resolve);
        } catch (err) {
            reject(err);
        }
    });
}
