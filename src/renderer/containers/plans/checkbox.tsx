import React, { useState, useEffect } from "react";
import classNames from "classnames";

import { isUndefined } from "@/utils";

interface IProps {
    defaultValue?: boolean;
    value?: boolean;
    onChange?: (checked: boolean) => void;
}

const Checkbox: React.FunctionComponent<IProps> = (props: IProps) => {
    const [checked, setChecked] = useState<boolean>(false);

    function handleSetChecked() {
        props.onChange && props.onChange(!checked);
        setChecked(!checked);
    }

    useEffect(() => {
        if (!isUndefined(props.value)) {
            setChecked(props.value as boolean);
        }
    }, [props.value]);

    return (
        <div
            className={classNames("plan-checkbox iconfont", {
                active: checked
            })}
            onClick={handleSetChecked}
        />
    );
};

export default Checkbox;
