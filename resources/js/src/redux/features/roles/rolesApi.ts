import { apiSlice } from "../api/apiSlice"

export const rolesApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRoles: builder.query({
            query: ({ page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
                url: `roles?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
                method: "GET",
            }),
        }),
        getSingleRoles: builder.query({
            query: (id) => ({
                url: `roles/${id}`, 
                method: "GET"
            })
        }),
        updateRoles: builder.mutation({
            query: ({id, data}) => ({
                url: `roles/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeRoles: builder.mutation({
            query: (data) => ({
                url: "roles",
                method: "POST",
                body: data,
            }),
        }),
        deleteRoles: builder.mutation({
            query: (id) => ({
                url: `roles/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetRolesQuery,
    useGetSingleRolesQuery,
    useUpdateRolesMutation,
    useStoreRolesMutation,
    useDeleteRolesMutation,
} = rolesApi 