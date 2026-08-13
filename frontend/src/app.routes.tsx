import { createBrowserRouter } from "react-router";
import Login from "./features/auth/pages/Login";
import Signup from "./features/auth/pages/Signup";
import NotFoundPage from "./features/not-found";
import Home from "./features/Home";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <ProtectedRoute />,
        children: [
            {
                index: true,
                element: <Home />
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
]);