/**
 * @desc use async/await paradigm instead of callback paradigm
 */

import Db, { IPortLog } from "./db";

/**
 * @desc get all logs
 */
export async function getPortLogs() {
    return new Promise<IPortLog[]>(async (resolve, reject) => {
        try {
            await Db.portLogs.toArray(resolve);
        } catch (err) {
            reject(err);
        }
    });
}
