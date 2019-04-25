import React, { Component } from "react";
import { RouteComponentProps } from "react-router";
import classNames from "classnames";
import moment from "moment";
import produce from "immer";
import find from "lodash/find";
import findIndex from "lodash/findIndex";
import Dialog from "rc-dialog";
import "rc-dialog/assets/index.css";

import { IPlan } from "@/services/db";
import { getPlans, addPlan, updatePlan, updatePlans } from "@/services/plans";
import { fromNow } from "@/utils";
import Tag from "@/components/tag";
import Checkbox from "./checkbox";
import Detail from "./detail";
import "./index.less";

interface IState {
    showFinished: boolean;
    newContent: string;
    plans: IPlan[];
    currViewPlan: IPlan | null;
}

/**
 * plans part
 */
class Plans extends Component<RouteComponentProps<{}>, IState> {
    public readonly state: IState = {
        showFinished: false,
        newContent: "",
        plans: [],
        currViewPlan: null
    };

    public async componentDidMount() {
        this.setState({
            plans: await getPlans()
        });
    }

    public async addPlan(content: string) {
        const id = await addPlan(content);
        this.setState(
            produce((draft: IState) => {
                draft.newContent = "";
                draft.plans.push({
                    id,
                    content,
                    priority: 1,
                    deadline: 0,
                    start_time: Date.now(),
                    update_time: Date.now(),
                    stage: 1
                });
            })
        );
    }

    public async updatePlanContent(id: number, index: number, content: string) {
        await updatePlan(id, {
            content
        });
        this.setState(
            produce((draft: IState) => {
                draft.plans[index].content = content;
            })
        );
    }

    public renderPlanEntry(plan: IPlan, today?: boolean) {
        return (
            <div className="plans-entry" key={plan.id}>
                <Checkbox
                    value={plan.stage === 2 ? true : false}
                    // tslint:disable-next-line
                    onChange={checked => this.handleChangePlanStage(plan.id as number, checked)}
                />
                <div className={classNames("plans-content", { multiline: !today && plan.deadline })}>
                    {today ? (
                        <span className="plans-text">{plan.content}</span>
                    ) : (
                        <input
                            className={plan.stage === 2 ? "finished" : ""}
                            maxLength={30}
                            defaultValue={plan.content}
                            data-id={plan.id}
                            onKeyUp={this.handleEnterChange}
                            onBlur={this.handleBlurChange}
                        />
                    )}
                    {!today && plan.stage !== 2 && plan.deadline ? (
                        <p
                            className={classNames("plans-deadline", {
                                alert: moment(plan.deadline).isSameOrBefore(Date.now(), "day")
                            })}
                        >
                            {fromNow(plan.deadline)}
                        </p>
                    ) : null}
                </div>
                {plan.priority > 1 ? (
                    <Tag type={plan.priority === 2 ? "warn" : "danger"}>{plan.priority === 2 ? "重要" : "紧急"}</Tag>
                ) : null}
                <span className="info-btn iconfont" data-id={plan.id} onClick={this.handleViewPlanDetail} />
                <span className="close-btn iconfont" data-id={plan.id} onClick={this.handleDeletePlan} />
            </div>
        );
    }

