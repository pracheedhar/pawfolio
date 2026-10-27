import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { api, mediaUrl } from '../lib/api';
import { useResource } from '../lib/useResource';
import { useAppContext } from '../context/useAppContext';
import DataState from '../components/DataState';

const Payment = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { notify } = useAppContext();
  const bookingResource = useResource(`/bookings/${bookingId}`);
  const booking = bookingResource.data;
  const serviceResource = useResource(booking ? `/services/${booking.service}` : null);
  const [busy, setBusy] = useState(false);
  const money = (cents) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      (cents || 0) / 100,
    );
  const handlePayment = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api(`/bookings/${bookingId}/payment`, { method: 'POST', body: {} });
      notify('Booking confirmed in demo mode. No money was charged.');
      navigate('/profile');
    } catch (error) {
      notify(error.message);
    } finally {
      setBusy(false);
    }
  };
  if (bookingResource.loading || bookingResource.error)
    return (
      <DataState
        loading={bookingResource.loading}
        error={bookingResource.error}
        retry={bookingResource.reload}
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-4rem)] w-full py-12 flex justify-center items-center"
      style={{
        backgroundImage:
          'repeating-linear-gradient(90deg, #E6F0F9, #E6F0F9 20px, #ffffff 20px, #ffffff 40px)',
      }}
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
                    src={mediaUrl(serviceResource.data?.image) || '/favicon.svg'}
                    alt="Service"
                    className="w-20 h-20 rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-bold text-xl text-black">
                      {serviceResource.data?.name || 'Service'}
                    </h3>
                    <p className="text-gray-600">
                      {booking.date} • {booking.time}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-gray-700">
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span className="font-medium">{money(booking.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxes</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                  <hr className="border-gray-300 my-4" />
                  <div className="flex justify-between text-xl font-bold text-black">
                    <span>Total</span>
                    <span>{money(booking.price)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/30 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* Payment Form (Right) */}
          <div className="w-full lg:w-7/12 p-8 md:p-12 lg:pl-16">
            <h2 className="text-3xl font-bold text-black mb-2">Demo Confirmation</h2>
            <p className="text-gray-500 mb-8">
              Confirm your booking in demo mode. No money will be charged. Real payments require a
              configured payment provider.
            </p>

            <form onSubmit={handlePayment} className="space-y-6 max-w-md">
              <p className="rounded-xl bg-[#E6F0F9] p-4">
                {booking.ownerName}, your booking is {booking.status}. This demonstration does not
                collect card details.
              </p>
              <button
                type="submit"
                disabled={busy || booking.status !== 'pending'}
                className="w-full bg-[#6A92C5] hover:bg-[#587ea8] text-white py-4 rounded-xl font-bold text-lg transition-colors shadow-md mt-4"
              >
                {busy ? 'Confirming…' : `Confirm demo booking · ${money(booking.price)}`}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6 flex items-center justify-center gap-1">
              <span>🔒</span> Demo only · No charge or card information collected.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Payment;
