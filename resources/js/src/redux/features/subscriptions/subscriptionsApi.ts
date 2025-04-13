import { apiSlice } from "../api/apiSlice"

export const subscriptionsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPlans: builder.query({
            query: () => ({
                url: `/plans`,
                method: "GET",
            }),
        }),
        getPaymentIntent: builder.mutation({
            query: () => ({
                url: `/create-payment-intent`,
                method: "POST",
            }),
        }),
    })
})

export const {
    useGetPlansQuery,
    useGetPaymentIntentMutation,
} = subscriptionsApi 