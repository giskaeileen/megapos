import { apiSlice } from "../api/apiSlice"

export const productsApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProducts: builder.query({
            // query: ({ storeId = "", page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
            //     url: `${storeId}/products?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
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
                let url = `${storeId}/products?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getProductsSKU: builder.query({
            query: ({ 
                storeId = null, 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "" 
            }) => {
                let url = `${storeId}/product-sku?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSingleProduct: builder.query({
            query: ({storeId, id}) => ({
                url: `${storeId}/products/${id}`, 
                method: "GET"
            })
        }),
        updateProduct: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `${storeId}/products/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeProduct: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/products`,
                method: "POST",
                body: data,
            }),
        }),
        deleteProduct: builder.mutation({
            query: ({storeId, id}) => ({
                url: `${storeId}/products/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetProductsQuery,
    useGetSingleProductQuery,
    useUpdateProductMutation,
    useStoreProductMutation,
    useDeleteProductMutation,
    useGetProductsSKUQuery,
} = productsApi 