import Layout from "@/components/layout/Layout";
import Feed from "@/pages/Feed";
import Login from "@/pages/Login";
import Notification from "@/pages/Notification";
import Profile from "@/pages/Profile";
import UserProfile from "@/pages/UserProfile";
import Setting from "@/pages/Setting";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";
import AuthLayer from "@/secure/AuthLayer";
import AuthLogin from "@/secure/AuthLogin";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                index: true,
                element: (
                    <AuthLogin>
                        <Login />
                    </AuthLogin>
                ),
            },
            {
                path: "login",
                element: (
                    <AuthLogin>
                        <Login />
                    </AuthLogin>
                ),
            },
            {
                path: "Login",
                element: <Navigate to="/login" replace />,
            },
            {
                path: "signup",
                element: (
                    <AuthLogin>
                        <SignUp />
                    </AuthLogin>
                ),
            },
            {
                path: "Signup",
                element: <Navigate to="/signup" replace />,
            },
            {
                path: "feed",
                element: (
                    <AuthLayer>
                        <Feed />
                    </AuthLayer>
                ),
            },
            {
                path: "home",
                element: <Navigate to="/feed" replace />,
            },
            {
                path: "Home",
                element: <Navigate to="/feed" replace />,
            },
            {
                path: "profile",
                element: (
                    <AuthLayer>
                        <Profile />
                    </AuthLayer>
                ),
            },
            {
                path: "Profile",
                element: <Navigate to="/profile" replace />,
            },
            {
                path: "user/:userId",
                element: (
                    <AuthLayer>
                        <UserProfile />
                    </AuthLayer>
                ),
            },
            {
                path: "settings",
                element: (
                    <AuthLayer>
                        <Setting />
                    </AuthLayer>
                ),
            },
            {
                path: "setting",
                element: <Navigate to="/settings" replace />,
            },
            {
                path: "notifications",
                element: (
                    <AuthLayer>
                        <Notification />
                    </AuthLayer>
                ),
            },
        ],
    },
    { path: "*", element: <NotFound /> },
]);

export default function Routes() {
    return <RouterProvider router={router} />;
}

