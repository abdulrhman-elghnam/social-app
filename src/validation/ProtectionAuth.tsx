import React from 'react'
import { useAuthStore } from "../store/authStore"
import { Navigate } from 'react-router-dom'

export default function ProtectionAuth({ children }: React.PropsWithChildren) {
    // Use the actual token string from the store, not the user object
    const token = useAuthStore((state) => state.token)
    if (!token) {
        return <Navigate to={"/login"} />
    }
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}
