// import { Navigate, Outlet } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { RootState } from '../redux/store';

// const PublicRoute = () => {
//     const user = useSelector((state: RootState) => state.auth.user);

//     return user ? <Navigate to="/" replace /> : <Outlet />;
// };

// export default PublicRoute;

import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";

const PublicRoute = () => {
    // const user = useSelector((state: RootState) => state.auth.user);
    const rawUser = useSelector((state: RootState) => state.auth.user);

    // Pastikan user adalah objek, bukan string
    // const user = typeof rawUser === "string" ? JSON.parse(rawUser) : rawUser;

    let user = null;
    try {
        // Pastikan user adalah objek, bukan string, dan string kosong tidak diparse
        user = typeof rawUser === "string" && rawUser.trim() !== "" ? JSON.parse(rawUser) : rawUser;
    } catch (e) {
        console.error("Error parsing user data", e);
        user = null; // Set user to null jika JSON parsing gagal
    }

    if (user) {
        // Jika user memiliki role "Employee", arahkan ke store
        if (user.roles?.some((role: string) => role === "Employee")) {
            return <Navigate to={`/${user.stores?.[0]?.slug || ""}`} replace />;
        }

        // Jika user memiliki role "Admin" atau "Owner", arahkan ke dashboard utama
        return <Navigate to="/" replace />;
    }

    // Jika user belum login, tetap tampilkan halaman public
    return <Outlet />;
};

export default PublicRoute;
