import React, { Component } from "react";
import Calendar from "rc-calendar";
import DatePicker from "rc-calendar/lib/Picker";
import zhCN from "rc-calendar/lib/locale/zh_CN";
import moment from "moment";

import { IPlan } from "@/services/db";
import Select, { Option } from "@/components/select";
import Button from "@/components/button";

import "rc-calendar/assets/index.css";

interface IPlanDetail {
    name: string;
    priority: number;
    deadline: number;
}

interface IProps {
    detail: IPlan;
    onCancel?: () => void;
    onConfirm: (detail: IPlanDetail) => void;
}

interface IState extends IPlanDetail {}

class PlanDetail extends Component<IProps, IState> {
    public readonly state: IState = {
        name: this.props.detail.content,
        priority: this.props.detail.priority,
        deadline: this.props.detail.deadline || 0
    };

    public render() {
        const { detail } = this.props;
        const { name, priority, deadline } = this.state;
        const disabled = !name || !priority;
        const calendar = (
            <Calendar
                className="plan-detail-calendar"
                locale={zhCN}
                dateInputPlaceholder="到期日"
                defaultValue={deadline ? moment(deadline) : moment()}
            />
        );
        return (
            <div className="plan-detail-content">
                <div className="plan-detail-item">
                    <div>
                        <label htmlFor="plan-name">名称</label>
                    </div>
                    <input
                        id="plan-name"
                        placeholder="事件名"
                        maxLength={30}
                        defaultValue={detail.content}
                        onChange={this.handleNameChange}
                    />
                </div>
                <div className="plan-detail-item two-label">
                    <div>
                        <label>优先级</label>
                        <label>到期日(可选)</label>
                    </div>
                    <div>
                        <Select defaultValue={`${detail.priority}`} onChange={this.handlePriorityChange}>
                            <Option value="1">待办</Option>
                            <Option value="2">重要</Option>
                            <Option value="3">紧急</Option>
                        </Select>
                        <DatePicker
                            calendar={calendar}
                            animation="slide-up"
                            defaultValue={deadline ? moment(deadline) : moment()}
                            onChange={this.handleDeadlineChange}
                        >
                            {(args: any) => (
                                <input
                                    readOnly={true}
                                    placeholder="到期日"
                                    tabIndex={-1}
                                    value={(deadline && moment(deadline).format("YYYY-MM-DD")) || ""}
                                />
                            )}
                        </DatePicker>
                    </div>
                </div>
                <div className="plan-detail-hint">你可以在「今日待办」中看到所有逾期事项</div>
                <div className="plan-detail-operate">
                    <Button type={disabled ? undefined : "neon"} disabled={disabled} onClick={this.handleConfirmChange}>
                        完成
                    </Button>
                </div>
            </div>
        );
    }

    private handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ name: e.currentTarget.value });
    };

    private handlePriorityChange = (value: string) => {
        this.setState({ priority: +value });
    };

    private handleDeadlineChange = (value: any) => {
        this.setState({ deadline: +value });
    };

    private handleConfirmChange = () => {
        const { name, priority, deadline } = this.state;
        if (!name || !priority) {
            return;
        }
        this.props.onConfirm({
            name,
            priority,
            deadline
        });
    };
}

export default PlanDetail;
