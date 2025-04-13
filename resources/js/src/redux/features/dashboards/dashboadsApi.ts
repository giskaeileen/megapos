import { apiSlice } from "../api/apiSlice"

export const dashboardApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getOnwerDash: builder.query({
            query: () => ({
                url: `owner-dash`,
                method: "GET",
            }),
        }),
        getOnwerOrdersDash: builder.query({
            query: () => ({
                url: `owner-dash-orders`,
                method: "GET",
            }),
        }),
        getOnwerTopProductsDash: builder.query({
            query: () => ({
                url: `owner-dash-topproducts`,
                method: "GET",
            }),
        }),
        getAdminDash: builder.query({
            query: () => ({
                url: `admin-dash`,
                method: "GET",
            }),
        }),
    })
})

export const {
    useGetOnwerDashQuery,
    useGetOnwerOrdersDashQuery,
    useLazyGetOnwerOrdersDashQuery,
    useGetOnwerTopProductsDashQuery,
    useLazyGetOnwerTopProductsDashQuery,
    useGetAdminDashQuery,
    useLazyGetAdminDashQuery,
} = dashboardApi; 