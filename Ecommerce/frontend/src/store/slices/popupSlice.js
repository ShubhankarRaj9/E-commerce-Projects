import { createSlice } from "@reduxjs/toolkit";

const popupSlice = createSlice({
    name:"popup",
    initialState:{
        isAuthPopupOpen:false,
        isSideBarOpen:false,
        isSearchBarOpen:false,
        isCartOpen:false,
        isAIPopupOpen:false,
    },
    reducers:{
        toggleAuthPopup(state){state.isAuthPopupOpen = !state.isAuthPopupOpen;},
        toggleSidebar(state){state.isSideBarOpen = !state.isSideBarOpen;},
        toggleSearchBar(state){state.isSearchBarOpen = !state.isSearchBarOpen;},
        toggleCart(state){state.isCartOpen = !state.isCartOpen;},
        toggleAIModel(state){state.isAIPopupOpen = !state.isAIPopupOpen;
        },
    }
});
export const {
    toggleAuthPopup,toggleSidebar,toggleSearchBar,toggleCart,toggleAIModel
} = popupSlice.actions;
export default popupSlice.reducer;