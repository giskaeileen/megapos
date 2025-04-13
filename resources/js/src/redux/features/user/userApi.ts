import { apiSlice } from "../api/apiSlice"


export const userApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            // query: ({ page = 1, search = "", sort = "created_at", direction = "desc"  }) => ({
            //     url: `users?page=${page}&search=${search}&sort=${sort}&direction=${direction}` 
            //     , method: "GET"
            // })
            query: ({ 
                page = 1, 
                search = "", 
                sort = "created_at", 
                direction = "desc", 
                filterColumn = "", 
                filterValue = "" 
            }) => {
                let url = `users?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        storeUser: builder.mutation({
            query: (data) => ({
                url: "users",
                method: "POST",
                body: data,
            }),
        }),
        getSingleUsers: builder.query({
            query: (id) => ({
                url: `users/${id}` 
                , method: "GET"
            })
        }),
        updateUser: builder.mutation({
            query: ({id, data}) => ({
                url: `users/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        deleteUser: builder.mutation({
            query: (id) => ({
                url: `users/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetUsersQuery,
    useStoreUserMutation,
    useGetSingleUsersQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
} = userApi