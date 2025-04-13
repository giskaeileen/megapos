import React from 'react';
import { lazy } from 'react';
import PublicRoute from '../middlewares/PublicRoute';
import ProtectedRoute from '../middlewares/ProtectedRoute';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import BlankLayout from '../components/Layouts/BlankLayout';

// Eagerly loaded components (frequently used)
import ProductsList from '../pages/products/ProductsList';
import ProductsForm from '../pages/products/ProductsForm';
import MembersList from '../pages/members/MembersList';
import MembersForm from '../pages/members/MembersForm';
import OrdersList from '../pages/orders/OrdersList';
import ScanBarcodePage from '../components/ScanBarcodePage';

// Lazy loaded components
const SettingsOwner = lazy(() => import('../pages/settings/SettingsOwner'));
const Settings = lazy(() => import('../pages/settings/Settings'));
const StoreRegistration = lazy(() => import('../pages/stores/StoreRegistration'));
const LandingPage = lazy(() => import('../pages/landing/IndexThree'));
const PricingTable = lazy(() => import('../pages/PricingTable'));
const AttributesList = lazy(() => import('../pages/attributes/AttributesList'));
const AttributesForm = lazy(() => import('../pages/attributes/AttributesForm'));
const PosSystem = lazy(() => import('../pages/pos/Pos'));
const CartSidebar = lazy(() => import('../pages/CartSidebar'));
const StoreInformation = lazy(() => import('../pages/stores/StoreInformation'));
const MyStoresList = lazy(() => import('../pages/stores/MyStoresList'));
const RolePermissionForm = lazy(() => import('../pages/role_permission/RolePermissionForm'));
const RolePermissionList = lazy(() => import('../pages/role_permission/RolePermissionList'));
const PermissionList = lazy(() => import('../pages/permissions/PermissionsList'));
const PermissionForm = lazy(() => import('../pages/permissions/PermissionsForm'));
const RolesList = lazy(() => import('../pages/roles/RolesList'));
const RolesForm = lazy(() => import('../pages/roles/RolesForm'));
const StoresForm = lazy(() => import('../pages/stores/StoresForm'));
const StoresList = lazy(() => import('../pages/stores/StoresList'));
const StoreRegistrationsList = lazy(() => import('../pages/store_registrations/StoreRegistrationsList'));
const WizardRegistration = lazy(() => import('../components/WizardRegistration'));
const OrdersForm = lazy(() => import('../pages/orders/OrdersForm'));
const PendingOrdersList = lazy(() => import('../pages/orders/PendingOrdersList'));
const CategoriesList = lazy(() => import('../pages/categories/CategoriesList'));
const CategoriesForm = lazy(() => import('../pages/categories/CategoriesForm'));
const EmployeesList = lazy(() => import('../pages/employees/EmployeesList'));
const EmployeesForm = lazy(() => import('../pages/employees/EmployeesForm'));
const SuppliersList = lazy(() => import('../pages/suppliers/SuppliersList'));
const SuppliersForm = lazy(() => import('../pages/suppliers/SuppliersForm'));
const CustomersForm = lazy(() => import('../pages/customers/CustomersForm'));
const CustomersList = lazy(() => import('../pages/customers/CustomersList'));
const UserForm = lazy(() => import('../pages/users/UserForm'));
const UserList = lazy(() => import('../pages/users/UserList'));
const RegisterBoxed = lazy(() => import('../pages/auth/RegisterBoxed'));
const LoginBoxed = lazy(() => import('../pages/auth/LoginBoxed'));
const Dashboard = lazy(() => import('../pages/Index'));
const SalesReport = lazy(() => import('../pages/reports/SalesReport'));
const SalesProductReport = lazy(() => import('../pages/reports/SalesProductReport'));
const TopProductReport = lazy(() => import('../pages/reports/TopProductReport'));
const SubscriptionPage = lazy(() => import('../pages/subscriptions/SubscriptionPage'));
const PaymentPage = lazy(() => import('../pages/subscriptions/PaymentPage'));
const CurrentSubscription = lazy(() => import('../pages/subscriptions/CurrentSubscription'));

