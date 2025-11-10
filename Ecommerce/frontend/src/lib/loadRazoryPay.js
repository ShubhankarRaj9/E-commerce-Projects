// export const loadRazorPay = () => {
//   return new Promise((resolve, reject) => {
//     if (window.Razorpay) {
//       resolve(window.Razorpay);
//       return;
//     }

//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     script.onload = () => {
//       if (window.Razorpay) resolve(window.Razorpay);
//       else reject("Razorpay SDK failed to load properly");
//     };
//     script.onerror = () => reject("Razorpay SDK failed to load");
//     document.body.appendChild(script);
//   });
// };
// Example of a correct loadRazorPay.js implementation

export const loadRazorPay = () => {
    return new Promise((resolve, reject) => {
        // 1. Check if the SDK is already present
        if (window.Razorpay) {
            resolve(window.Razorpay);
            return;
        }

        // 2. Create the script element
        const script = document.createElement('script');
        script.id = 'razorpay-checkout-js';
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;

        // 3. Handle success and failure
        script.onload = () => {
            if (window.Razorpay) {
                resolve(window.Razorpay);
            } else {
                // This branch is usually hit if the script loaded but didn't define window.Razorpay (unlikely)
                reject(new Error("Razorpay object not defined after script load."));
            }
        };

        script.onerror = () => {
            reject(new Error("Razorpay script failed to load. Check URL or connectivity."));
        };

        // 4. Append to the document body
        document.body.appendChild(script);
    });
};