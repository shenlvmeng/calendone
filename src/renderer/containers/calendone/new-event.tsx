import React, { Component } from "react";

import { getTrackEvents, addTrackEvent } from "@/services/calendone";
import RadioGroup from "@/components/radio";
import Select, { Option } from "@/components/select";
import Button from "@/components/button";

interface IProps {
    onFinish: (
        event: {
            content?: string;
            isTracking: boolean;
            trackId?: string;
        }
    ) => void;
}

interface IState {
    step: number;
    content: string;
    trackContent: string;
    isTracking: boolean;
    trackId: string;
    fromExist: boolean;
    existTrackEvents: {
        id: string;
        name: string;
    }[];
}

class NewEvent extends Component<IProps, IState> {
    public readonly state: IState = {
        step: 0,
        content: "",
        trackContent: "",
        isTracking: false,
        trackId: "",
        fromExist: true,
        existTrackEvents: []
    };

    public async componentDidMount() {
        const trackEvents = await getTrackEvents(true);
        this.setState({
            existTrackEvents: trackEvents.map(event => ({
                id: `${event.id}`,
                name: event.name
            }))
        });
    }

    public renderStep0() {
        return (
            <div className="new-event-step" style={{ width: `${100 / (this.state.step + 1)}%` }}>
                <h3>哪种类型？</h3>
                <RadioGroup
                    options={[{ key: "normal", label: "日常" }, { key: "track", label: "追踪事件" }]}
                    onChange={this.handleEventTypeChange}
                />
                <div className="shift-btns">
                    <Button type="info" onClick={this.handleNext}>
                        下一步
                    </Button>
                </div>
            </div>
        );
    }

    public renderStep1() {
        const { isTracking, step, content } = this.state;
        if (!isTracking) {
            return (
                <div className="new-event-step" style={{ width: `${100 / (step + 1)}%` }}>
                    <h3>发生了什么？</h3>
                    <input
                        type="text"
                        placeholder="输入20字以内的简介"
                        maxLength={20}
                        onChange={this.handleContentChange}
                    />
                    <div className="shift-btns">
                        <Button onClick={this.handlePrev}>上一步</Button>
                        <Button type="info" onClick={this.handleNew} disabled={!content}>
                            添 加
                        </Button>
                    </div>
                </div>
            );
        }
        return (
            <div className="new-event-step" style={{ width: `${100 / (this.state.step + 1)}%` }}>
                <h3>正在追踪？</h3>
                <RadioGroup
                    options={[{ key: "yes", label: "是" }, { key: "no", label: "否" }]}
                    onChange={this.handleTrackTypeChange}
                />
                <div className="shift-btns">
                    <Button onClick={this.handlePrev}>上一步</Button>
                    <Button type="info" onClick={this.handleNext}>
                        下一步
                    </Button>
                </div>
            </div>
        );
    }

    public renderStep2() {
        const { step, fromExist, existTrackEvents, content, trackId } = this.state;
        if (fromExist) {
            return (
                <div className="new-event-step" style={{ width: `${100 / (step + 1)}%` }}>
                    <h3>发生了什么？</h3>
                    <Select onChange={this.handleTrackId} style={{ maxWidth: 320 }}>
                        {existTrackEvents.map((event, index) => (
                            <Option value={event.id} key={index}>
                                {event.name}
                            </Option>
                        ))}
                    </Select>
                    <input
                        type="text"
                        placeholder="今天有什么进展?"
                        maxLength={20}
                        onChange={this.handleTrackContentChange}
                    />
                    <div className="shift-btns">
                        <Button onClick={this.handlePrev}>上一步</Button>
                        <Button type="info" onClick={this.handleConfirm} disabled={!trackId}>
                            添 加
                        </Button>
                    </div>
                </div>
            );
        }
        return (
            <div className="new-event-step" style={{ width: `${100 / (step + 1)}%` }}>
                <h3>发生了什么？</h3>
                <input
                    type="text"
                    placeholder="输入20字以内的简介"
                    maxLength={20}
                    onChange={this.handleContentChange}
                />
                <div className="shift-btns">
                    <Button onClick={this.handlePrev}>上一步</Button>
                    <Button type="info" onClick={this.handleNew} disabled={!content}>
                        添 加
                    </Button>
                </div>
            </div>
        );
    }

    public render() {
        const { step } = this.state;
        return (
            <div className="new-event-container">
                <div
                    className="new-event-steps"
                    style={{
                        width: `${(step + 1) * 100}%`,
                        left: `-${step * 100}%`
                    }}
                >
                    {this.renderStep0()}
                    {step > 0 ? this.renderStep1() : null}
                    {step > 1 ? this.renderStep2() : null}
                </div>
            </div>
        );
    }

    private handleEventTypeChange = (type: string) => {
        this.setState({ isTracking: type === "track" });
    };

    private handleTrackTypeChange = (type: string) => {
        this.setState({ fromExist: type === "yes" });
    };

    private handleContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            content: e.currentTarget.value.trim()
        });
    };

    private handleTrackContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            trackContent: e.currentTarget.value.trim()
        });
    };

    private handleTrackId = (value: string) => {
        this.setState({ trackId: value });
    };

    private handlePrev = () => {
        this.setState(prevState => ({
            step: prevState.step - 1
        }));
    };

    private handleNext = () => {
        this.setState(prevState => ({
            step: prevState.step + 1
        }));
    };

    private handleNew = async () => {
        const { content, isTracking } = this.state;
        if (!content) {
            return;
        }
        if (isTracking) {
            const id = await addTrackEvent(content);
            this.props.onFinish({
                isTracking: true,
                trackId: `${id}`
            });
        } else {
            this.props.onFinish({
                content,
                isTracking: false
            });
        }
    };

    private handleConfirm = () => {
        const { trackId, trackContent } = this.state;
        if (trackId) {
            this.props.onFinish({
                trackId,
                isTracking: true,
                content: trackContent
            });
        }
    };
}

export default NewEvent;
