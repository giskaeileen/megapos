import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type User = {
    id: number;
    name: string;
    email: string;
};

type AuthState = {
    token: string;
    user: User | null;
};

const getUserFromStorage = (): User | null => {
    try {
        const user = localStorage.getItem("user");
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
};

const initialState: AuthState = {
    token: localStorage.getItem("token") || "",
    user: getUserFromStorage(),
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        userRegistration: (state, action: PayloadAction<{ token: string; user: User }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        userLoggedIn: (state, action: PayloadAction<{ token: string; user: User }>) => {
            state.token = action.payload.token;
            state.user = action.payload.user;
            localStorage.setItem("token", action.payload.token);
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        userLoaded: (state, action: PayloadAction<{ user: User }>) => {
            state.user = action.payload.user;
            localStorage.setItem("user", JSON.stringify(action.payload.user));
        },
        userLoggedOut: (state) => {
            state.token = "";
            state.user = null;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
    },
});

export const { userRegistration, userLoggedIn, userLoggedOut, userLoaded } = authSlice.actions;
export default authSlice.reducer;
