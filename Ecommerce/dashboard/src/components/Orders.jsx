import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Header from "./Header";
import { deleteOrder, fetchAllOrders, updateOrderStatus } from "../store/slices/orderSlice";

const Orders = () => {
  const statusArray =["All","Processing", "Shipped", "Delivered", "Cancelled"];
  const dispatch = useDispatch();
  const {orders,loading} = useSelector((state)=> state.order);
  const [selectedStatus,setSelectedStatus] = useState({});
  const [filterbyStatus,setFilterbyStatus] = useState("All");
  const [previewImage,setPreviewImage] = useState(null);
  const [deleteConfirm,setDeleteConfirm] = useState({
    open:false,id:null
  });

  useEffect(()=>{
    dispatch(fetchAllOrders());
  },[dispatch]);

  const handleStatusChange = (orderId,newStatus) => {
    setSelectedStatus(newStatus);
    dispatch(updateOrderStatus({orderId,status:newStatus}));
  };

  const filteredOrders = filterbyStatus==="All"? orders:orders?.filter(order => order.order_status ===filterbyStatus);
  const confirmDelete = () => {
    dispatch(deleteOrder(deleteConfirm.id));
    setDeleteConfirm({open:false,id:null});
  };
  if(loading) return <p className="p-10">Loading orders....</p>

  return <>
  <main className="p-\[10px\] pl-\[10px\] md:pl-\[17rem\] w-full">
    <div className="flex-1 md:p-6">
    <Header/>
    <h1 className="text-2xl font-bold">All Order</h1>
    <p className="text-sm text-gray-600 mb-6">Manage all your orders</p>
    </div>

    {/* Content */}
    {
   loading? (
    <div className="w-40 h-40 mx-auto border-2 border-whtie border-t-transparent rounded-full animate-spin"/>
    ): (
    <>
    {
      filteredOrders.length === 0 ? (
        <h3 className="text-2xl font-bold p-6">No Orders found.</h3>
      ):
      <>
        <div className="flex justify-between items-center p-6">
        <select className="p-2 border rounded shadow-sm" onChange={(e)=>setFilterbyStatus(e.target.value)}>
        {
          statusArray.map((status)=>{
            <option key={status}>{status}</option>
          })
        }
         </select>
        </div>
        {
          filteredOrders.map((order)=>{
            return(
              <div key={order.id} className="bg-white shadow-lg rounded-lg p-6 mb-6 transition-all">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div>
                    <p> <strong>Order ID:</strong>{order.id}</p>
                    <p> <strong>Status: </strong>{order.order_status}</p>
                    <p> <strong>Placed At:</strong>{""} {new Date(order.created_At).toLocaleString()}</p>
                    <p> <strong>Total Amount: </strong> $ {order.total_price}</p>
                  </div>
                  <div>
                    <select value={selectedStatus[order.id] || order.order_status} onChange={handleStatusChange(order.id , e.target.value)}
                    className="border p-2 rounded mb-2"
                    >
                      {statusArray.map((status)=>(<option key={status}>{status}</option>
                    ))} </select>

                    <button onClick={()=> setDeleteConfirm({open:true, id:order.id})}
                      className="ml-3 bg-red-500 hover:text-red-600 text-white px-3 placeholder-sky-100"
                      >
                        Delete Order
                      </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-1"> Shipping Info</h4>
                    <div>
                    <p> <strong>Name:</strong>{order.shipping_info?.full_name}</p>
                    <p> <strong>Phone: </strong>{order.shipping_info?.phone}</p>

                    <p> <strong>Address:</strong>{""} {order.shipping_info?.address},{""} {order.shipping_info?.city},{
                      order.shipping_info?.state
                    }{order.shipping_info?.pincode}</p> 
                  </div>


                </div>

                <div className="mt-4">
                  <h4 className="font-semibold text-lg mb-2">Ordered Items</h4>
                    {
                     Array.isArray(order.order_items) && order.order_items.map((item)=>{
                    return (
                       <div key={item.order_id} className="flex  items-center gap-4 mb-2 border-b pb-2">
                          {
                            item.images && (
                              <img src={item.images} alt ={item.title} className="w-16 h-16 object-cover cursor-pointer" onClick={(()=>setPreviewImage(item.image))}/>
                            )}
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="font-semibold">Qty:{item.quantity} | Price: ${item.price} | Total Price: ${item.quantity*item.price}</p>
                          </div>
                       </div>
                     );}) }
                </div>
              </div>
              );
              }) }
      </>
    }
     {/* IMAGE PREVIEW */}
     {
      previewImage && (
                  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-centerjustify-center z-50 " onClick={()=>setPreviewImage(null)}>
                    <img src={previewImage} alt="preview" className="max-w-\[90%\] max-h-\[90%\] rounded shadow-xl" />
                  </div>
         ) }
        {/* DELETE ORDER CONFORMATION */}
          {  
            deleteConfirm.open && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"  >
                    <div className="bg-white p-6 rounded shadow-lg text-center max-w-sm w-full">
                      <h3 className="text-lg font-semibold mb-4">Are you sure for delete the order.</h3>
                      <div className="flex justify-self-center gap-4">
                        <button onClick={confirmDelete} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Yes, Delete</button>
                        <button onClick={()=> setDeleteConfirm({open:false,id:null})} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>              
             )
           }
          </>)  
          }
   </main> 
  </>;
};

export default Orders;