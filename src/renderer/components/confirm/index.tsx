import React from "react";
import ReactDOM from "react-dom";

import Button from "../button";
import "./index.less";

interface IProps {
    alert?: boolean;
    title: string;
    message?: string;
    closable?: boolean;
    okText?: string;
    cancelText?: string;
    onConfirm?: () => any;
    onCancel?: () => void;
}

function removePopupConfirm() {
    const target = document.getElementById("popup-confirm-component");
    if (target) {
        ReactDOM.unmountComponentAtNode(target);
        document.body.removeChild(target);
    }
}

export const PopupConfirm: React.FunctionComponent<IProps> = props => {
    const { alert, title, message, okText, cancelText, onConfirm, onCancel, closable } = props;
    const handleCancel = () => {
        removePopupConfirm();
        if (onCancel) {
            onCancel();
        }
    };
    const handleConfirm = () => {
        removePopupConfirm();
        onConfirm && onConfirm();
    };

    return (
        <div className="popup-overlay">
            <div className="popup-box">
                {closable ? <div className="close-btn" onClick={removePopupConfirm} /> : null}
                <h2>{title}</h2>
                {message ? <div className="popup-msg">{message}</div> : null}
                <div className="popup-btn">
                    <Button type="primary" onClick={handleConfirm}>
                        {okText}
                    </Button>
                    {alert ? null : <Button onClick={handleCancel}>{cancelText}</Button>}
                </div>
            </div>
        </div>
    );
};

PopupConfirm.defaultProps = {
    alert: false,
    closable: false,
    okText: "确认",
    cancelText: "取消",
    onConfirm: () => {}
};

export default function createPopupConfirm(options: IProps) {
    const el = document.createElement("div");
    el.id = "popup-confirm-component";
    document.body.appendChild(el);
    ReactDOM.render(<PopupConfirm {...options} />, el);
}
