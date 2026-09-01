import type { AuthStore, User } from "@/types/user.type"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setUser: (data: any) =>
                set(() => {
                    const resolvedUser =
                        data?.data?.user || data?.user || (data?.name ? data : null)
                    return { user: resolvedUser }
                }),

            removeUser: () =>
                set(() => ({
                    user: null,
                })),

            setToken: (data: any) =>
                set(() => {
                    let resolvedToken: string | null = null
                    if (typeof data === "string") {
                        resolvedToken = data
                    } else if (data?.data?.token) {
                        resolvedToken = data.data.token
                    } else if (data?.token) {
                        resolvedToken = data.token
                    }
                    return { token: resolvedToken }
                }),

            removeToken: () =>
                set(() => ({
                    token: null,
                })),

            updateUserIcon: (data: any) =>
                set((state) => {
                    const photoUrl =
                        data?.data?.photo || data?.photo || (typeof data === "string" ? data : undefined)
                    return {
                        user: state.user
                            ? ({ ...(state.user as User), ...(photoUrl ? { photo: photoUrl } : {}) } as User)
                            : null,
                    }
                }),

            updateUserData: (data: any) =>
                set((state) => {
                    const updated = data?.data?.user || data?.user || (data?.name ? data : null)
                    return {
                        user: updated ? { ...state.user, ...updated } : state.user,
                    }
                }),
        }),
        {
            name: "auth-storage",
        }
    )
)