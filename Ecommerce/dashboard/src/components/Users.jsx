import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import {deleteUser, fetchAllUsers} from "../store/slices/adminSlice";

const Users = () => {
  const [page,setPage] = useState(1);
  // const users = useSelector((state)=> state.admin);
  const {loading,users,totalUsers} = useSelector((state)=> state.admin);
  const dispatch = useDispatch();
  const [maxPage,setMaxPage] = useState(null);
  useEffect(()=>{
    dispatch(fetchAllUsers(page));
  },[dispatch,page]);
  useEffect(()=> { 
    if(totalUsers !== undefined) {
      const newMax = Math.ceil(totalUsers/10);
      setMaxPage(newMax||1);
    }
  },[totalUsers]);

  useEffect(()=>{
    if(maxPage && page > maxPage){
      setPage(maxPage);
    }
  },[maxPage,page]);

  const handleDeleteUSer = (id) => {
    if(totalUsers === 11){
      setMaxPage(1);
    }
    dispatch(deleteUser({id,page}));
  }
  return (<>
  <main className="p-\[10px\] pl-\[10px\] md:pl-\[17rem\] w-full">
      <div className="flex-1 md:p-6"><Header/>
      <h1 className="text-2xl font-bold">All Users</h1>
      <p className="text-sm text-gray-600 mb-6">Manage all your website users.</p>
      <div className="p-4 sm-p-8 bg-gray-50 min-h-screen">
        <div className={`overflow-x-auto rounded-lg ${loading ? "p-10 shadow-none":` ${ users && users.length>0 && "shadow-lg"}`}`}>
          {
            loading ? (<div className="w-40 h-40 mx-auto border-2 border-whtie border-t-transparent rounded-full animate-spin"/>):
           (
            users && users.length > 0 ?(
              <table className="min-w-full bg-white border border-gray-700"> 
              <thead className="bg-blur-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Avatar</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-left">Email</th>
                <th className="py-3 px-4 text-left">Registered On</th>
                <th className="py-3 px-4 text-left">Action</th>
              </tr>
              </thead>
              <tbody>
                {
                  users.map((user,index)=>{
                    return(
                      <tr key={index} className="border-t hover:bg-gray-50">
                        <td className="py-3 px-4">
                            <img src={user?.avatar?.url || "avatar"} alt={user?.name || "Avatar"} className="w-10 h-10 rounded-full object-cover"/>
                        </td>
                        <td className="py-3 px-4">{user.name}</td>
                        <td className="py-3 px-4">{user.email}</td>
                        <td className="py-3 px-4">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <button onClick={()=> handleDeleteUSer(user.id)} className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-red-gradient">
                              DELETE
                          </button>
                        </td>
                      </tr>
                    )
                  })
                }
              </tbody>
              </table>
            ):(
              <h3 className="text-2xl p-6 font-bold"> No Users found.</h3>
             )
           )
          }
        </div>

          {
          !loading && users.length > 0 && (
            <div className="flex justify-center mt-6 gap-4">
              <button onClick={()=> setPage((prev)=> Math.max(prev-1,1)) }
              disabled={page === 1}
              className="px-4 py-2 bg-blue-500 hover:bg-blur-600 text-white rounded disabled:opacity-50"
              >Previous</button>
              <span className="px-4 py-2 text-gray-700">Page {page}</span>
              <button onClick={()=> setPage((prev) => prev+1)}
              disabled={maxPage === page}
              className="px-4 py-2 bg-blue-500 hover:bg-blur-600 text-white rounded disabled:opacity-50">Next</button>
               </div>
          )
          
          }


      </div>
  </div>
  </main>
  
  
  </>);
};

export default Users;