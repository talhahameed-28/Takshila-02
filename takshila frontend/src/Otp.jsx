import React, { useEffect, useRef } from 'react'
import App from './App'
import axios from 'axios'
import { useNavigate,useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'

const Otp = () => {
    const otpInput = useRef()
    const navigate= useNavigate()
    const location=useLocation()
    const email=location.state?.email
    useEffect(() => {
      if(!email) navigate("/")    
    }, [])
    
    const submitOTP=async(e)=>{
        try{
            if(otpInput.current.value.length!=6) toast.error("Enter 6 digit otp")
            else {
                axios.defaults.withCredentials=true           
                const {data}=await axios.post(`${import.meta.env.VITE_BASE_URL}/verifyOTP`,{otp:otpInput.current.value,email})
                console.log(data)
                if(data.success){
                    toast.success("Logging you in")
                    navigate("/dashboard")
                }else{
                    toast.error(data.message)
                }
            }
        }catch(err){
            console.log('hryre')
            toast.error(err.response.data.message)
            console.log(err)
        }

    }

  return (
    <>
        <div className='absolute w-screen flex items-center justify-center h-screen backdrop-blur-md'>
            <div className='h-1/2 md:h-3/10 w-1/2 bg-slate-400 p-2 flex flex-col gap-4 rounded-xl'>
                <div className='font-bold text-2xl'>Enter OTP sent to your Email</div>
                <input ref={otpInput} className='w-full outline-0 border-1' type="text" placeholder='Enter OTP' />
                <button onClick={submitOTP} className='cursor-pointer md:w-1/5 bg-blue-600 font-bold py-1 px-3 rounded-xl shadow-lg' >VERIFY</button>
            </div>
        </div>
        <App></App>
    </>
)
}

export default Otp