const routes = [
  // Protected Routes with Default Layout
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          // Dashboard
          { path: '/', element: <Dashboard /> },
          
          // Store Management
          { path: '/store-registrations', element: <StoreRegistrationsList /> },
          { path: '/stores', element: <StoresList /> },
          { path: '/stores/create', element: <StoresForm /> },
          { path: '/stores/:id', element: <StoresForm /> },
          { path: '/my-stores', element: <MyStoresList /> },
          { path: '/:slug', element: <StoreInformation /> },

          // User Management
          { path: '/users', element: <UserList /> },
          { path: '/users/create', element: <UserForm /> },
          { path: '/users/:id', element: <UserForm /> },

          // Role & Permission Management
          { path: '/roles', element: <RolesList /> },
          { path: '/roles/create', element: <RolesForm /> },
          { path: '/roles/:id', element: <RolesForm /> },
          { path: '/permissions', element: <PermissionList /> },
          { path: '/permissions/create', element: <PermissionForm /> },
          { path: '/permissions/:id', element: <PermissionForm /> },
          { path: '/role-permission', element: <RolePermissionList /> },
          { path: '/role-permission/:id', element: <RolePermissionForm /> },

          // Settings
          { path: '/settings', element: <Settings /> },
          { path: '/settings-owner', element: <SettingsOwner /> },
          { path: '/pricing', element: <PricingTable /> },
        ],
      },
    ],
  },

  // Store-Specific Protected Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DefaultLayout />,
        children: [
          // Customer Management
          { path: '/:storeId/customers', element: <CustomersList /> },
          { path: '/:storeId/customers/create', element: <CustomersForm /> },
          { path: '/:storeId/customers/:id', element: <CustomersForm /> },

          // Member Management
          { path: '/:storeId/members', element: <MembersList /> },
          { path: '/:storeId/members/create', element: <MembersForm /> },
          { path: '/:storeId/members/:id', element: <MembersForm /> },

          // Supplier Management
          { path: '/:storeId/suppliers', element: <SuppliersList /> },
          { path: '/:storeId/suppliers/create', element: <SuppliersForm /> },
          { path: '/:storeId/suppliers/:id', element: <SuppliersForm /> },

          // Employee Management
          { path: '/:storeId/employees', element: <EmployeesList /> },
          { path: '/:storeId/employees/create', element: <EmployeesForm /> },
          { path: '/:storeId/employees/:id', element: <EmployeesForm /> },

          // Product Management
          { path: '/:storeId/products', element: <ProductsList /> },
          { path: '/:storeId/products/create', element: <ProductsForm /> },
          { path: '/:storeId/products/:id', element: <ProductsForm /> },

          // Category Management
          { path: '/:storeId/categories', element: <CategoriesList /> },
          { path: '/:storeId/categories/create', element: <CategoriesForm /> },
          { path: '/:storeId/categories/:id', element: <CategoriesForm /> },

          // Attribute Management
          { path: '/:storeId/attributes', element: <AttributesList /> },
          { path: '/:storeId/attributes/create', element: <AttributesForm /> },
          { path: '/:storeId/attributes/:id', element: <AttributesForm /> },

          // POS System
          { path: '/:storeId/pos', element: <PosSystem /> },
          { path: '/:storeId/cart', element: <CartSidebar /> },

          // Order Management
          { path: '/pending-orders', element: <PendingOrdersList /> },
          { path: '/:storeSlug/orders', element: <OrdersList /> },
          { path: '/:storeSlug/orders/:id', element: <OrdersForm /> },
          { path: '/:storeId/print-invoice', element: <OrdersList /> },

          // Reports
          { path: '/:storeSlug/sales-report', element: <SalesReport /> },
          { path: '/:storeSlug/sales-product-report', element: <SalesProductReport /> },
          { path: '/:storeSlug/top-product-report', element: <TopProductReport /> },

          // Subscription
          { path: '/subs-page', element: <SubscriptionPage /> },
          { path: '/payment-page', element: <PaymentPage /> },
          { path: '/current-subs', element: <CurrentSubscription /> },
        ],
      },
    ],
  },

  // Public Routes (Authentication)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <BlankLayout />,
        children: [
          { path: '/login', element: <LoginBoxed /> },
          { path: '/register', element: <RegisterBoxed /> },
        ],
      },
    ],
  },

  // Public Pages
  {
    element: <BlankLayout />,
    children: [
      { path: '/page', element: <LandingPage /> },
      { path: '/store-registration', element: <StoreRegistration /> },
      { path: '/wizard', element: <WizardRegistration /> },
    ],
  },

//   // Utility Routes
//   {
//     path: '/barcode',
//     element: <ScanBarcodePage />,
//     layout: 'default',
//   },
];

export { routes };