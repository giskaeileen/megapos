import { apiSlice } from "../api/apiSlice"

export const posApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPos: builder.query({
            // query: ({storeId = "",  page = 1, search = "", sort = "created_at", direction = "desc", category = ""}) => ({
            //     url: `${storeId}/pos?page=${page}&search=${search}&sort=${sort}&direction=${direction}&category=${category}`,
            //     method: "GET",
            // }),
            query: ({ 
                storeId = null, 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                category = "" 
            }) => {
                let url = `${storeId}/pos?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (category) {
                    url += `&category=${category}`;
                }
                return { url, method: "GET" };
            },
        }),
        addProduct: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/pos/add`,
                method: "POST",
                body: data,
            }),
        }),
        // getSingleCategory: builder.query({
        //     query: (id) => ({
        //         url: `categories/${id}`, 
        //         method: "GET"
        //     })
        // }),
        updatePosProduct: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `${storeId}/pos/update/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        // storeCategory: builder.mutation({
        //     query: (data) => ({
        //         url: "categories",
        //         method: "POST",
        //         body: data,
        //     }),
        // }),
        deletePosProduct: builder.mutation({
            query: ({storeId, id}) => ({
                url: `${storeId}/pos/delete/${id}`, 
                method: "GET"
            })
        }),
        createPosOrder: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/pos/order`,
                method: "POST",
                body: data,
            }),
        }),
        updateStatusOrder: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/orders/update/status`,
                method: "POST",
                body: data,
            }),
        }),
        createMidtransToken: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/pos/midtrans_token`,
                method: "POST",
                body: data,
            }),
        }),
    })
})

export const {
    useGetPosQuery,
    useAddProductMutation,
    useUpdatePosProductMutation,
    useDeletePosProductMutation,
    useCreatePosOrderMutation,
    useCreateMidtransTokenMutation,
    useUpdateStatusOrderMutation,
} = posApi 