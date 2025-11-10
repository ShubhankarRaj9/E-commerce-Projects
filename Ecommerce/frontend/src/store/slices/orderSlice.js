import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { axiosInstance } from '../../lib/axios';
import { toast } from 'react-toastify';


export const fetchRazorpayKey = createAsyncThunk(
    "order/fetch-razorpay-key",
    async (_, thunkAPI) => {
        try {
            const response = await axiosInstance.get("/payment/key");
            return response.data.key;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || "Failed to fetch payment key");
        }
    }
);
export const fetchMyOrders = createAsyncThunk("order/orders/me",
    async (_, thunkAPI) => {
        try {
            const res = await axiosInstance.get("/order/orders/me");
            return res.data.myOrders;
        } catch (e) {
            return thunkAPI.rejectWithValue(e.response.data.message);
        }
    }
)

export const placeOrders = createAsyncThunk("order/place-order",
    async (data, thunkAPI) => {
        try {
            const res = await axiosInstance.post("/order/new", data);
            const razorpayKey = await fetchRazorpayKey();
            toast.success(res.data.message);
            return { ...res.data, razorpay_key: razorpayKey };
        } catch (e) {
            toast.error(e.response.data.message || "Failed to place order. try again.")
            return thunkAPI.rejectWithValue(e.response.data.message);
        }
    }
)


const orderSlice = createSlice({
    name: "order",
    initialState: {
        myOrders: [],
        fetchingOrders: false,
        placingOrder: false,
        finalPrice: null,
        orderStep: 1,
        paymentIntent: "",
        orderData: null,
    },
    reducers: {
        toggleOrderStep(state) {
            state.orderStep = state.orderStep === 1 ? 2 : 1;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchMyOrders.pending, (state) => {
            state.fetchingOrders = true;
        })
            .addCase(fetchMyOrders.fulfilled, (state, action) => {
                state.fetchingOrders = false;
                state.myOrders = action.payload;
            })
            .addCase(fetchMyOrders.rejected, (state) => {
                state.fetchingOrders = false;
            })
            .addCase(placeOrders.pending, (state) => {
                state.placingOrder = true;
            })
            .addCase(placeOrders.fulfilled, (state, action) => {
                state.placingOrder = false;
                state.finalPrice = action.payload.total_price;
                state.paymentIntent = action.payload.razorpay_order_id;
                state.orderStep = 2;
                state.orderData = {
                    key: action.payload.razorpay_key,
                    order_id: action.payload.razorpay_order_id,
                    amount: action.payload.total_price * 100,
                    currency: "INR",

                }
            })
            .addCase(placeOrders.rejected, (state) => {
                state.placingOrder = false;
            })
    },
});
export default orderSlice.reducer;
export const {
    toggleOrderStep
} = orderSlice.actions;