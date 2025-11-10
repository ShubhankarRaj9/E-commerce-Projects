import {createSlice} from "@reduxjs/toolkit";
import {axiosInstance} from '../../lib/axios';
import {toast} from "react-toastify";
const authSlice = createSlice({
    name:"auth",
    initialState:{
        loading:false,
        user:null,
        isAuthenticated:false,
    },
    reducers:{
        loginRequest(state){
            state.loading = true;
        },
        loginSuccess(state,action){
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        loginFailed(state){
             state.loading = false;
        },
        getUserRequest(state){
            state.loading = true;
        },
        getUserSuccess(state,action){
            state.loading = false;
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        getUserFailed(state){
             state.loading = false;
             state.user = null;
        },
        logoutRequest(state){
            state.loading = true;
        },
        logoutSuccess(state){
            state.loading = false;
            state.user = null;
            state.isAuthenticated = false;
        },
        logoutFailed(state){
             state.loading = false;
        },
        forgotPasswordRequest(state){
            state.loading = true;
        },
        forgotPasswordSuccess(state){
            state.loading = false;
        },
        forgotPasswordFailed(state){
             state.loading = false;
        },
        resetPasswordRequest(state){
            state.loading = true;
        },
        resetPasswordSuccess(state,action){
            state.loading = false;
            state.isAuthenticated = false;
            state.user = action.payload;
        },
        resetPasswordFailed(state){
             state.loading = false;
        },
        updateProfileRequest(state){
            state.loading = true;
        },
        updateProfileSuccess(state,action){
            state.loading = false;
            state.user = action.payload;
        },
        updateProfileFailed(state){
             state.loading = false;
        },
        updatePasswordRequest(state){
            state.loading = true;
        },
        updatePasswordSuccess(state,action){
            state.loading = false;
        },
        updatePasswordFailed(state){
             state.loading = false;
        },
        resetAuthSlice(state) {
            state.loading = false;
            state.user = state.user;
            state.isAuthenticated = state.isAuthenticated;
        }
    }
});

export const login = (data) => async(dispatch) =>{
   dispatch(authSlice.actions.loginRequest());
   try{
    await axiosInstance.post("/auth/login",data).then((res) => {
        if(res.data.user.role === "admin"){
            dispatch(authSlice.actions.loginSuccess(res.data.user));
            toast.success(res.data.message);
        }
        else{
            dispatch(authSlice.actions.loginFailed());
            toast.error(res.data.message);
        }
    })
   }catch(err) {
       dispatch(authSlice.actions.loginFailed());
        toast.error(err.response?.data?.message || "Login Failed");
   }
}
export const getUser = (data) => async(dispatch) =>{
     dispatch(authSlice.actions.getUserRequest());
     try{
         await axiosInstance.get("/auth/me",).then((res)=>{
        dispatch(authSlice.actions.getUserSuccess(res.data.user));
            toast.success(res.data.message);
      } )
     }catch(err){
         dispatch(authSlice.actions.getUserFailed());
        toast.error(err.response?.data?.message || "fetching user Failed");
     }
}
export const logout = (data) => async(dispatch) =>{
     dispatch(authSlice.actions.logoutRequest());
     try{
         await axiosInstance.get("/auth/logout").then((res)=>{
        dispatch(authSlice.actions.logoutSuccess());
        toast.success(res.data.message);
        dispatch(authSlice.actions.resetAuthSlice());
      });
     }catch(err){
         dispatch(authSlice.actions.getUserFailed());
        toast.error(err.response?.data?.message || "failed to logout");
        dispatch(authSlice.actions.resetAuthSlice());
     }
};

export const forgotPassword = (email) => async(dispatch) =>{
     dispatch(authSlice.actions.forgotPasswordRequest());
     try{
         await axiosInstance.post("/auth/password/forgot?frontendUrl=http://localhost:5173",email).then((res)=>{
        dispatch(authSlice.actions.forgotPasswordSuccess());
        toast.success(res.data.message);
      });
     }catch(err){
         dispatch(authSlice.actions.forgotPasswordFailed());
        toast.error(err.response?.data?.message || "failed to receieve mail");
     }
};


export const resetPassword = ({token,data}) => async(dispatch) =>{
     dispatch(authSlice.actions.resetPasswordRequest());
     try{
         await axiosInstance.put(`/auth/password/reset/${token}`,data).then((res)=>{
        dispatch(authSlice.actions.resetPasswordSuccess(res.data.user));
        toast.success(res.data.message);
      });
     }catch(err){
         dispatch(authSlice.actions.resetPasswordFailed());
        toast.error(err.response?.data?.message || "failed to reset Password. ");
     }
};

export const updateAdminProfile = (data) => async(dispatch) =>{
     dispatch(authSlice.actions.updateProfileRequest());
     try{
         await axiosInstance.put(`/auth/profile/update`,data).then((res)=>{
        dispatch(authSlice.actions.updateProfileSuccess(res.data.user));
        toast.success(res.data.message);
      });
     }catch(err){
         dispatch(authSlice.actions.updateProfileFailed());
        toast.error(err.response?.data?.message || "failed to update Profile. ");
     }
};


export const updateAdminPassword = (newData) => async(dispatch) =>{
     dispatch(authSlice.actions.updatePasswordRequest());
     try{
         await axiosInstance.put(`/auth/password/update`,newData).then((res)=>{
        dispatch(authSlice.actions.updatePasswordSuccess(res.data));
        toast.success(res.data.message);
      });
     }catch(err){
         dispatch(authSlice.actions.resetPasswordFailed());
        toast.error(err.response?.data?.message || "failed to update Password. ");
     }
};

export const resetAuthSlice = () =>  (dispatch)=>{
    dispatch(authSlice.actions.resetAuthSlice());

}


export default authSlice.reducer;