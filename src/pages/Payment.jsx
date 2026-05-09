import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const Payment = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { bookingId } = useParams();
  
  const serviceName = state?.serviceName || 'Premium Service';
  const ownerName = state?.formData?.ownerName || 'Valued Customer';

  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const handleChange = (e) => {
    setPaymentData({ ...paymentData, [e.target.name]: e.target.value });
  };

  const handlePayment = (e) => {
    e.preventDefault();
    // Simulate successful payment
    alert(`Payment successful! Your booking (${bookingId}) is confirmed, ${ownerName}.`);
    navigate('/');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-4rem)] w-full py-12 bg-gray-50 flex justify-center items-center"
    >
      <div className="max-w-6xl w-full px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100">
          
          {/* Summary Section (Left) */}
          <div className="w-full lg:w-5/12 bg-[#E6F0F9] p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-black mb-8">Booking Summary</h2>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src="https://images.unsplash.com/photo-1596272875886-f6313ed6c99f?auto=format&fit=crop&q=80&w=150" 
                    alt="Service" 
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-xl text-black">{serviceName}</h3>
                    <p className="text-gray-600">June 16, 2026 • 10:00 AM</p>
                  </div>
                </div>

                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span className="font-medium">$85.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span className="font-medium">$8.50</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount (PAW10)</span>
                    <span className="font-medium">-$8.50</span>
                  </div>
                  <hr className="border-gray-300 my-4" />
                  <div className="flex justify-between text-xl font-bold text-black">
                    <span>Total</span>
                    <span>$85.00</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Payment Form (Right) */}
          <div className="w-full lg:w-7/12 p-8 md:p-12 lg:pl-16">
            <h2 className="text-3xl font-bold text-black mb-2">Payment Details</h2>
            <p className="text-gray-500 mb-8">Complete your booking by providing your payment information.</p>
            
            <form onSubmit={handlePayment} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                <input 
                  type="text" 
                  name="cardName"
                  required
                  value={paymentData.cardName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6A92C5] focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="cardNumber"
                    required
                    maxLength="19"
                    value={paymentData.cardNumber}
                    onChange={handleChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6A92C5] focus:border-transparent transition-all"
                  />
                  {/* Dummy card icon */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <div className="w-6 h-4 bg-gray-200 rounded-sm"></div>
                    <div className="w-6 h-4 bg-gray-200 rounded-sm"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input 
                    type="text" 
                    name="expiry"
                    required
                    placeholder="MM/YY"
                    value={paymentData.expiry}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6A92C5] focus:border-transparent transition-all"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                  <input 
                    type="text" 
                    name="cvc"
                    required
                    maxLength="4"
                    placeholder="123"
                    value={paymentData.cvc}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#6A92C5] focus:border-transparent transition-all"
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-[#6A92C5] hover:bg-[#587ea8] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md mt-4"
              >
                Pay $85.00
              </button>
            </form>
            
            <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-1">
              <span>🔒</span> Payments are secure and encrypted.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Payment;
