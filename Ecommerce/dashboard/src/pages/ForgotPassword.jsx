import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, Navigate } from "react-router-dom";
import { forgotPassword } from "../store/slices/authSlice";

const ForgotPassword = () => {
  const [email,setEmail] = useState("");
  const dispatch = useDispatch();
  const handleSubmit = (e)=>{
    e.preventDefault();
    const formData = new FormData();
    formData.append("email",email);
    dispatch(forgotPassword(formData));
    setEmail("");
  };
   const {user , isAuthenticated,loading} = useSelector(state => state.auth);
  if(isAuthenticated &&user.role ==="admin"){
    return <Navigate to="/"/>
  }
  return <>
      
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-right from-blue-100 to-purple-200 px-4">
  <div className="bg-white shadow-lg rounded 2xl max-w-md w-full p-8 sm:p-10">
      <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
        Forgot Password
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">

      <div className="p-2">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
        Email Address
        </label>
        <input type="email" name="email" value={email} onChange={(e)=> setEmail(e.target.value)}
        required placeholder="example@gmail.com" 
        className="w-full px-4 py-3 border-gray-300 rounded-xl"
        />
      </div>
      <div className="px-2 ">
        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-all ">
        { loading ?(
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/> 
            <span className="">Requesting For email</span>
          </>
          ) :( "Send Reset Link")
        }
       </button>
    </div>
  </form>
  </div>
  </div>
</>;
};

export default ForgotPassword;