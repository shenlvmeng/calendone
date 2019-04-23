import moment from "moment";

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
    const deadline = moment(ts);
    const days = moment().diff(deadline, "days");
    const humanizeStr = dayDiffStrs[days];
    if (humanizeStr) {
        return humanizeStr;
    }
    return deadline.format("YYYY-MM-DD");
};
