import React, { useState, useEffect, useContext } from "react";
import { RouteComponentProps } from "react-router";

import { StoreContext } from "@/store";
import { countPlans } from "@/services/plans";
import Unread from "@/components/unread";

const Header: React.FunctionComponent<RouteComponentProps<{}>> = props => {
    function toPlan() {
        props.history.push("/plans");
        setCount(0);
    }
    function toUser() {
        props.history.push("/user");
    }

    const [count, setCount] = useState<number>(0);
    const { userInfo } = useContext(StoreContext);

    useEffect(() => {
        !(async () => {
            const unreadCount = await countPlans(true);
            setCount(unreadCount);
        })();
    }, []);

    return (
        <header>
            <div className="drag-bar" />
            <div className="notification" onClick={toPlan}>
                {count ? <Unread count={count} /> : null}
            </div>
            <div className="user-info" onClick={toUser}>
                {userInfo.avatar ? (
                    <img src={userInfo.avatar} />
                ) : (
                    <span className="capital">{userInfo.name.toUpperCase().slice(0, 1)}</span>
                )}
                {userInfo.name}
            </div>
        </header>
    );
};

export default Header;
