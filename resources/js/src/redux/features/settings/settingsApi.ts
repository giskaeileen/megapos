import { apiSlice } from "../api/apiSlice"

export const settingsApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        // getCategories: builder.query({
        //     query: ({ storeId = "", page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
        //         url: `${storeId}/categories?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
        //         method: "GET",
        //     }),
        // }),
        // getSingleCategory: builder.query({
        //     query: ({storeId, id}) => ({
        //         url: `${storeId}/categories/${id}`, 
        //         method: "GET"
        //     })
        // }),
        // updateCategory: builder.mutation({
        //     query: ({storeId, id, data}) => ({
        //         url: `${storeId}/categories/${id}`,
        //         method: "POST",
        //         body: data,
        //     }),
        // }),
        // storeCategory: builder.mutation({
        //     query: ({storeId, data}) => ({
        //         url: `${storeId}/categories`,
        //         method: "POST",
        //         body: data,
        //     }),
        // }),
        // deleteCategory: builder.mutation({
        //     query: ({storeId, id}) => ({
        //         url: `${storeId}/categories/${id}`,
        //         method: "DELETE",
        //     })
        // }),
        getSettings: builder.query({
            query: () => ({
                url: `settings`,
                method: "GET",
            }),
        }),
        updateSettings: builder.mutation({
            query: ({key, value}) => ({
                url: `settings/${key}`,
                method: "PUT",
                body: {value},
            }),
        }),
        setMultiStore: builder.mutation({
            query: (data) => ({
                url: `multi`,
                method: "POST",
                body: data,
            }),
        }),
        getUserLogin: builder.query({
            query: () => ({
                url: `user`,
                method: "GET",
            }),
        }),
    })
})

export const {
    // useGetCategoriesQuery,
    // useGetSingleCategoryQuery,
    // useUpdateCategoryMutation,
    // useStoreCategoryMutation,
    // useDeleteCategoryMutation,
    useGetSettingsQuery,
    useUpdateSettingsMutation,
    useSetMultiStoreMutation,
    useGetUserLoginQuery,
} = settingsApi 