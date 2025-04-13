import { apiSlice } from "../api/apiSlice"

export const rolePermissionApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRolePermissions: builder.query({
            query: ({ page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
                url: `role/permission?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
                method: "GET",
            }),
        }),
        getSingleRolePermission: builder.query({
            query: (id) => ({
                url: `role/permission/${id}`, 
                method: "GET"
            })
        }),
        updateRolePermission: builder.mutation({
            query: ({id, data}) => ({
                url: `role/permission/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        // storeRoles: builder.mutation({
        //     query: (data) => ({
        //         url: "roles",
        //         method: "POST",
        //         body: data,
        //     }),
        // }),
        // deleteRoles: builder.mutation({
        //     query: (id) => ({
        //         url: `roles/${id}`,
        //         method: "DELETE",
        //     })
        // }),
    })
})

export const {
    // useGetRolesQuery,
    // useGetSingleRolesQuery,
    // useUpdateRolesMutation,
    // useStoreRolesMutation,
    // useDeleteRolesMutation,
    useGetRolePermissionsQuery,
    useGetSingleRolePermissionQuery,
    useUpdateRolePermissionMutation,
} =rolePermissionApi 