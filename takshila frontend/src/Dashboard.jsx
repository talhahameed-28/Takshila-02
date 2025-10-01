import axios from 'axios'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {

  const navigate=useNavigate()
  useEffect(()=>{
    const checkLoggedIn=async()=>{
        axios.defaults.withCredentials=true
        const {data}=await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/check`)
        if(!data.loggedIn) navigate("/")
    }
    checkLoggedIn()
},[])

  const handleLogout=async()=>{
    try{
      axios.defaults.withCredentials=true;
      const {data} =await axios.post(`${import.meta.env.VITE_BASE_URL}/logout`)
      if(data.success) {
        toast.success(data.message)
        navigate("/")
      }
      else toast.error(data.message)
    }catch(err){
      console.log(err)
    }
    
  }

  return (
    <>
      <div>Dashboard</div>
      <button onClick={handleLogout} className=' rounded-xl font-bold p-2 bg-red-600'>LOGOUT</button>
    </>
    
  )
}

export default Dashboard