import { apiSlice } from "../api/apiSlice"

export const permissionsApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPermissions: builder.query({
            query: ({ page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
                url: `permissions?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
                method: "GET",
            }),
        }),
        getSinglePermissions: builder.query({
            query: (id) => ({
                url: `permissions/${id}`, 
                method: "GET"
            })
        }),
        updatePermissions: builder.mutation({
            query: ({id, data}) => ({
                url: `permissions/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storePermissions: builder.mutation({
            query: (data) => ({
                url: "permissions",
                method: "POST",
                body: data,
            }),
        }),
        deletePermissions: builder.mutation({
            query: (id) => ({
                url: `permissions/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetPermissionsQuery,
    useGetSinglePermissionsQuery,
    useUpdatePermissionsMutation,
    useStorePermissionsMutation,
    useDeletePermissionsMutation,
} = permissionsApi 