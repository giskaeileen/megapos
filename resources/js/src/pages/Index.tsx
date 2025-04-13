import React from 'react';
import AdminDash from "./dashboards/AdminDash";
import EmployeeDash from "./dashboards/EmployeeDash";
import OwnerDash from "./dashboards/OwnerDash";

interface User {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    stores: [{slug: string}],
}

const Index = () => {
    const user: User = JSON.parse(localStorage.getItem("user") || "{}");

    const userRoles = user?.roles;

    const hasAdminRole = userRoles?.includes("Admin");
    const hasEmployeeRole = userRoles?.includes("Employee");
    const hasOwnerRole = userRoles?.includes("Owner");

    return (
        <div>
            {hasAdminRole && <AdminDash />}
            {hasOwnerRole && <OwnerDash />}
            {hasEmployeeRole && <EmployeeDash />}
        </div>
    );
};

export default Index;
