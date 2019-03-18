import React, { Component } from "react";

import { IDay } from "@/utils/db";
import { IDate } from "./index";

interface IProps {
    info: IDay | IDate | null;
}

interface IState {}

class Day extends Component<IProps, IState> {
    public render() {
        return <div className="day-detail">detail</div>;
    }
}

export default Day;
