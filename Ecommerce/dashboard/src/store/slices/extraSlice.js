import { createSlice } from "@reduxjs/toolkit";

const extraSlice = createSlice({
  name: "extra",
  initialState: {
    openedComponent: "Dashboard",
    isNavbarOpened: false,
    isViewProductModelOpened: false,
    isCreateProductModelOpened: false,
    isUpdateProductModelOpened: false,
  },
  reducers: {
    toggleComponent: (state,action)=>{
      state.openedComponent = action.payload;
    },
    toggleNavbar: (state)=>{
      state.isNavbarOpened = !state.isNavbarOpened;
    },
    toggleCreateProductModel: (state)=>{
      state.isCreateProductModelOpened = !state.isCreateProductModelOpened
    },
    toggleViewProductModel: (state)=>{
      state.isViewProductModelOpened = !state.isViewProductModelOpened
    },
    toggleUpdateProductModel: (state)=>{
       state.isUpdateProductModelOpened = !state.isUpdateProductModelOpened
    },
  },
});

export const {
  toggleComponent,toggleCreateProductModel,toggleNavbar,toggleUpdateProductModel,toggleViewProductModel
} = extraSlice.actions;

export default extraSlice.reducer;