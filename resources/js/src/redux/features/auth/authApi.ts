import { apiSlice } from "../api/apiSlice";
import { userLoggedIn, userLoggedOut, userRegistration, userLoaded } from "./authSlice";

type RegistrationResponse = {
    message: string;
    token: string;
    user: any;
}

type RegistrationData = {}

export const authApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        register: builder.mutation<RegistrationResponse, RegistrationData>({
            query: (data) => ({
                url: "register",
                method: "POST",
                body: data,
                credentials: "include" as const
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    // console.log(result);
                    dispatch(
                        userRegistration({
                            token: result.data.token,
                            user: result.data.user,
                        })
                    )
                } catch (error: any) {
                    console.log(error)
                }
            }
        }),

        login: builder.mutation({
            query: ({ email, password }) => ({
                url: "login",
                method: "POST",
                body: {
                    email,
                    password
                },
                // credentials: "include" as const
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(
                        userLoggedIn({
                            token: result.data.token,
                            user: result.data.user
                        })
                    )
                } catch (error: any) {
                    console.log(error)
                }
            }
        }),

        loadUser: builder.query({
            query: () => ({
                url: "user", 
                method: "GET"
            }), async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    const result = await queryFulfilled;
                    dispatch(
                        userLoaded({
                            user: result.data.user
                        })
                    )
                } catch (error: any) {
                    console.log(error)
                }
            }
        }),
        logout: builder.query({
            query: () => ({
                url: "logout",
                method: "GET",
                credentials: "include" as const
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                try {
                    dispatch(
                        userLoggedOut()
                    )
                } catch (error: any) {
                    console.log(error)
                }
            }
        })
    })
})

export const {
    useRegisterMutation,
    useLoginMutation,
    useLogoutQuery,
    useLoadUserQuery,
} = authApi