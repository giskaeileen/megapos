import { apiSlice } from "../api/apiSlice"

export const customersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCustomers: builder.query({
            // query: ({ storeId = "", page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
            //     url: `${storeId}/customers?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
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
                let url = `${storeId}/customers?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSingleCustomers: builder.query({
            query: ({storeId, id}) => ({
                url: `${storeId}/customers/${id}`, 
                method: "GET"
            })
        }),
        updateCustomer: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `${storeId}/customers/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeCustomer: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/customers`,
                method: "POST",
                body: data,
            }),
        }),
        deleteCustomer: builder.mutation({
            query: ({storeId, id}) => ({
                url: `${storeId}/customers/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetCustomersQuery,
    useGetSingleCustomersQuery,
    useUpdateCustomerMutation,
    useStoreCustomerMutation,
    useDeleteCustomerMutation,
} = customersApi