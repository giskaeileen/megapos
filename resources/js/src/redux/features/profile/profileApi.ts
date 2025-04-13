import { apiSlice } from "../api/apiSlice"

export const profileApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query({
            query: () => ({
                url: `profile`, 
                method: "GET"
            })
        }),
        updateProfile: builder.mutation({
            query: (data) => ({
                url: `profile`,
                method: "POST",
                body: data,
            }),
        }),
        changePassword: builder.mutation({
            query: (data) => ({
                url: `profile/change-password`,
                method: "POST",
                body: data,
            }),
        }),
    })
})

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
} = profileApi 