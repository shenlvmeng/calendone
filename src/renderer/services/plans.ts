/**
 * @desc use async/await paradigm instead of callback paradigm
 */
import moment from "moment";

import Db, { IPlan } from "./db";
import { currMonth, lastMonth, currYear } from "@/utils";

/**
 * @desc get all plans
 */
export async function getPlans() {
    return new Promise<IPlan[]>(async (resolve, reject) => {
        try {
            await Db.plans
                .where("stage")
                .notEqual(3)
                .reverse()
                .sortBy("end_time", resolve);
        } catch (err) {
            reject(err);
        }
    });
}
/**
 * @desc get sum of plans
 */
export async function countPlans(today?: boolean) {
    return new Promise<number>(async (resolve, reject) => {
        try {
            if (today) {
                await Db.plans
                    .where("stage")
                    .equals(1)
                    .filter(val => val.deadline <= +moment().endOf("day"))
                    .count(resolve);
            } else {
                await Db.plans
                    .where("stage")
                    .notEqual(3)
                    .count(resolve);
            }
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * @desc add a plan
 */
export async function addPlan(name: string) {
    return Db.plans.add({
        content: name,
        priority: 1,
        deadline: 0,
        start_time: Date.now(),
        update_time: Date.now(),
        stage: 1
    });
}

/**
 * @desc update single plan stage
 */
export async function updatePlan(id: number, params: Partial<IPlan>) {
    return Db.plans.update(id, {
        ...params,
        update_time: Date.now()
    });
}

/**
 * @desc update multiple plan stage
 */
export async function updatePlans(plans: IPlan[]) {
    return Db.plans.bulkPut(
        plans.map(plan => ({
            ...plan,
            update_time: Date.now()
        }))
    );
}

/*------------- stats --------------*/
function plansInBound(start: number, end: number, done: boolean) {
    return new Promise<number>(async (resolve, reject) => {
        try {
            await Db.plans
                .where("stage")
                .notEqual(3)
                .and(plan => {
                    if (done) {
                        return plan.stage === 2 && plan.update_time >= start && plan.update_time <= end;
                    }
                    return plan.stage === 1 && plan.deadline >= start && plan.deadline <= end;
                })
                .count(resolve);
        } catch (err) {
            reject(err);
        }
    });
}

export async function plansInCurrMonth(done: boolean) {
    const [currMonthStart, currMonthEnd] = currMonth();
    const [lastMonthStart, lastMonthEnd] = lastMonth();
    return await Promise.all([
        plansInBound(currMonthStart, currMonthEnd, done),
        plansInBound(lastMonthStart, lastMonthEnd, done)
    ]);
}

export async function plansInCurrYear(done: boolean) {
    const [currYearStart, currYearEnd] = currYear();
    return await plansInBound(currYearStart, currYearEnd, done);
}
