import {createSlice,createAsyncThunk} from '@reduxjs/toolkit';
import {axiosInstance} from '../../lib/axios';
import {toggleAuthPopup} from './popupSlice';
import {toast} from 'react-toastify';

export const register = createAsyncThunk(
    'auth/register',async(data,thunkAPI) => {
        try{
            const  res = await axiosInstance.post('/auth/register',data);
            toast.success(res.data.message);
            thunkAPI.dispatch(toggleAuthPopup());
            return res.data.user;
        }catch(err){
            toast.error(err.response?.data?.message || "something went wrong!");
            return thunkAPI.rejectWithValue(err.response?.data?.message);
        }
    }
);
export const login = createAsyncThunk(
    'auth/login',async(data,thunkAPI) => {
        try{
            const  res = await axiosInstance.post('/auth/login',data);
            toast.success(res.data.message);
            thunkAPI.dispatch(toggleAuthPopup());
            return res.data.user;
        }catch(err){
            toast.error(err.response?.data?.message);
            return thunkAPI.rejectWithValue(err.response?.data?.message);
        }
    }
);
export const getUser = createAsyncThunk(
    'auth/me',async(_,thunkAPI) => {
         try{
            const  res = await axiosInstance.get('/auth/me');
            return res.data.user;
        }catch(err){
            return thunkAPI.rejectWithValue(err.response?.data?.message||"failed to get user");
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',async(_,thunkAPI) => {
        try{
            const  res = await axiosInstance.get('/auth/logout');
            thunkAPI.dispatch(toggleAuthPopup());
            return null;
        }catch(err){
            toast.error(err.response?.data?.message);
            return thunkAPI.rejectWithValue(err.response?.data?.message||"failed to logout");
        }
    }
);


export const forgotPassword = createAsyncThunk(
    'auth/forgot',async(email,thunkAPI) => {
        try{
            const  res = await axiosInstance.post('/auth/password/forgot?frontendUrl=http://localhost:5173',email);
            toast.success(res.data.message);
            return null;
        }catch(err){
            toast.error(err.response?.data?.message);
            return thunkAPI.rejectWithValue(err.response?.data?.message);
        }
    }
);

export const resetPassword = createAsyncThunk(
    'auth/resetPassword',async({token,password,confirmPassword},thunkAPI) => {
        try{
            const  res = await axiosInstance.put(`/auth/password/reset/${token}`,{password,confirmPassword});
            toast.success(res.data.message);
            return res.data.user;
        }catch(err){
            toast.error(err.response?.data?.message||"something went wrong!");
            return thunkAPI.rejectWithValue(err.response?.data?.message);
        }
    }
);

export const updatePassword = createAsyncThunk(
    'auth/updatePassword',async(data,thunkAPI) => {
        try{
            const  res = await axiosInstance.put(`/auth/password/update`,data);
            toast.success(res.data.message);
            return null;
        }catch(err){
            toast.error(err.response?.data?.message||"something went wrong!");
            return thunkAPI.rejectWithValue(err.response?.data?.message);
        }
    }
);

export const updateProfile = createAsyncThunk(
    'auth/profile/update',async(data,thunkAPI) => {
        try{
            const  res = await axiosInstance.put(`/auth/profile/update`,data);
            toast.success(res.data.message);
            return res.data.user;
        }catch(err){
            toast.error(err.response?.data?.message||"something went wrong!");
            return thunkAPI.rejectWithValue(err.response?.data?.message);
        }
    }
);

const authSlice = createSlice({
    name:"auth",
    initialState:{
        authUser:null,
        isSigningUp:false,
        isSigningIn:false,
        isUpdatingProfile:false,
        isUpdatingPassword:false,
        isRequestingForToken:false,
        isCheckingAuth:true,
    },
    extraReducers:(builder) => {
        builder
        .addCase(register.pending,(state)=> {state.isSigningUp = true})
        .addCase(register.fulfilled,(state,action)=> {
            state.isSigningUp = false;
            state.authUser = action.payload;
        })
        .addCase(register.rejected,(state)=> {
            state.isSigningUp = false;
        })
        .addCase(login.pending,(state)=> {state.isSigningIn = true})
        .addCase(login.fulfilled,(state,action)=> {
            state.isSigningIn = false;
            state.authUser = action.payload;
        })
        .addCase(login.rejected,(state)=> {
            state.isSigningIn = false;
        })
        .addCase(getUser.pending,(state,action)=> {
            state.isCheckingAuth = true;
            state.authUser = null;
        })
        .addCase(getUser.fulfilled,(state,action)=> {
            state.isCheckingAuth = false;
            state.authUser = action.payload;
        })
        .addCase(getUser.rejected,(state,action)=> {
            state.isCheckingAuth = false;
            state.authUser = null;
        })
        .addCase(logout.fulfilled,(state,action)=> {
            state.authUser = null;
        })
        .addCase(logout.rejected,(state,action)=> {
            state.authUser = state.authUser;
        })
        .addCase(forgotPassword.pending,(state)=> {state.isRequestingForToken = true;})
        .addCase(forgotPassword.fulfilled,(state)=> {state.isRequestingForToken = false;})
        .addCase(forgotPassword.rejected,(state)=> {state.isRequestingForToken=false;})

        .addCase(resetPassword.pending,(state)=> {state.isUpdatingPassword = true;})
        .addCase(resetPassword.fulfilled,(state,action)=> {
            state.isUpdatingPassword = false;
            state.authUser = action.payload;
        })
        .addCase(resetPassword.rejected,(state)=> {state.isUpdatingPassword=false;})

        .addCase(updatePassword.pending,(state)=> {state.isUpdatingPassword = true;})
        .addCase(updatePassword.fulfilled,(state)=> {state.isUpdatingPassword = false;})
        .addCase(updatePassword.rejected,(state)=> {state.isUpdatingPassword=false;})

        .addCase(updateProfile.pending,(state)=> {state.isUpdatingProfile = true;})
        .addCase(updateProfile.fulfilled,(state,action)=> {
            state.isUpdatingProfile = false;
            state.authUser = action.payload;
        })
        .addCase(updateProfile.rejected,(state)=> {state.isUpdatingProfile=false;})

        
    },
});
export default authSlice.reducer;