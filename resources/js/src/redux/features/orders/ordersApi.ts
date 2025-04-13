import { apiSlice } from "../api/apiSlice"

export const ordersApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPandingOrders: builder.query({
            query: ({ page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
                url: `orders/pending?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
                method: "GET",
            }),
        }),
        getOrders: builder.query({
            query: ({ 
                storeId = null, 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "",
                selectedDateFilter= "",
                filterDateValue = "",
                rangeDateStart = "",
                rangeDateEnd = "",
                rangePriceMin = "",
                rangePriceMax = "",
            }) => {
                let url = `${storeId}/orders?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }

                if (selectedDateFilter && filterDateValue) {
                    url += `&${selectedDateFilter}=${filterDateValue}`;
                }

                // Tambahkan range date jika ada
                if (rangeDateStart) {
                    url += `&order_date_min=${rangeDateStart}`;
                }
                if (rangeDateEnd) {
                    url += `&order_date_max=${rangeDateEnd}`;
                }

                // Tambahkan range price jika ada
                if (rangePriceMin) {
                    url += `&pay_min=${rangePriceMin}`;
                }
                if (rangePriceMax) {
                    url += `&pay_max=${rangePriceMax}`;
                }

                return { url, method: "GET" };
            },
        }),
        getOrdersProduct: builder.query({
            query: ({ 
                storeId = null, 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "",
                selectedDateFilter= "",
                filterDateValue = "",
                rangeDateStart = "",
                rangeDateEnd = "",
                rangePriceMin = "",
                rangePriceMax = "",
            }) => {
                let url = `${storeId}/orders-product?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }

                if (selectedDateFilter && filterDateValue) {
                    url += `&${selectedDateFilter}=${filterDateValue}`;
                }

                // Tambahkan range date jika ada
                if (rangeDateStart) {
                    url += `&order_date_min=${rangeDateStart}`;
                }
                if (rangeDateEnd) {
                    url += `&order_date_max=${rangeDateEnd}`;
                }

                // Tambahkan range price jika ada
                if (rangePriceMin) {
                    url += `&pay_min=${rangePriceMin}`;
                }
                if (rangePriceMax) {
                    url += `&pay_max=${rangePriceMax}`;
                }

                return { url, method: "GET" };
            },
        }),
        getTopProduct: builder.query({
            query: ({ 
                storeId = null, 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "",
                selectedDateFilter= "",
                filterDateValue = "",
                rangeDateStart = "",
                rangeDateEnd = "",
                rangePriceMin = "",
                rangePriceMax = "",
            }) => {
                let url = `${storeId}/top-product?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }

                if (selectedDateFilter && filterDateValue) {
                    url += `&${selectedDateFilter}=${filterDateValue}`;
                }

                // Tambahkan range date jika ada
                if (rangeDateStart) {
                    url += `&order_date_min=${rangeDateStart}`;
                }
                if (rangeDateEnd) {
                    url += `&order_date_max=${rangeDateEnd}`;
                }

                // Tambahkan range price jika ada
                if (rangePriceMin) {
                    url += `&pay_min=${rangePriceMin}`;
                }
                if (rangePriceMax) {
                    url += `&pay_max=${rangePriceMax}`;
                }

                return { url, method: "GET" };
            },
        }),
        getSingleOrder: builder.query({
            query: ({storeId, id}) => ({
                url: `${storeId}/orders/details/${id}`, 
                method: "GET"
            })
        }),
        // updateSuppliers: builder.mutation({
        //     query: ({id, data}) => ({
        //         url: `suppliers/${id}`,
        //         method: "POST",
        //         body: data,
        //     }),
        // }),
        // storeSuppliers: builder.mutation({
        //     query: (data) => ({
        //         url: "suppliers",
        //         method: "POST",
        //         body: data,
        //     }),
        // }),
        // deleteSuppliers: builder.mutation({
        //     query: (id) => ({
        //         url: `suppliers/${id}`,
        //         method: "DELETE",
        //     })
        // }),
    })
})

export const {
    // useGetSuppliersQuery,
    // useGetSingleSuppliersQuery,
    // useUpdateSuppliersMutation,
    // useStoreSuppliersMutation,
    // useDeleteSuppliersMutation,
    useGetPandingOrdersQuery,
    useGetOrdersQuery,
    useGetSingleOrderQuery,
    useLazyGetOrdersQuery,
    useGetOrdersProductQuery,
    useLazyGetOrdersProductQuery,
    useGetTopProductQuery,
    useLazyGetTopProductQuery,
} = ordersApi 