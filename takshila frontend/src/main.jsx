import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRoutesFromElements,RouterProvider,createBrowserRouter,Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import { Toaster } from 'react-hot-toast'
import Otp from './Otp.jsx'

const router=createBrowserRouter(
  createRoutesFromElements(
      <Route path='/'>
        <Route index element={<App/>}/>
        <Route path='dashboard' element={<Dashboard/>}/>
        <Route path='verifyOTP' element={<Otp/>}></Route>
      </Route>
  )
)
createRoot(document.getElementById('root')).render(
  <>
  <Toaster
  position="top-right"
  reverseOrder={false}
    />
  <RouterProvider router={router}></RouterProvider>
   </>
)