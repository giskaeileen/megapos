import { apiSlice } from "../api/apiSlice"

export const paymentHistoriesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaymentHistory: builder.query({
            query: ({ 
                storeId = null, 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "" 
            }) => {
                let url = `payment-histories?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSinglePaymentHistory: builder.query({
            query: ({storeId, id}) => ({
                url: `payment-histories/${id}`, 
                method: "GET"
            })
        }),
        updatePaymentHistory: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `payment-histories/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storePaymentHistory: builder.mutation({
            query: ({storeId, data}) => ({
                url: `payment-histories`,
                method: "POST",
                body: data,
            }),
        }),
        deletePaymentHistory: builder.mutation({
            query: ({storeId, id}) => ({
                url: `payment-histories/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetPaymentHistoryQuery,
    useGetSinglePaymentHistoryQuery,
    useUpdatePaymentHistoryMutation,
    useStorePaymentHistoryMutation,
    useDeletePaymentHistoryMutation,
} = paymentHistoriesApi 