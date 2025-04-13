import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';

const ProtectedRoute = () => {
    // Ambil user dari redux
    const reduxUser = useSelector((state: RootState) => state.auth.user);

    // Kalau redux kosong, coba ambil dari localStorage
    const localUser = localStorage.getItem('token');
    const user = reduxUser || (localUser ? JSON.parse(localUser) : null);

    return user ? <Outlet /> : <Navigate to="/page" replace />;
};

export default ProtectedRoute;