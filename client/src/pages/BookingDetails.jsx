import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useResource } from '../lib/useResource';
import { useAppContext } from '../context/AppContext';
import DataState from '../components/DataState';

const BookingDetails = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const { notify, user } = useAppContext();
  const serviceResource = useResource(`/services/${serviceId}`);
  const serviceName = serviceResource.data?.name || 'Selected Service';
  const [step, setStep] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [selectedTime, setSelectedTime] = useState(null);
  const [busy, setBusy] = useState(false);
  const availability = useResource(`/services/${serviceId}/availability?date=${selectedDate}`);
  const TIME_SLOTS = availability.data || [];

  const [formData, setFormData] = useState({
    ownerName: user?.name || '',
    phoneNumber: '',
    email: user?.email || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = document.getElementById('booking-form');
    if (!form.reportValidity()) return;
    if (!selectedTime || !TIME_SLOTS.includes(selectedTime)) { notify('Choose an available appointment time'); return; }
    if (busy) return;
    setBusy(true);
    try {
      const booking = await api('/bookings', { method: 'POST', body: { ...formData, service: serviceId, date: selectedDate, time: selectedTime } });
      notify('Booking reserved');
      navigate(`/payment/${booking.id}`);
    } catch (error) { notify(error.message); availability.reload(); } finally { setBusy(false); }
  };

  const panelVariants = {
    enter: (dir) => ({ x: dir === 'forward' ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: (dir) => ({ x: dir === 'forward' ? -60 : 60, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }),
  };

  if (serviceResource.loading || serviceResource.error) return <DataState loading={serviceResource.loading} error={serviceResource.error} retry={serviceResource.reload} />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-4rem)] w-full flex items-center justify-center p-4 sm:p-8"
    >
      {/* Background Hero Image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            'url("https://i1-e.pinimg.com/736x/93/5c/ac/935cacb9a10ad147275a8231dbac958b.jpg")',
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row gap-8 items-stretch">

        {/* Left Panel — Calendar or Time Picker */}
        <div className="w-full md:w-1/2 overflow-hidden">
          <AnimatePresence mode="wait" custom={step === 'time' ? 'forward' : 'backward'}>
            {step === 'calendar' ? (
              <motion.div
                key="calendar"
                custom="forward"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="glass-panel p-8 flex flex-col h-full"
              >
                <h3 className="text-3xl font-serif text-white mb-6">Choose your date</h3>
                <input aria-label="Appointment date" type="date" min={new Date().toLocaleDateString('en-CA')} value={selectedDate} onChange={event => { if (event.target.value) { setSelectedDate(event.target.value); setSelectedTime(null); } }} className="p-4 rounded-xl w-full" />

                <div className="mt-auto pt-8 flex justify-center">
                  <button
                    onClick={() => setStep('time')}
                    className="bg-[#6A92C5] hover:bg-[#587ea8] text-white px-8 py-2 rounded-full font-medium transition-colors w-32 shadow-lg"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="time"
                custom="forward"
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="glass-panel p-8 flex flex-col h-full"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-6 text-white">
                  <h3 className="text-3xl font-serif">{selectedDate}</h3>
                  <h3 className="text-3xl text-red-500 font-serif"></h3>
                </div>

                {/* Label row */}
                <div className="grid grid-cols-3 gap-2 text-center text-white font-medium mb-4">
                  <div>AM</div>
                  <div></div>
                  <div>PM</div>
                </div>

                {/* Time Slot Grid */}
                <div className="grid grid-cols-3 gap-3 text-center text-white">
                  <DataState loading={availability.loading} error={availability.error} empty={!TIME_SLOTS.length} retry={availability.reload} />
                  {TIME_SLOTS.map((slot) => (
                    <div
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 px-1 rounded-full cursor-pointer transition-colors hover:bg-white/20 text-sm font-medium
                        ${selectedTime === slot
                          ? 'text-red-500 font-bold bg-white/10'
                          : ''
                        }`}
                    >
                      {slot}
                    </div>
                  ))}
                </div>

                <div className="mt-auto pt-8 flex justify-between">
                  <button
                    onClick={() => setStep('calendar')}
                    className="bg-white/10 hover:bg-white/20 text-white px-8 py-2 rounded-full font-medium transition-colors w-32 shadow-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedTime || busy}
                    className="bg-[#6A92C5] hover:bg-[#587ea8] disabled:opacity-40 text-white px-8 py-2 rounded-full font-medium transition-colors w-32 shadow-lg"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Panel — Booking Form */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col w-full md:w-1/2 justify-between"
        >
          <div className="glass-panel p-8 mb-6">
            <form id="booking-form" onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-lg font-medium mb-2">Owner :</label>
                <input
                  type="text"
                  name="ownerName"
                  minLength={2} maxLength={80}
                  required
                  value={formData.ownerName}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/50 text-white focus:outline-none focus:border-white px-2 py-1 placeholder-white/50 text-lg"
                />
              </div>
              <div>
                <label className="block text-white text-lg font-medium mb-2">Phone Number :</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  pattern="[+0-9 ()-]{7,20}"
                  required
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/50 text-white focus:outline-none focus:border-white px-2 py-1 placeholder-white/50 text-lg"
                />
              </div>
              <div>
                <label className="block text-white text-lg font-medium mb-2">Email Address :</label>
                <input
                  type="email"
                  name="email"
                  maxLength={254}
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-transparent border-b border-white/50 text-white focus:outline-none focus:border-white px-2 py-1 placeholder-white/50 text-lg"
                />
              </div>
            </form>
          </div>

          <div className="text-center text-white mt-auto">
            <h3 className="text-2xl mb-2">Booking your session with</h3>
            <h2 className="text-4xl font-bold mb-6">{serviceName}</h2>
            <button
              onClick={handleSubmit}
              disabled={busy || !serviceResource.data}
              className="bg-[#6A92C5] hover:bg-[#587ea8] text-white px-12 py-3 rounded-full font-bold text-xl transition-colors shadow-xl"
            >
              {busy ? 'Booking…' : 'Book Now'}
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookingDetails;
