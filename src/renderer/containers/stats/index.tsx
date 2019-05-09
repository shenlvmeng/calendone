import React, { useState } from "react";
import Tabs, { TabPane } from "rc-tabs";
import TabContent from "rc-tabs/lib/SwipeableTabContent";
import ScrollableInkTabBar from "rc-tabs/lib/ScrollableInkTabBar";

import MonthStat from "./month";
import YearStat from "./year";
import "rc-tabs/assets/index.css";
import "./index.less";

type TabKey = "month" | "year" | "total";

const Stats: React.FunctionComponent<{}> = props => {
    const [key, setKey] = useState<TabKey>("month");

    function handleChange(key: TabKey) {
        setKey(key);
    }
    return (
        <div className="stats-container">
            <h1>Statistics / 统计</h1>
            <div className="stats-content">
                <Tabs
                    // tslint:disable jsx-no-lambda
                    renderTabBar={() => <ScrollableInkTabBar />}
                    renderTabContent={() => <TabContent animatedWithMargin={true} />}
                    activeKey={key}
                    onChange={handleChange}
                >
                    <TabPane tab="本月" key="month">
                        <MonthStat />
                    </TabPane>
                    <TabPane tab="本年" key="year">
                        <YearStat />
                    </TabPane>
                    <TabPane tab="总数" key="total">
                        content3
                    </TabPane>
                </Tabs>
            </div>
        </div>
    );
};

export default Stats;
