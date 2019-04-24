import React, { useState, useEffect } from "react";
import { RouteComponentProps } from "react-router";

import { countPlans } from "@/services/plans";
import Unread from "@/components/unread";

const Header: React.FunctionComponent<RouteComponentProps<{}>> = props => {
    function jump() {
        props.history.push("/plans");
        setCount(0);
    }

    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        !(async () => {
            const unreadCount = await countPlans(true);
            setCount(unreadCount);
        })();
    }, []);

    return (
        <header>
            <div className="drag-bar" />
            <div className="notification" onClick={jump}>
                {count ? <Unread count={count} /> : null}
            </div>
            <div className="user-info">
                <span className="capital">{"Shenlvmeng".toUpperCase().slice(0, 1)}</span>
                Shenlvmeng
            </div>
        </header>
    );
};

export default Header;
