import type { LoginUser } from "@/types";
import { create } from "zustand";

interface LoginUserStore {
    loginUser: LoginUser | null;
    setLoginUser: (loginUser: LoginUser) => void;
    resetLoginUser: () => void;
};

export const useLoginUserStore = create<LoginUserStore>(set => ({
    loginUser: JSON.parse(localStorage.getItem("loginUser") || "null"),
    setLoginUser: (loginUser) => {
        set(state => ({...state, loginUser}));
        localStorage.setItem("loginUser", JSON.stringify(loginUser));
    },
    resetLoginUser: () => {
        set(state => ({ ...state, loginUser: null}))
        localStorage.removeItem("loginUser");
    }
}));
