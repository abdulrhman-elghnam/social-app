import Layout from '@/components/layout/Layout'
import Feed from '@/pages/Feed'
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import Notification from '@/pages/Notification'
import Profile from '@/pages/Profile'
import UserProfile from '@/pages/UserProfile'
import Setting from '@/pages/Setting'
import SignUp from '@/pages/SignUp'
import NotFound from '@/pages/NotFound'
import AuthLayer from '@/secure/AuthLayer'
import AuthLogin from '@/secure/AuthLogin'
import React from 'react'
import { createBrowserRouter, RouterProvider } from "react-router-dom"

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            { index: true, element: <AuthLogin> <Login /> </AuthLogin> },
            { path: "Login", element: <AuthLogin>  <Login /> </AuthLogin> },
            { path: "Signup", element: <SignUp /> },
            { path: "Home", element: <AuthLayer> <Home /> </AuthLayer> },
            { path: "Profile", element: <AuthLayer><Profile /></AuthLayer> },
            { path: "user/:userId", element: <AuthLayer><UserProfile /></AuthLayer> },
            { path: "setting", element: <AuthLayer> <Setting /> </AuthLayer> },
            { path: "feed", element: <AuthLayer> <Feed /> </AuthLayer> },
            { path: "notifications", element: <AuthLayer> <Notification /> </AuthLayer> },
        ]
    },
    { path: "*", element: <NotFound /> },
])

export default function Routes() {
    return (
        <React.Fragment>
            <RouterProvider router={router} />
        </React.Fragment>
    )
}
