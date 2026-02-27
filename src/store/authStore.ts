import type { AuthStore, User } from "@/types/user.type"
import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            setUser: (data: any) =>
                set(() => ({
                    user: data?.data?.user || data?.user || (data?.name ? data : null),
                })),

            removeUser: () =>
                set(() => ({
                    user: null,
                })),
            setToken: (data: any) =>
                set(() => ({
                    token: data?.data?.token || data?.token,
                })),
            removeToken: () =>
                set(() => ({
                    token: null,
                })),
            updateUserIcon: (data: any) =>
                set((state) => ({
                    user: state.user
                        ? ({ ...(state.user as User), photo: data?.data?.photo || data?.photo || data } as User)
                        : null,
                })),
            updateUserData: (data: any) =>
                set(() => ({
                    user: data?.data?.user || data?.user || (data?.name ? data : null),
                }))
        }),
        {
            name: "auth-storage",
        }
    )
)