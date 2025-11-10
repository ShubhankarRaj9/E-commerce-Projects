import React, { useState, useEffect } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import CreateProductModel from "../models/CreateProductModel";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import UpdateProductModel from "../models/UpdateProductModel";
import ViewProductModel from "../models/ViewProductModel";
import { toggleCreateProductModel, toggleUpdateProductModel, toggleViewProductModel } from "../store/slices/extraSlice";
import { deleteProduct, fetchAllProducts } from "../store/slices/productsSlice";

const Products = () => {
  const [maxPage,setMaxPage]= useState(null);
  const [selectedProduct,setSelectedProduct] = useState(null);
  const [page,setPage] = useState(1);
  const dispatch =useDispatch();
  const { user } = useSelector(state => state.auth);
  const {isViewProductModelOpened,isCreateProductModelOpened,isUpdateProductModelOpened} = useSelector((state)=>state.extra);
  const {loading,products,totalProducts,fetchingProducts} = useSelector((state)=>state.product);
  useEffect(()=>{
    dispatch(fetchAllProducts(page));
  },[dispatch,page]);
  useEffect(()=> { 
      if(totalProducts !== undefined) {
        const newMax = Math.ceil(totalProducts/10);
        setMaxPage(newMax||1);
      }
    },[totalProducts]);
  useEffect(()=>{
    if(maxPage && page > maxPage){ setPage(maxPage);}
    },[maxPage,page]);
  return <>
   <main className="p-\[10px\] pl-\[10px\] md:pl-\[17rem\] w-full">
    <div className="flex-1 md:p-6"><Header/>
      <h1 className="text-2xl font-bold">All Users</h1>
      <p className="text-sm text-gray-600 mb-6">Manage all your website users.</p>
      <div className="p-4 sm-p-8 bg-gray-50 min-h-screen">
        <div className={`overflow-x-auto rounded-lg ${fetchingProducts ? "p-10 shadow-none":` ${ products && products.length>0 && "shadow-lg"}`}`}>
          {
            fetchingProducts ? (<div className="w-40 h-40 mx-auto border-2 border-whtie border-t-transparent rounded-full animate-spin"/>):
           (
            products && products.length > 0 ?(
              <table className="min-w-full bg-white border border-gray-700"> 
              <thead className="bg-blur-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">Image</th>
                <th className="py-3 px-4 text-left">Title</th>
                <th className="py-3 px-4 text-left">Category</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Ratings</th>
                <th className="py-3 px-4 text-left">Stock</th>
                <th className="py-3 px-4 text-left">Price</th>
                <th className="py-3 px-4 text-left">Actions</th>
                
              </tr>
              </thead>
              <tbody>
                {
                  products.map((product,index)=>{
                    return(
                      <tr key={index} className="border-t hover:bg-gray-50"
                      onClick={()=>{setSelectedProduct(product),dispatch(toggleViewProductModel())
                      }}
                      >
                        <td className="py-3 px-4">
                            <img src={product?.images?.url} alt={product.name} className="w-10 h-10 rounded-md object-cover"/>
                        </td>
                        <td className="py-3 px-4">{product.name}</td>
                        <td className="py-3 px-4">{user.category}</td>
                        <td className="py-3 px-4">{product.price}</td>
                        <td className="py-3 px-4">{product.stock}</td>
                        <td className="py-3 px-4 text-yellow-500">{product.ratings}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <button className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-blue-gradient" onClick={(e)=>{
                          e.stopPropagation();
                          setSelectedProduct(product);
                          dispatch(toggleUpdateProductModel()) }}>Update
                          </button>
                          <button className="text-white rounded-md cursor-pointer px-3 py-2 font-semibold bg-red-gradient flex gap-2 items-center" onClick={(e)=>{
                          e.stopPropagation();
                          setSelectedProduct(product);
                          dispatch(deleteProduct(product.id,page))
                           }}>
                            
                         {
                         selectedProduct?.id === product.id && loading ? (
                          <>
                          
                          <LoaderCircle className="w-6 h-6 animate-spin" />
                          Deleting...
                          </>
                         ) : (
                          "Delete"
                         )
                         }
                          </button>
                          </td>
                      </tr>
                    )
                  })
                }
              </tbody>
              </table>
            ):(
              <h3 className="text-2xl p-6 font-bold"> No Products found.</h3>
             )
           )
          }
        </div>

          {
          !fetchingProducts && products.length > 0 && (
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
     <button onClick={()=> dispatch(toggleCreateProductModel())}
     className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p4 rounded-full shadow-lg z-50 transition-all duration-300" title="Create New Product">
      <Plus size={20}/>
     </button>
   </main>
   {isCreateProductModelOpened &&  <CreateProductModel/>}
   {isUpdateProductModelOpened &&  <UpdateProductModel selectedProduct={selectedProduct}/>}
   {isViewProductModelOpened &&  <ViewProductModel selectedProduct={selectedProduct}/>}
  </>;
};

export default Products;