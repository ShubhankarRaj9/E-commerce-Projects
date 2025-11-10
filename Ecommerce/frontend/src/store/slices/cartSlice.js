import { createSlice } from "@reduxjs/toolkit";
const cartSlice = createSlice({
    name:"cart",
    initialState:{
        cart:[],
    },reducers:{
        addToCart(state,action){
            const {product,quantity} = action.payload;
            if (!product || (!product._id && !product.id && !product.product_id)) return ;
            const productId = product._id || product.id || product.product_id;
            const existingItem = state.cart.find(item => item.product._id === productId);
            if(existingItem){
                existingItem.quantity += quantity;
            }else{
                state.cart.push({product,quantity});
            }
        },
        removeFromCart(state,action){
            state.cart = state.cart.filter(item => {
            const productId = item.product._id || item.product.id || item.product.product_id;
            return productId !== action.payload;
  });
        },
        updateCartQuantity(state,action){
        const { id, quantity } = action.payload;
        const item = state.cart.find(item => {
        const productId = item.product._id || item.product.id || item.product.product_id;
        return productId === id;} );
            if(item) item.quantity = quantity;
        },
        clearCart(state) {
            state.cart = [];
        }
    },
})

export const {addToCart,removeFromCart,updateCartQuantity,clearCart} = cartSlice.actions;

export default cartSlice.reducer;