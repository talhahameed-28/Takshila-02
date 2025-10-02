import React from 'react'
import axios from "axios"
import { useState,useRef,useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from "react-hot-toast"

const App = () => {
    const [loginstate, setloginstate] = useState("Signup")
    const username = useRef()
    const email = useRef()
    const password = useRef()
    const [loading, setLoading] = useState(false)
    const navigate=useNavigate()
    const location=useLocation()
    const submithandler=async(e)=>{
        try{
            setLoading(true)
            console.log("in")
            e.preventDefault()
            axios.defaults.withCredentials=true
            if(loginstate==="Signup"){
                const {data}=await axios.post(`${import.meta.env.VITE_BASE_URL}/register`,{username:username.current.value,email:email.current.value,password:password.current.value})
                console.log(data)
                if (data.success){
                navigate(`/verifyOTP`,
                    {state:{email:data.email}
                })
            }
                else{
                    toast.error(data.message[0])
                }
            }
            else if(loginstate==="Login"){
                const {data}=await axios.post(`${import.meta.env.VITE_BASE_URL}/login`,{email:email.current.value,password:password.current.value})
                console.log(data)
                if(data.success){
                    toast.success("Logging you in")
                    navigate("/dashboard")
                }
                else {
                    toast.error(data.message)
                }
            }
            setLoading(false)
        }catch(error){
            console.log(error.message)
        }
    }



    useEffect(() => {       
        email.current.value=""
        password.current.value=""    
    }, [loginstate])


    useEffect(()=>{
        setLoading(true)
        const checkLoggedIn=async()=>{
            axios.defaults.withCredentials=true
            const {data}=await axios.get(`${import.meta.env.VITE_BASE_URL}/api/auth/check`)
            console.log(data)
            setLoading(false)
            if(data.loggedIn) navigate("/dashboard")
        }
        checkLoggedIn()
    },[])
    
    if(loading && location.pathname=="/"){
        return ( <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent border-solid border-t-8 border-l-0 border-r-0 rounded-full animate-spin "></div>
          </div>)
    }
  return (
    
    <div className='h-screen w-full flex  justify-center items-center bg-gradient-to-br from-gray-100  to-gray-700 '>
        
   

        <div className='md:py-6 shadow-2xl border-1 md:h-fit w-full md:w-2/5 flex flex-col items-center bg-slate-800 gap-3 rounded-xl'>
            <div className='text-3xl font-bold'>SignUp or Register !</div>
        <p className='text-blue-700 font-semibold'>{loginstate==="Signup"?"Create":"Login to"} your account</p>
            <form onSubmit={submithandler} className='flex flex-col w-9/10 gap-3'>
                {loginstate==="Signup" && <input ref={username} required className="w-full bg-slate-500 rounded-full px-2" type="text" placeholder='Enter your username' name='username'/>}
                <input ref={email} required className="w-full bg-slate-500 rounded-full px-2" type="email" placeholder='Enter email ID' name='email '/>
                <input ref={password} required className="w-full bg-slate-500 rounded-full px-2" type="password" placeholder='Enter password' name='password'/>
                <input type="submit" value={loginstate==="Login"?"Login":"Signup"} className='w-1/3 rounded-full py-2 font-bold bg-blue-800 hover:bg-blue-500 cursor-pointer transition transition-400'/>
            </form>
            
            {loginstate==="Signup" && <p className="font-semibold text-white">Already have an account? <span onClick={()=>setloginstate("Login")} className='underline text-blue-500 cursor-pointer'>LogIn</span></p>}
            {loginstate==="Login" && <p className="font-semibold text-white">Dont have an account? <span onClick={()=>setloginstate("Signup")} className='underline text-blue-500 cursor-pointer'>SignUp</span></p>}
        </div>
    </div>
  )
}

export default App