import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CreditCard, Lock } from "lucide-react";
import { toast } from "react-toastify";
import { clearCart } from "../store/slices/cartSlice";
import { toggleOrderStep } from "../store/slices/orderSlice";
// import { loadRazorPay } from "../lib/loadRazoryPay";

const PaymentForm = ({ razorpay, orderData }) => {

  const [isProcessing, setIsProcessing] = useState(false);

  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  
  // Note: Removed the redundant front-end calculation of total/totalWithTax.

  console.log("order_id:", orderData?.order_id);
  console.log("amount:", orderData?.amount);
  console.log("currency:", orderData?.currency);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!razorpay) {
      toast.error("Razorpay SDK not loaded yet!");
      return;
    }
    if (!orderData || !orderData.order_id || !orderData.key) {
      toast.error("Order or key details missing! Please try again.");
      return;
    }
    
    setIsProcessing(true);
    
    try {
       const amountInPaise = Math.trunc(orderData.amount);
        if (amountInPaise <= 0) {
        toast.error("Invalid payment amount received from server.");
        setIsProcessing(false);
        return;
      }
      const options = {
        // ⭐ CORRECTION 1: Use the key from the orderData prop (fetched from backend)
       
        key: orderData.key, 
        name: "Busi",
        description: "Purchase of Goods",
        amount: orderData.amountInPaise,
        order_id: orderData.order_id,
        currency: orderData.currency,
       
        
        // This function handles the response after the user completes the payment in the Razorpay popup
        handler: function (response) {
          toast.success("Payment Successful!");
          console.log("Razorpay Response:", response);
          
          // These actions should only run on successful payment
          dispatch(clearCart());
          dispatch(toggleOrderStep()); // Consider renaming this action to resetOrderStep
          navigateTo("/");
        },
        
        prefill: {
          // It's better to use user data from Redux state (e.g., authUser)
          name: authUser?.name ||"Customer Name", 
          email:authUser?.email|| "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4f46e5",
        },
      };

      const rzp = new window.Razorpay(options);
      
      // Event handler for failed payments
      rzp.on("payment.failed", function (response) {
        console.error("Razorpay Error:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
      });

      rzp.open();
      
    } catch (error) {
      console.error("Payment Initialization Error:", error);
      toast.error("Payment initialization failed!");
    } finally {
      // We keep processing true until the Razorpay popup opens. 
      // The `handler` or `payment.failed` event will manage the final state after the popup interaction.
      setIsProcessing(false); 
    }
  }
    return (
      <form onSubmit={handlePayment} className="glass-panel p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Razorpay Payment</h2>
        </div>

        <div className="flex items-center space-x-2 mb-6 p-4 bg-secondary/50 rounded-lg">
          <Lock className="w-5 h-5 text-green-500" />
          <span className="text-sm text-muted-foreground">
            Your payment is secure via Razorpay.
          </span>
        </div>

        <button
          type="submit"
          disabled={isProcessing}
          className="flex justify-center items-center gap-2 w-full py-3 gradient-primary text-primary-foreground rounded-lg hover:glow-on-hover animate-smooth font-semibold"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Initializing Payment...</span>
            </>
          ) : (
            `Pay ${orderData ? (orderData.amount / 100).toFixed(2) : ''} ${orderData ? orderData.currency : ''}`
          )}
        </button>
      </form>
  );
}

export default PaymentForm;