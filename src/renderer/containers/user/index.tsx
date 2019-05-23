import React, { useState, useContext, useRef, useCallback } from "react";
import classNames from "classnames";

import { StoreContext } from "@/store";
import "./index.less";

const User: React.FunctionComponent<{}> = props => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { userInfo, setUser } = useContext(StoreContext) as any;
    const initName = useRef<string>(userInfo.name || "Bebop Ed");
    const [name, setName] = useState<string>(userInfo.name);

    const nameSubmit = useCallback(() => {
        if (name.trim()) {
            setUser({ name: name.trim() });
            initName.current = name.trim();
        } else {
            setName(initName.current);
        }
    }, [name, initName]);
    const nameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setName(e.currentTarget.value);
        },
        [setName]
    );
    const pressEnter = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.currentTarget.blur();
                nameSubmit();
            }
        },
        [nameSubmit]
    );
    const fileUpload = useCallback(() => {
        inputRef.current && inputRef.current.click();
    }, [inputRef]);
    const fileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.currentTarget.files;
            if (files) {
                const reader = new FileReader();
                reader.onload = (event: any) => {
                    setUser({ avatar: event.target.result });
                };
                reader.readAsDataURL(files[0]);
                e.currentTarget.value = "";
            }
        },
        [setUser]
    );

    return (
        <div className="user-center-wrap">
            <div className="user-center">
                <div className="avatar-wrap">
                    {userInfo.avatar ? (
                        <img src={userInfo.avatar} />
                    ) : (
                        <div className="capital-letter">{name.slice(0, 1).toUpperCase()}</div>
                    )}
                    <aside onClick={fileUpload}>
                        上传
                        <input type="file" accept="image/*" ref={inputRef} onChange={fileChange} />
                    </aside>
                </div>
                <input
                    value={name}
                    placeholder="e.g. Bebop Ed"
                    maxLength={20}
                    className={classNames("user-name", {
                        error: !name.trim()
                    })}
                    onChange={nameChange}
                    onBlur={nameSubmit}
                    onKeyUp={pressEnter}
                />
            </div>
        </div>
    );
};

export default User;
