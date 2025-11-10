import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { loadRazorPay } from '../lib/loadRazoryPay';
import { clearCart } from '../store/slices/cartSlice';
import axiosInstance from '../lib/axios';

export const useRazorpay = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useDispatch();

    const initializePayment = useCallback(async ({ products, shippingInfo }) => {
        try {
            setIsLoading(true);

            // 1. Load Razorpay SDK
            const Razorpay = await loadRazorPay();
            if (!Razorpay) {
                throw new Error('Razorpay SDK failed to load');
            }

            // 2. Create order on backend
            const { data } = await axios.post('/api/v1/payment/order', {
                products,
                shipping_price: 2, // You can make this dynamic
                tax_price: 0.008, // You can calculate this based on subtotal
                buyer_id: shippingInfo.userId
            });

            if (!data?.order?.id) {
                throw new Error('Could not create order');
            }

            // 3. Initialize Razorpay checkout
            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Your Razorpay key from env
                amount: data.order.amount,
                currency: data.order.currency,
                name: "Your Store Name",
                description: "Purchase",
                order_id: data.order.id,
                handler: async (response) => {
                    try {
                        // 4. Verify payment on backend
                        await axiosInstance.post('/api/v1/payment/verify', {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        // 5. Clear cart and show success
                        dispatch(clearCart());
                        toast.success('Payment successful!');
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        toast.error('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: shippingInfo.full_name,
                    email: shippingInfo.email,
                    contact: shippingInfo.phone
                },
                theme: {
                    color: '#0ea5a4' // Your brand color
                }
            };

            const razorpayInstance = new Razorpay(options);

            razorpayInstance.on('payment.failed', (resp) => {
                toast.error('Payment failed. Please try again.');
                console.error('Payment failed:', resp.error);
            });

            razorpayInstance.open();
        } catch (error) {
            console.error('Payment initialization failed:', error);
            toast.error(error.message || 'Payment initialization failed');
        } finally {
            setIsLoading(false);
        }
    }, [dispatch]);

    return {
        initializePayment,
        isLoading
    };
};