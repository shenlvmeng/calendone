import React from "react";
import Notification from "rc-notification";

import "./index.less";

interface IParams {
    content: React.ReactNode;
    onClose?: () => any;
    duration?: number;
    maxCount?: number;
}

interface INotification {
    notice: (params: IParams) => any;
}

let notification: INotification | null = null;

const toast = (params: IParams) => {
    if (!notification) {
        Notification.newInstance(
            {
                style: { top: 88, left: "50%" }
            },
            (n: INotification) => {
                notification = n;
                notification.notice(params);
            }
        );
    } else {
        notification.notice(params);
    }
};

export default toast;
