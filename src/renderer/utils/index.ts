import moment from "moment";
import groupBy from "lodash/groupBy";

import { moodsCategory } from "@/utils/constants";
import { openExternalLink } from "../../main/utils";

export const noop = () => {};
export const isUndefined = (value: any) => value === void 0;

const dayDiffStrs = {
    "-2": "前天",
    "-1": "昨天",
    0: "今天",
    1: "明天",
    2: "后天"
};

export const fromNow = (ts: number) => {
    const deadline = moment(ts).startOf("day");
    const days = deadline.diff(moment().startOf("day"), "days");
    const humanizeStr = dayDiffStrs[days];
    if (humanizeStr) {
        return humanizeStr;
    }
    return deadline.format("YYYY-MM-DD");
};

export const currMonth = () => {
    const m = moment();
    return [+m.startOf("month"), +m.endOf("month")];
};
export const lastMonth = () => {
    const m = moment();
    m.subtract(1, "month");
    const lastMonthNow = +m;
    return [+m.startOf("month"), lastMonthNow];
};

export const currYear = () => {
    const m = moment();
    return [+m.startOf("year"), +m.endOf("year")];
};

const moodsMap = {
    0: moodsCategory.unknown,
    1: moodsCategory.happy,
    2: moodsCategory.unhappy,
    3: moodsCategory.neutral,
    4: moodsCategory.unhappy,
    5: moodsCategory.low,
    6: moodsCategory.low,
    7: moodsCategory.low,
    8: moodsCategory.scared
};

export const mapMood = (mood: number) => moodsMap[mood || 0];
export const sortMood = (moods: number[]) => {
    const map = groupBy(moods);
    const resultArr: {
        value: string;
        count: number;
    }[] = [];
    for (const mood in map) {
        resultArr.push({
            value: mood,
            count: map[mood].length
        });
    }
    return resultArr.sort((a, b) => b.count - a.count).filter(mood => +mood.value);
};

export const openLink = (url: string) => openExternalLink(url);
