import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import PaymentForm from "../components/PaymentForm";
import { placeOrders } from "../store/slices/orderSlice";
import { loadRazorPay } from "../lib/loadRazoryPay.js";


const Payment = () => {
  const { authUser } = useSelector((state) => state.auth);
  const navigateTo = useNavigate();
  
  // ⭐ FIX 1: Correctly destructure orderData and orderStep from state.order
  const { orderData, orderStep, placingOrder } = useSelector((state) => state.order); 

  const [razorPayPromise, setRazorPayPromise] = useState(null);
  const dispatch = useDispatch();
 useEffect(() => {
    // Load the Razorpay SDK script and set the Promise
    loadRazorPay().then((razorpay) => setRazorPayPromise(razorpay)).catch((err) => console.error("Razorpay load error:", err));
  }, []);

  
  // Note: orderStep is now correctly accessed as a primitive number: `orderStep`

  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    state: "",
    phone: "",
    address: "",
    city: "",
    zipcode: "",
    country: "",
  });
const { cart } = useSelector((state) => state.cart);
  const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  let totalWithTax = total + total * 0.008; // Calculating tax
  
  // Shipping logic
  if (total <= 50) { // Assuming free shipping for total > $50, so charge if total is $50 or less
    totalWithTax += 2;
  }


  useEffect(() => {
    if (!authUser) navigateTo("/products");
  }, [authUser, navigateTo]);

 

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("full_name", shippingDetails.fullName);
    formData.append("state", shippingDetails.state);
    formData.append("phone", shippingDetails.phone);
    formData.append("address", shippingDetails.address);
    formData.append("city", shippingDetails.city);
    formData.append("zipcode", shippingDetails.zipcode);
    formData.append("country", shippingDetails.country);
    
    // Add logic to ensure the total price sent to the backend matches the calculated totalWithTax
    formData.append("total_price", totalWithTax.toFixed(2)); 
    
    formData.append("orderedItems", JSON.stringify(cart));
    
    dispatch(placeOrders(formData));
  };
  
  // Show message if cart is empty
  if (!cart || cart.length === 0) {
    return <div className="min-h-screen pt-20 flex items-center justify-center">
      <div className="text-center glass-panel max-w-md">
        <h1>
          No Items in Cart
        </h1>
        <p className="text-muted-foreground mb-8">Add some items to your cart before proceeding to checkout.</p>
        <Link to={"/products"} className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg text-primary-foreground gradient-primary hover:glow-on-hover animate-smooth font-semibold">
          <span>Browse Products.</span></Link>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-8">
            <Link to={"/cart"} className="p-2 glass-card hover:glow-on-hover animate-smooth">
              <ArrowLeft className="w-5 h-5 text-primary" />
            </Link>
          </div>
          {/* Progress Step */}
          <div className="flex items-center justify-center mb-12">
            <div className="flex items-center space-x-4">
              {/* Step - 1 */}
              <div className={`flex items-center space-x-2 ${orderStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  orderStep >= 1 ? "gradient-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  {
                    orderStep > 1 ? <Check className="w-5 h-5" /> : "1"
                  }
                </div>
                <span className="font-medium">Details</span>
              </div>
              <div className={`w-12 h-0 ${orderStep >= 2 ? "bg-primary" : "bg-border"}`}
              />
              {/* Step - 2 */}
              <div className={`flex items-center space-x-2 ${orderStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  orderStep >= 2 ? "gradient-primary text-primary-foreground" : "bg-secondary"
                }`}>
                  2
                </div>
                <span className="font-medium">Payment</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {
                orderStep === 1 ? (
                  <form onSubmit={handlePlaceOrder} className="glass-panel">
                    <h2 className="text-xl font-semibold text-foreground mb-6">Shipping Information...</h2>
                    <div className="mb-6">
                      <div > <label className="block text-sm font-medium text-foreground mb-2">
                        Full Name</label>
                        <input type="text" required value={shippingDetails.fullName} onChange={(e) => {
                          setShippingDetails({
                            ...shippingDetails,
                            fullName: e.target.value
                          });
                        }} className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          State</label>
                        <select value={shippingDetails.state} onChange={(e) => {
                          setShippingDetails({
                            ...shippingDetails,
                            state: e.target.value
                          })
                        }} className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground">
                          <option value="">Select State</option>
                          <option value="Delhi">Delhi</option>
                          <option value="Banglore">Banglore</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Pune">Pune</option>
                          <option value="Hyderabad">Hyderabad</option>
                          <option value="TamilNadu">TamilNadu</option>
                          <option value="Uttrakhand">Uttrakhand</option>
                          <option value="Andhra Pradesh">Andhra Pradesh</option>
                        </select>
                      </div>
                      <div >
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Phone * </label>
                        <input type="text" required value={shippingDetails.phone} onChange={(e) => {
                          setShippingDetails({
                            ...shippingDetails,
                            phone: e.target.value
                          });
                        }} className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <div >
                        <label className="block text-sm font-medium text-foreground mb-2"> Address</label>
                        <input type="text" required value={shippingDetails.address} onChange={(e) => {
                          setShippingDetails({
                            ...shippingDetails,
                            address: e.target.value
                          });
                        }} className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div >
                        <label className="block text-sm font-medium text-foreground mb-2">
                          City</label>
                        {/* ⭐ FIX 2: Added options to the City select field */}
                        <select value={shippingDetails.city} onChange={(e) => {
                          setShippingDetails({
                            ...shippingDetails,
                            city: e.target.value
                          })
                        }} className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground">
                          <option value="">Select City</option>
                          <option value="New Delhi">New Delhi</option>
                          <option value="Bengaluru">Bengaluru</option>
                          <option value="Mumbai">Mumbai</option>
                          <option value="Chennai">Chennai</option>
                        </select>
                      </div>

                      <div > <label className="block text-sm font-medium text-foreground mb-2">
                        Zip Code * </label>
                        <input type="text" required value={shippingDetails.zipcode} onChange={(e) => {
                          setShippingDetails({
                            ...shippingDetails,
                            zipcode: e.target.value
                          });
                        }} className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <div > <label className="block text-sm font-medium text-foreground mb-2">
                        Country</label>
                        <select value={shippingDetails.country} onChange={(e) => {
                          setShippingDetails({
                            ...shippingDetails,
                            country: e.target.value
                          })
                        }} className="w-full px-4 py-3 bg-secondary border border-border rounded-lg text-foreground">
                          <option value="India">INDIA</option>
                        </select>
                      </div>
                    </div>
                    <button type="submit" disabled={placingOrder} className={`w-full py-3 ${placingOrder ? 'bg-gray-500' : 'gradient-primary'} text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-semibold`}>
                      {placingOrder ? 'Processing...' : 'Continue to Payment'}
                    </button>
                  </form>
                ) : (
                  <>
                    {razorPayPromise && orderData && authUser && (
                      <PaymentForm razorpay={razorPayPromise} orderData={orderData} />
                    )}
                    {orderStep === 2 && (!orderData || !orderData.order_id) && (
                            <div className="glass-panel text-center">
                                <p className="text-destructive font-semibold">
                                    Error: Payment details not received from server.
                                </p>
                            </div>
                        )}
                  </>)}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="glass-panel sticky top-24">
                <h2 className="text-xl font-semibold text-foreground">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  {
                    cart.map((item) => {
                      return (
                        <div key={item.product._id}
                          className="flex items-center space-x-3">
                          <img src={item.product?.images?.[0]?.URL} alt={item.product.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground">Qty:{item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold">${(Number(item.product.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      )
                    })}
                </div>

                <div className="space-y-2 border-t border-[hsla(var(--glass-border))] pt-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      SubTotal
                    </span>
                    <span > ${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Shipping
                    </span><span className="text-green-400">{total <= 50 ? "$2.00" : "Free"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tax (0.8%)
                    </span><span >{(total * 0.008).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-[hsla(var(--glass-border))]">
                    <span className="text-muted-foreground">
                      Total
                    </span><span className="text-primary">${totalWithTax.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;