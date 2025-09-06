import { useRoutes,Navigate } from "react-router-dom"

import AddProject from "../pages/AddProject"
import AddTask from "../pages/AddTask"

import MainLayout from "../layout/MainLayout"

const Approutes=()=>{
    const routes=useRoutes([
    {
        path:'/',
        element:<MainLayout/>,
        children:[
            {
                index: true,
                element: <AddProject/>,
            },
            { path:'task',element:(<AddTask/>)},
        ]
    },
    ])
    return routes
}

export default Approutes