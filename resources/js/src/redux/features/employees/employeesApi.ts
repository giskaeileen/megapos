import { apiSlice } from "../api/apiSlice"

export const employeesApi= apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getEmployees: builder.query({
            // query: ({ storeId = null, page = 1, search = "", sort = "created_at", direction = "desc" }) => ({
            //     url: `${storeId}/employees/?page=${page}&search=${search}&sort=${sort}&direction=${direction}`,
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
                let url = `${storeId}/employees?page=${page}&search=${search}&sort=${sort}&direction=${direction}`;
                if (filterColumn && filterValue) {
                    url += `&${filterColumn}=${filterValue}`;
                }
                return { url, method: "GET" };
            },
        }),
        getSingleEmployee: builder.query({
            query: ({storeId, id}) => ({
                url: `${storeId}/employees/${id}`, 
                method: "GET"
            })
        }),
        updateEmployee: builder.mutation({
            query: ({storeId, id, data}) => ({
                url: `${storeId}/employees/${id}`,
                method: "POST",
                body: data,
            }),
        }),
        storeEmployee: builder.mutation({
            query: ({storeId, data}) => ({
                url: `${storeId}/employees`,
                method: "POST",
                body: data,
            }),
        }),
        deleteEmployee: builder.mutation({
            query: ({storeId, id}) => ({
                url: `${storeId}/employees/${id}`,
                method: "DELETE",
            })
        }),
    })
})

export const {
    useGetEmployeesQuery,
    useGetSingleEmployeeQuery,
    useUpdateEmployeeMutation,
    useStoreEmployeeMutation,
    useDeleteEmployeeMutation,
} = employeesApi 