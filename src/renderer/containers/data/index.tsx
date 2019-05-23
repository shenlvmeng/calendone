import React, { Component } from "react";
import moment from "moment";

import { saveToDesktop } from "@/../main/utils";
import { importFrom, exportTo, getLastLog } from "@/services/data";
import { OpType } from "@/services/db";
import Icon from "@/components/icon";
import toast from "@/components/toast";
import confirm from "@/components/confirm";
import "./index.less";

interface IState {
    processing: boolean;
    processMessage: string;
    lastImportTime: string;
    lastExportTime: string;
}

class Data extends Component<{}, IState> {
    public readonly state: IState = {
        processing: false,
        processMessage: "",
        lastImportTime: "-",
        lastExportTime: "-"
    };
    public inputRef = React.createRef<HTMLInputElement>();

    public componentDidMount() {
        this.fetchLastImport();
        this.fetchLastExport();
    }

    public async fetchLastImport() {
        const res = await getLastLog(OpType.Import);
        if (res && res.create_time > 0) {
            this.setState({
                lastImportTime: moment(res.create_time).format("YYYY-MM-DD HH:mm:ss")
            });
        }
    }

    public async fetchLastExport() {
        const res = await getLastLog(OpType.Export);
        if (res && res.create_time > 0) {
            this.setState({
                lastExportTime: moment(res.create_time).format("YYYY-MM-DD HH:mm:ss")
            });
        }
    }

    public async handleImport(data: string) {
        try {
            const parsedData = JSON.parse(data);
            this.setState({ processMessage: "完成数据解析" });
            await importFrom(parsedData, (message: string) => {
                this.setState({ processMessage: message });
            });
            toast({ content: "恢复成功" });
            this.setState({
                processMessage: "保存操作记录",
                lastImportTime: "刚刚"
            });
        } catch (err) {
            toast({ content: "恢复失败，请稍后再试" });
        } finally {
            this.setState({ processing: false });
        }
    }

    public render() {
        const { processing, processMessage, lastExportTime, lastImportTime } = this.state;
        return (
            <div className="db-operation">
                <section className="db-operation-item">
                    <div className="db-operation-btn">
                        <button onClick={this.handleExport}>
                            <Icon type="export" />
                            备份
                            <div className="hint">导出为备份文件</div>
                        </button>
                        {lastExportTime !== "-" ? (
                            <p className="db-operation-extra">上次备份时间: {lastExportTime}</p>
                        ) : null}
                    </div>
                </section>
                <div className="db-operation-divider" />
                <section className="db-operation-item">
                    <input type="file" accept="application/json" ref={this.inputRef} onChange={this.handleFileChange} />
                    <div className="db-operation-btn">
                        <button onClick={this.handleImportStart}>
                            <Icon type="import" />
                            恢复
                            <div className="hint">从已有备份中恢复</div>
                        </button>
                        {lastImportTime !== "-" ? (
                            <p className="db-operation-extra">上次恢复时间: {lastImportTime}</p>
                        ) : null}
                    </div>
                </section>
                {processing ? (
                    <aside className="loading-modal-wrap">
                        <div className="loading-mask" />
                        <div className="loading-message">
                            <Icon type="loading" />
                            <p>{processMessage}</p>
                        </div>
                    </aside>
                ) : null}
            </div>
        );
    }

    private handleImportStart = () => {
        confirm({
            title: "恢复",
            message: "应用的当前数据将被覆盖，是否继续",
            closable: true,
            onConfirm: () => this.handleFileUpload()
        });
    };

    private handleFileUpload = () => {
        this.inputRef.current && this.inputRef.current.click();
    };

    private handleExport = async () => {
        const { processing } = this.state;
        if (processing) {
            return;
        }
        this.setState({
            processing: true,
            processMessage: "准备开始..."
        });
        try {
            const res = await exportTo((message: string) => {
                this.setState({ processMessage: message });
            });
            this.setState({ processMessage: "备份中..." });
            saveToDesktop(
                JSON.stringify(res),
                () => {
                    this.setState({
                        processMessage: "保存操作记录",
                        lastExportTime: "刚刚"
                    });
                    toast({ content: "备份成功，请在桌面查看生成文件" });
                },
                () => {
                    toast({ content: "备份失败，请稍后再试" });
                }
            );
        } catch (err) {
            toast({ content: "备份失败，请稍后再试" });
        } finally {
            this.setState({ processing: false });
        }
    };

    private handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { processing } = this.state;
        if (processing) {
            return;
        }
        this.setState({
            processing: true,
            processMessage: "读取文件..."
        });
        const files = e.currentTarget.files;
        if (files) {
            const reader = new FileReader();
            reader.onload = (event: any) => {
                this.handleImport(event.target.result);
            };
            reader.readAsText(files[0]);
            e.currentTarget.value = "";
        }
    };
}

export default Data;