    public render() {
        const { newContent, plans, showFinished, currViewPlan } = this.state;
        const ongoing = plans.filter(plan => plan.stage === 1);
        const inactive = plans.filter(plan => plan.stage === 2);
        const today = ongoing
            .filter(plan => plan.deadline && moment(plan.deadline).isSameOrBefore(Date.now(), "day"))
            .sort((a, b) => b.priority - a.priority);
        return (
            <div className="plans-container">
                <h1>Plans / 规划</h1>
                <div className="plans-main">
                    <section className="ongoing-plans">
                        <aside>
                            待办事项
                            <span className={classNames("total-count", { empty: !ongoing.length })}>
                                {ongoing.length}
                            </span>
                        </aside>
                        <div className="plans-entry new-plan">
                            <Checkbox onChange={this.handleCheckedChange} />
                            <input
                                value={newContent}
                                maxLength={30}
                                placeholder="下一步要做什么？"
                                onKeyUp={this.handleEnterAdd}
                                onChange={this.handleChangeNewContent}
                            />
                        </div>
                        <div className="plans-entries">
                            {ongoing.map(plan => this.renderPlanEntry(plan))}
                            {showFinished ? inactive.map(plan => this.renderPlanEntry(plan)) : null}
                        </div>
                        {inactive.length ? (
                            <div className="show-finished-switch" onClick={this.handleSwitchShowFinished}>
                                {showFinished ? "隐藏已完成的事项" : "显示已完成的事项"}
                            </div>
                        ) : null}
                    </section>
                    <section className="finished-plans">
                        <aside>
                            今日待办
                            <span className={classNames("total-count", { empty: !today.length })}>{today.length}</span>
                        </aside>
                        <div className="plans-entries">
                            {today.length ? (
                                today.map(plan => this.renderPlanEntry(plan, true))
                            ) : (
                                <div className="plans-entry">
                                    <span className="empty-hint">下一步要做什么？</span>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
                <Dialog
                    wrapClassName="common-dialog-wrap"
                    className="common-dialog plan-detail"
                    visible={!!currViewPlan}
                    animation="zoom"
                    maskAnimation="fade"
                    closable={false}
                    onClose={this.handleClosePlanDetail}
                    destroyOnClose={true}
                >
                    {currViewPlan ? (
                        <React.Fragment>
                            <h2>详细信息</h2>
                            <div className="close-btn iconfont" onClick={this.handleClosePlanDetail} />
                            <Detail detail={currViewPlan} onConfirm={this.handleUpdatePlanDetail} />
                        </React.Fragment>
                    ) : null}
                </Dialog>
            </div>
        );
    }

    private handleCheckedChange = async (checked: boolean) => {
        const changedPlans = this.state.plans.filter(plan => plan.stage === (checked ? 1 : 2));
        if (!changedPlans.length) {
            return;
        }
        await updatePlans(
            changedPlans.map(plan => ({
                ...plan,
                stage: checked ? 2 : 1
            }))
        );
        this.setState(
            produce((draft: IState) => {
                draft.plans.forEach(plan => (plan.stage = checked ? 2 : 1));
            })
        );
    };

    private handleChangePlanStage = async (id: number, checked: boolean) => {
        const index = findIndex(this.state.plans, plan => plan.id === id);
        if (id && index !== -1) {
            await updatePlan(id, { stage: checked ? 2 : 1 });
            this.setState(
                produce((draft: IState) => {
                    draft.plans[index].stage = checked ? 2 : 1;
                })
            );
        }
    };

    private handleChangeNewContent = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newContent: e.currentTarget.value
        });
    };

    private handleEnterChange = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const id = e.currentTarget.dataset && e.currentTarget.dataset.id;
        const index = findIndex(this.state.plans, plan => !!id && plan.id === +id);
        const content = e.currentTarget.value.trim();
        const key = e.key;
        if (key === "Enter" && id && index !== -1 && content) {
            this.updatePlanContent(+id, index, content);
        }
    };

    private handleBlurChange = (e: React.FocusEvent<HTMLInputElement>) => {
        const id = e.currentTarget.dataset && e.currentTarget.dataset.id;
        const index = findIndex(this.state.plans, plan => !!id && plan.id === +id);
        const content = e.currentTarget.value.trim();
        if (id && index !== -1 && content) {
            this.updatePlanContent(+id, index, content);
        }
    };

    private handleDeletePlan = async (e: React.MouseEvent<HTMLSpanElement>) => {
        const id = e.currentTarget.dataset && e.currentTarget.dataset.id;
        const index = findIndex(this.state.plans, plan => !!id && plan.id === +id);
        if (id && index !== -1) {
            await updatePlan(+id, { stage: 3 });
            this.setState(
                produce((draft: IState) => {
                    draft.plans.splice(index, 1);
                })
            );
        }
    };

    private handleEnterAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const { newContent } = this.state;
        const key = e.key;
        if (key === "Enter" && newContent.trim()) {
            e.currentTarget.blur();
            this.addPlan(newContent.trim());
        }
    };

    private handleSwitchShowFinished = () => {
        this.setState(
            produce((draft: IState) => {
                draft.showFinished = !draft.showFinished;
            })
        );
    };

    private handleViewPlanDetail = (e: React.MouseEvent<HTMLDivElement>) => {
        const id = e.currentTarget.dataset && e.currentTarget.dataset.id;
        const planDetail = find(this.state.plans, plan => !!id && plan.id === +id);
        if (planDetail) {
            this.setState({ currViewPlan: planDetail });
        }
    };

    private handleClosePlanDetail = () => {
        this.setState({ currViewPlan: null });
    };

    private handleUpdatePlanDetail = async (detail: Partial<IPlan>) => {
        const { currViewPlan, plans } = this.state;
        if (!currViewPlan || !currViewPlan.id) {
            return;
        }
        await updatePlan(currViewPlan.id, {
            ...detail
        });
        const index = findIndex(plans, plan => plan.id === (currViewPlan.id as number));
        this.setState(
            produce((draft: IState) => {
                draft.plans[index] = {
                    ...draft.plans[index],
                    ...detail
                };
                draft.currViewPlan = null;
            })
        );
    };
}

export default Plans;
