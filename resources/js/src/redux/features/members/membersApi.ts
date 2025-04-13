import { apiSlice } from "../api/apiSlice"

export const membersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMembers: builder.query({
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
                let url = `${storeId}/members?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSingleMembers: builder.query({
            query: ({storeId, id}) => ({
                url: `${storeId}/members/${id}`, 
                method: "GET"
            })
        }),
        updateMembers: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `${storeId}/members/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeMembers: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/members`,
                method: "POST",
                body: data,
            }),
        }),
        deleteMembers: builder.mutation({
            query: ({storeId, id}) => ({
                url: `${storeId}/members/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetMembersQuery,
    useStoreMembersMutation,
    useUpdateMembersMutation,
    useGetSingleMembersQuery,
    useDeleteMembersMutation,
} = membersApi 