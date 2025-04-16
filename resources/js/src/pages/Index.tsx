import React from 'react';
// Import komponen dashboard berdasarkan peran user
import AdminDash from "./dashboards/AdminDash";
import EmployeeDash from "./dashboards/EmployeeDash";
import OwnerDash from "./dashboards/OwnerDash";

// Interface untuk mendefinisikan struktur objek user
interface User {
    id: number;
    name: string;
    email: string;
    roles: string[]; // Daftar peran (role) user, misalnya: ["Admin"]
    permissions: string[]; // Daftar izin (permission) user
    stores: [{ slug: string }]; // Daftar toko yang dimiliki user, diwakili oleh slug
}

// Komponen utama
const Index = () => {
    // Ambil data user dari localStorage, lalu ubah dari string ke objek
    const user: User = JSON.parse(localStorage.getItem("user") || "{}");

    // Ambil daftar peran dari user
    const userRoles = user?.roles;

    // Cek apakah user memiliki peran Admin
    const hasAdminRole = userRoles?.includes("Admin");

    // Cek apakah user memiliki peran Employee
    const hasEmployeeRole = userRoles?.includes("Employee");

    // Cek apakah user memiliki peran Owner
    const hasOwnerRole = userRoles?.includes("Owner");

    return (
        <div>
            {/* Jika user adalah Admin, tampilkan dashboard Admin */}
            {hasAdminRole && <AdminDash />}

            {/* Jika user adalah Owner, tampilkan dashboard Owner */}
            {hasOwnerRole && <OwnerDash />}

            {/* Jika user adalah Employee, tampilkan dashboard Employee */}
            {hasEmployeeRole && <EmployeeDash />}
        </div>
    );
};

export default Index;
