import React, { Component } from "react";

import { getTrackEvents, addTrackEvent, updateTrackEventStatus } from "@/services/calendone";
import RadioGroup from "@/components/radio";
import Select, { Option } from "@/components/select";
import Button from "@/components/button";

interface IProps {
    step?: number;
    content?: string;
    isTracking?: boolean;
    trackTitle?: string;
    trackId?: string;
    trackContent?: string;
    currDate: number;
    onCancel: () => void;
    onFinish: (event: {
        content?: string;
        isTracking: boolean;
        trackId?: string;
        trackTitle?: string;
        trackStage?: number;
    }) => void;
}

interface IState {
    step: number;
    content: string;
    trackContent: string;
    isTracking: boolean;
    trackId: string;
    trackTitle: string;
    fromExist: boolean;
    trackStage: number;
    existTrackEvents: {
        id: string;
        name: string;
    }[];
}

class NewEvent extends Component<IProps, IState> {
    public readonly state: IState = {
        step: this.props.step || 0,
        content: (this.props.step && this.props.content) || "",
        trackContent: (this.props.step && this.props.trackContent) || "",
        isTracking: (this.props.step && this.props.isTracking) || false,
        trackId: (this.props.step && this.props.trackId) || "",
        trackTitle: (this.props.step && this.props.trackTitle) || "",
        trackStage: 1,
        fromExist: true,
        existTrackEvents: []
    };

    public inputRef1 = React.createRef<HTMLInputElement>();
    public inputRef2 = React.createRef<HTMLInputElement>();

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
                        ref={this.inputRef1}
                        type="text"
                        placeholder="输入20字以内的简介"
                        maxLength={20}
                        value={content}
                        onKeyUp={this.handlePressEnter}
                        onChange={this.handleContentChange}
                    />
                    <div className="shift-btns">
                        <Button onClick={this.handlePrev}>上一步</Button>
                        <Button type="info" onClick={this.handleNew} disabled={!content}>
                            {this.props.step ? "确 认" : "添 加"}
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
        const { step, fromExist, existTrackEvents, content, trackId, trackContent } = this.state;
        if (fromExist) {
            return (
                <div className="new-event-step" style={{ width: `${100 / (step + 1)}%` }}>
                    <h3>发生了什么？</h3>
                    <Select
                        defaultValue={trackId}
                        useLabel={true}
                        onChange={this.handleTrackIdChange}
                        style={{ maxWidth: 320 }}
                    >
                        {existTrackEvents.map((event, index) => (
                            <Option value={event.id} key={index}>
                                {event.name}
                            </Option>
                        ))}
                    </Select>
                    <input
                        ref={this.inputRef2}
                        type="text"
                        placeholder="今天有什么进展?"
                        maxLength={20}
                        value={trackContent}
                        onKeyUp={this.handlePressEnter}
                        onChange={this.handleTrackContentChange}
                    />
                    <div className="shift-btns">
                        <Button onClick={this.handlePrev}>上一步</Button>
                        <Button type="info" onClick={this.handleNext} disabled={!trackId}>
                            下一步
                        </Button>
                    </div>
                </div>
            );
        }
        return (
            <div className="new-event-step" style={{ width: `${100 / (step + 1)}%` }}>
                <h3>发生了什么？</h3>
                <input
                    ref={this.inputRef2}
                    type="text"
                    placeholder="输入20字以内的简介"
                    maxLength={20}
                    onKeyUp={this.handlePressEnter}
                    onChange={this.handleContentChange}
                />
                <div className="shift-btns">
                    <Button onClick={this.handlePrev}>上一步</Button>
                    <Button type="info" onClick={this.handleNew} disabled={!content}>
                        {this.props.step ? "确 认" : "添 加"}
                    </Button>
                </div>
            </div>
        );
    }

    public renderStep3() {
        const { step } = this.state;
        return (
            <div className="new-event-step" style={{ width: `${100 / (step + 1)}%` }}>
                <h3>继续追踪？</h3>
                <RadioGroup
                    options={[
                        { key: "yes", label: "继续" },
                        { key: "finish", label: "完成" },
                        { key: "abandon", label: "终止" }
                    ]}
                    onChange={this.handleTrackStageChange}
                />
                <div className="shift-btns">
                    <Button onClick={this.handlePrev}>上一步</Button>
                    <Button type="info" onClick={this.handleAddTrack}>
                        完 成
                    </Button>
                </div>
            </div>
        );
    }

    public render() {
        const { step } = this.state;
        return (
            <div className="new-event-container">
                <div className="iconfont close-btn" onClick={this.handleCloseSelf} />
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
                    {step > 2 ? this.renderStep3() : null}
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

    private handleTrackIdChange = (track: { value: string; label: string }) => {
        this.setState({
            trackId: track.value,
            trackTitle: track.label
        });
    };

    private handleTrackStageChange = (stage: string) => {
        this.setState({
            trackStage: stage === "finish" ? 2 : stage === "abandon" ? 3 : 1
        });
    };

    private handleCloseSelf = () => {
        this.props.onCancel();
    };

    private handlePrev = () => {
        this.setState(prevState => ({
            step: prevState.step - 1
        }));
    };

    private handleNext = () => {
        this.setState(
            prevState => ({
                step: prevState.step + 1
            }),
            () => {
                if (this.state.step === 1) {
                    this.inputRef1.current && this.inputRef1.current.focus();
                } else if (this.state.step === 2) {
                    this.inputRef2.current && this.inputRef2.current.focus();
                }
            }
        );
    };

    private handlePressEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const key = e.key;
        if (key === "Enter") {
            const { step } = this.state;
            if (step < 2) {
                this.handleNew();
            } else if (step > 2) {
                this.handleAddTrack();
            } else {
                this.state.fromExist ? this.handleNext() : this.handleNew();
            }
        }
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
                trackId: `${id}`,
                trackTitle: content
            });
        } else {
            this.props.onFinish({
                content,
                isTracking: false
            });
        }
    };

    private handleAddTrack = async () => {
        const { trackId, trackContent, trackTitle, trackStage } = this.state;
        if (trackId) {
            if (trackStage !== 1) {
                await updateTrackEventStatus(+trackId, trackStage, this.props.currDate);
            }
            this.props.onFinish({
                trackId,
                trackTitle,
                trackStage,
                isTracking: true,
                content: trackContent
            });
        }
    };
}

export default NewEvent;
