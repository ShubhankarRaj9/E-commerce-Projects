import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import {axiosInstance} from '../../lib/axios';
import {toast} from 'react-toastify';
import { act } from 'react';
import { useSelector } from 'react-redux';
import { toggleAIModel } from "../slices/popupSlice"; 


export const fetchAllProducts = createAsyncThunk("/product/fetch",
    async ({
        availability="", price="0-100000", category="", ratings="", search="",page=1,
    }, thunkAPI) => {
            try{
                const params = new URLSearchParams();
                if(category)params.append("category",category);
                if(price)params.append("price",price);
                if(search)params.append("search",search);
                if(ratings)params.append("ratings",ratings);
                if(availability)params.append("availability",availability);
                if(page)params.append("page",page);
                const res = await axiosInstance.get(`/product?${params.toString()}`);
                return res.data;
            }
            catch(e){
                return thunkAPI.rejectWithValue(e.response?.data?.message); 
            }
    }
)

export const fetchProductDetails = createAsyncThunk("/product/productDetails",
    async(id, thunkAPI) => {
        try{
            const res = await axiosInstance.get(
            `/product/singleProduct/${id}`);
            return res.data.product;
        }catch(e){
            return thunkAPI.rejectWithValue(e.response?.data?.message);
        }
    }
)

export const postReview = createAsyncThunk("/product/productReview",
    async({productID,review}, thunkAPI) => {
        const state = thunkAPI.getState();
        const authUser = state.auth.authUser;
        try{
            const res = await axiosInstance.put(
            `/product/post-new/review/${productID}`, review);
            toast.success(res.data.message);
            return {
                review:res.data.review,
                authUser,
            };
        }catch(e){
            toast.error(e.response?.data?.message || "failed to post review")
            return thunkAPI.rejectWithValue(e.response?.data?.message || "failed to post review");
        }
    }
)


export const deleteReview = createAsyncThunk("/product/deleteReview",
    async({productID,reviewID}, thunkAPI) => {
        try{
            const res = await axiosInstance.delete(
            `/product/delete/review/${productID}`);
            toast.success(res.data.message);
            return reviewID;
        }catch(e){
            toast.error(e.response?.data?.message || "failed to delete review")
            return thunkAPI.rejectWithValue(e.response?.data?.message||"failed to delete review");
        }
    }
)
export const fetchProductWithAI = createAsyncThunk("/product/productDetailswithAISearch",
    async({userPrompt}, thunkAPI) => {
        try{
            const res = await axiosInstance.post(
            `/product/ai-search`,{userPrompt});
            thunkAPI.dispatch(toggleAIModel());
            return res.data;
        }catch(e){
            toast.error(e.response?.data?.message || "failed to fetch ai filtered products")
            return thunkAPI.rejectWithValue(e.response?.data?.message);
        }
    }
);
const productSlice = createSlice({
    name:"product",
    initialState:{
        loading:false,
        products:[],
        productDetails:{},
        totalProducts:0,
        topRatedProducts:[],
        newProducts:[],
        aiSearching:false,
        isReviewDeleting:false,
        productReviews:[],
    },
    extraReducers:(builder) =>{
        builder
        .addCase(fetchAllProducts.pending,(state)=>{
            state.loading = true;
        })
        .addCase(fetchAllProducts.fulfilled,(state,action)=>{
            state.loading = false;
            state.products = action.payload.products;
            state.newProducts = action.payload.newProducts;
            state.topRatedProducts=action.payload.topRatedProducts;
            state.totalProducts = action.payload.totalProducts;
        })
        .addCase(fetchAllProducts.rejected,(state)=>{
            state.loading = false;
        })
        .addCase(fetchProductDetails.pending,(state)=>{
            state.loading = true;
        })
        .addCase(fetchProductDetails.fulfilled,(state,action)=>{
            state.loading = false;
            state.productDetails = action.payload;
            state.productReviews = action.payload.productReviews;
        })
        .addCase(fetchProductDetails.rejected,(state)=>{
            state.loading = false;
        })
        .addCase(postReview.pending,(state)=>{
            state.isPostingReview = true;
        })
        .addCase(postReview.fulfilled,(state,action)=>{
            state.isPostingReview = false;
            const newReview = action.payload.review;
            const authUser = action.payload.authUser;

            const existingReviewIdx = state.productReviews.findIndex(rev => rev.reviewer?.id === newReview.userID)
            if(existingReviewIdx !== -1) {
                state.productReviews[existingReviewIdx].ratings  = Number(newReview.ratings);
                state.productReviews[existingReviewIdx].comment  = (newReview.comment); 
            }
            else{
                state.productReviews = [{...newReview,
                    reviewer:{
                        id:authUser?.id,
                        name:authUser?.name,
                        avatar:authUser?.avatar?.url,
                    }
                },...state.productReviews,
                ]
            }
        })
        .addCase(postReview.rejected,(state)=>{
            state.isPostingReview = false;
        })
        .addCase(deleteReview.pending,(state)=>{
            state.isReviewDeleting = true;
        })
        .addCase(deleteReview.fulfilled,(state,action)=>{
            state.isReviewDeleting = false;
            state.productReviews = action.productReviews.filter(review => review.review_id !==action.payload);
        })
        .addCase(deleteReview.rejected,(state)=>{
            state.isReviewDeleting = false;
        })
        .addCase(fetchProductWithAI.pending,(state)=>{
            state.aiSearching = true;
        })
        .addCase(fetchProductWithAI.fulfilled,(state,action)=>{
            state.aiSearching = false;
            const products = action.payload.filteredProducts || [];
            state.products = products;
            state.totalProducts = products.length;
        })
        .addCase(fetchProductWithAI.rejected,(state)=>{
            state.aiSearching = false;
        })
    },
})

export default productSlice.reducer;