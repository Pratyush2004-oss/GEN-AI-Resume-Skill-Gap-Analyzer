import { RouterProvider } from 'react-router'
import { router } from "./app.routes.tsx";

const App = () => {
  return (
    <RouterProvider router={router} />
  )
}

export default App