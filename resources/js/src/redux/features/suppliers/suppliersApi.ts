import { apiSlice } from "../api/apiSlice"

export const suppliersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getSuppliers: builder.query({
            // query: ({ storeId = "", page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
            //     url: `${storeId}/suppliers?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
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
                let url = `${storeId}/suppliers?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSingleSuppliers: builder.query({
            query: ({storeId, id}) => ({
                url: `${storeId}/suppliers/${id}`, 
                method: "GET"
            })
        }),
        updateSuppliers: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `${storeId}/suppliers/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeSuppliers: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/suppliers`,
                method: "POST",
                body: data,
            }),
        }),
        deleteSuppliers: builder.mutation({
            query: ({storeId, id}) => ({
                url: `${storeId}/suppliers/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetSuppliersQuery,
    useGetSingleSuppliersQuery,
    useUpdateSuppliersMutation,
    useStoreSuppliersMutation,
    useDeleteSuppliersMutation,
} = suppliersApi