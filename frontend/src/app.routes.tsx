import { createBrowserRouter, Outlet } from "react-router";
import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/Signup";
import NotFoundPage from "./features/not-found";
import Home from "./features/Interview/Pages/Home";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import Navbar from "./components/shared/Navbar";
import Interview from "./features/Interview/Pages/Interview";

const RootLayout = () => (
    <>
        <Navbar />
        <Outlet />
    </>
);

export const router = createBrowserRouter([
    {
        element: <RootLayout />,
        children: [
            {
                path: "/",
                element: <ProtectedRoute />,
                children: [
                    {
                        index: true,
                        element: <Home />
                    },
                    {
                        path: "/interview/:interviewId",
                        element: <Interview />
                    }
                ]
            },
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/signup",
                element: <Signup />
            },
            {
                path: "*",
                element: <NotFoundPage />
            }
        ]
    }
]);
