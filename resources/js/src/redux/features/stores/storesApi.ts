import { apiSlice } from "../api/apiSlice"
// import { useSocialAuthMutation } from "../auth/authApi"

export const suppliersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        registrationStore: builder.mutation({
            query: (data) => ({
                url: "store-registrations",
                method: "POST",
                body: data,
            }),
        }),
        getStoreRegistrations: builder.query({
            // query: ({ page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
            //     url: `store-registrations?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
            //     method: "GET",
            // }),
            query: ({ 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "" 
            }) => {
                let url = `store-registrations?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        approveStoreRegistrations: builder.mutation({
            query: (id) => ({
                url: `store-registrations/${id}/approve`,
                method: "POST",
            }),
        }),
        getStores: builder.query({
            // query: ({ page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
            //     url: `stores?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
            //     method: "GET",
            // }),
            query: ({ 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "" 
            }) => {
                let url = `stores?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSingleStore: builder.query({
            query: (slug) => ({
                url: `stores/${slug}`, 
                method: "GET"
            })
        }),
        updateStores: builder.mutation({
            query: ({id, data}) => ({
                url: `stores/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeStores: builder.mutation({
            query: (data) => ({
                url: "stores",
                method: "POST",
                body: data,
            }),
        }),
        deleteStores: builder.mutation({
            query: (id) => ({
                url: `stores/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useRegistrationStoreMutation,
    useGetStoreRegistrationsQuery,
    useApproveStoreRegistrationsMutation,
    useGetStoresQuery,
    useGetSingleStoreQuery,
    useUpdateStoresMutation,
    useStoreStoresMutation,
    useDeleteStoresMutation,
} = suppliersApi