import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { apiSlice } from "./features/api/apiSlice";
import authSlice from "./features/auth/authSlice";
import themeConfigSlice from "../store/themeConfigSlice";

// Gabungkan semua reducer
const rootReducer = combineReducers({
    [apiSlice.reducerPath]: apiSlice.reducer, // RTK Query API Slice
    auth: authSlice, // Auth Slice
    themeConfig: themeConfigSlice, // Theme Config Slice
});

// Konfigurasi Redux Store
export const store = configureStore({
    reducer: rootReducer,
    devTools: false, // Nonaktifkan Redux DevTools (sesuaikan kebutuhan)
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware), // Tambahkan middleware RTK Query
});

export type RootState = ReturnType<typeof store.getState>;

// Tipe untuk RootState
export type IRootState = ReturnType<typeof rootReducer>;