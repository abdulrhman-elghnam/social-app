import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from '../navbar'
import { useAuthStore } from '@/store/authStore'

export default function Layout() {
    const token = useAuthStore((state) => state.token)
    return (
        <React.Fragment>
            {!!token && <Navbar />}
            <Outlet />
        </React.Fragment>
    )
}
