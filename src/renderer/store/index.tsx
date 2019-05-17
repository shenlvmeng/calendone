import React, { useState } from "react";
import produce from "immer";

import { userNameStorageKey, userAvatarStorageKey } from "@/utils/constants";
import { noop } from "@/utils";

interface IUser {
    avatar: string;
    name: string;
}

interface IStore {
    userInfo: IUser;
    setUser: Function;
}

const StoreContext = React.createContext<IStore>({
    userInfo: {
        avatar: "",
        name: ""
    },
    setUser: noop
});

const Provider: React.FunctionComponent<{}> = props => {
    const [store, setStore] = useState<IStore>({
        setUser,
        userInfo: {
            avatar: localStorage.getItem(userAvatarStorageKey) || "",
            name: localStorage.getItem(userNameStorageKey) || "Bebop Ed"
        }
    });

    function setUser(user: Partial<IUser>) {
        setStore(
            produce((draft: IStore) => {
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
