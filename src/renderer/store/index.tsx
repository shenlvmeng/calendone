import React, { useState } from "react";
import produce from "immer";

import { userNameStorageKey, userAvatarStorageKey } from "@/utils/constants";

interface IUser {
    avatar: string;
    name: string;
}

interface IStore {
    userInfo: IUser;
}

interface IReducer {
    [key: string]: Function;
}

type IState = IStore | IReducer;

const StoreContext = React.createContext<IState>({});

const Provider: React.FunctionComponent<{}> = props => {
    const [store, setStore] = useState<IState>({
        setUser,
        userInfo: {
            avatar: localStorage.getItem(userAvatarStorageKey) || "",
            name: localStorage.getItem(userNameStorageKey) || "Bebop Ed"
        }
    });

    function setUser(user: Partial<IUser>) {
        setStore(
            produce((draft: IState) => {
                draft.userInfo = {
                    ...draft.userInfo,
                    ...user
                };
            })(store)
        );
        if (user.name) {
            localStorage.setItem(userNameStorageKey, user.name);
        }
        if (user.avatar) {
            localStorage.setItem(userAvatarStorageKey, user.avatar);
        }
    }

    return <StoreContext.Provider value={store}>{props.children}</StoreContext.Provider>;
};

export default Provider;
export { StoreContext };
