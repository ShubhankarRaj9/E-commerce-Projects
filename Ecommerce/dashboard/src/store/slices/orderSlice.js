import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";
export const fetchAllOrders = createAsyncThunk("orders/fetchAll",
  async(_,thunkAPI)=>{
    try{
      const {data} = axiosInstance.get("/order/admin/getall");
      return data.orders;
    }catch(err){
      return thunkAPI.rejectWithValue(err.response?.data?.message ||"Failes to fetch orders");
    }
  },
);

export const updateOrderStatus = createAsyncThunk("orders/updateStatus",
  async({orderId,status},thunkAPI)=>{
    try{
      const {data} = axiosInstance.put(`/order/admin/update/${orderId}`,{status});
      toast.success(data.message || "Order status updated successfully");
      return data.updatedOrder;
    }catch(err){
      return thunkAPI.rejectWithValue(err.response?.data?.message ||"Failes to update orders status");
    }
  },
);

export const deleteOrder = createAsyncThunk("orders/delete",
  async(orderId,thunkAPI)=>{
    try{
      const {data} = axiosInstance.delete(`/order/admin/delete/${orderId}`);
      toast.success(data.message || "Order status updated successfully");
      return orderId;
    }catch(err){
      return thunkAPI.rejectWithValue(err.response?.data?.message ||"Failes to delete order");
    }
  },
);


const orderSlice = createSlice({
  name: "order",
  initialState: {
    loading: false,
    orders: [],
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAllOrders.pending, (state) => {
      state.loading = true;
  })
  .addCase(fetchAllOrders.fulfilled, (state,action) => {
      state.loading = false;
      state.orders = action.payload;
  })
  .addCase(fetchAllOrders.rejected, (state,action) => {
      state.loading = false;
      state.error= action.payload;
  })
  .addCase(updateOrderStatus.pending, (state) => {
      state.loading = true;
  })
  .addCase(updateOrderStatus.fulfilled, (state,action) => {
      state.loading = false;
      const idx = state.orders.findIndex(
        (order)=>order.id === action.payload.id
      );
      if(idx !== -1){
        state.orders[idx] ={
          ...state.orders[idx],...action.payload,
        }
      }
  })
  .addCase(updateOrderStatus.rejected, (state,action) => {
      state.loading = false;
      state.error= action.payload;
  })
  .addCase(deleteOrder.pending, (state) => {
      state.loading = true;
  })
  .addCase(deleteOrder.fulfilled, (state,action) => {
      state.loading = false;
      state.orders = state.orders.filter(
        (order)=>order.id !== action.payload
      );
  })
  .addCase(deleteOrder.rejected, (state,action) => {
      state.loading = false;
      state.error= action.payload;
  })

  }
});

export default orderSlice.reducer;