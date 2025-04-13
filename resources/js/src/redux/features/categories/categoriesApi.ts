import { apiSlice } from "../api/apiSlice"

export const categoryApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query({
            // query: ({ storeId = "", page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
            //     url: `${storeId}/categories?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
            //     method: "GET",
            // }),
            query: ({ 
                storeId = null, 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "" 
            }) => {
                let url = `${storeId}/categories?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSingleCategory: builder.query({
            query: ({storeId, id}) => ({
                url: `${storeId}/categories/${id}`, 
                method: "GET"
            })
        }),
        updateCategory: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `${storeId}/categories/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeCategory: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/categories`,
                method: "POST",
                body: data,
            }),
        }),
        deleteCategory: builder.mutation({
            query: ({storeId, id}) => ({
                url: `${storeId}/categories/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetCategoriesQuery,
    useGetSingleCategoryQuery,
    useUpdateCategoryMutation,
    useStoreCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi 