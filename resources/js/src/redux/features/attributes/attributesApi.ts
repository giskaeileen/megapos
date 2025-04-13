import { apiSlice } from "../api/apiSlice"

export const attributesApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAttributes: builder.query({
            // query: ({ storeId = "", page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
            //     url: `${storeId}/attributes?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
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
                let url = `${storeId}/attributes?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSingleAttributes: builder.query({
            query: ({storeId, id}) => ({
                url: `${storeId}/attributes/${id}`, 
                method: "GET"
            })
        }),
        updateAttributes: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `${storeId}/attributes/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeAttributes: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/attributes`,
                method: "POST",
                body: data,
            }),
        }),
        deleteAttributes: builder.mutation({
            query: ({storeId, id}) => ({
                url: `${storeId}/attributes/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetAttributesQuery,
    useGetSingleAttributesQuery,
    useUpdateAttributesMutation,
    useStoreAttributesMutation,
    useDeleteAttributesMutation,
} = attributesApi 