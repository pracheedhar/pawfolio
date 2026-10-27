import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { vetServices, trainingServices, groomingServices } from '../data/mockData';

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM',
  '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
];

const BookingDetails = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const service =
    vetServices.find(s => s.id === serviceId) ||
    trainingServices.find(s => s.id === serviceId) ||
    groomingServices.find(s => s.id === serviceId);
  const serviceName = service?.name || 'Selected Service';

  const [step, setStep] = useState('calendar'); // 'calendar' | 'time'
  const [selectedDate, setSelectedDate] = useState(16);
  const [selectedTime, setSelectedTime] = useState(null);

  const [formData, setFormData] = useState({
    ownerName: '',
    phoneNumber: '',
    email: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const bookingId = Math.random().toString(36).substring(7);
    navigate(`/payment/${bookingId}`, { state: { serviceName, formData, selectedDate, selectedTime } });
  };

  const panelVariants = {
    enter: (dir) => ({ x: dir === 'forward' ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: (dir) => ({ x: dir === 'forward' ? -60 : 60, opacity: 0, transition: { duration: 0.25, ease: 'easeIn' } }),
  };

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
                {/* Header */}
                <div className="flex justify-between items-center mb-6 text-white">
                  <h3 className="text-3xl font-serif">June</h3>
                  <h3 className="text-3xl text-red-500 font-serif">2026</h3>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 gap-2 text-center text-white font-medium mb-4">
                  <div>M</div><div>Tu</div><div>W</div><div>T</div><div>F</div>
                  <div className="text-blue-300">S</div>
                  <div className="text-blue-300">Sn</div>
                </div>

                {/* Day Grid */}
                <div className="grid grid-cols-7 gap-2 text-center text-white">
                  {[...Array(31)].map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedDate(i + 1)}
                      className={`p-2 rounded-full cursor-pointer transition-colors hover:bg-white/20
                        ${selectedDate === i + 1
                          ? 'text-red-500 font-bold bg-white/10'
                          : ''
                        }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>

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
                  <h3 className="text-3xl font-serif">June {selectedDate}</h3>
                  <h3 className="text-3xl text-red-500 font-serif">2026</h3>
                </div>

                {/* Label row */}
                <div className="grid grid-cols-3 gap-2 text-center text-white font-medium mb-4">
                  <div>AM</div>
                  <div></div>
                  <div>PM</div>
                </div>

                {/* Time Slot Grid */}
                <div className="grid grid-cols-3 gap-3 text-center text-white">
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
                    disabled={!selectedTime}
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white text-lg font-medium mb-2">Owner :</label>
                <input
                  type="text"
                  name="ownerName"
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
              className="bg-[#6A92C5] hover:bg-[#587ea8] text-white px-12 py-3 rounded-full font-bold text-xl transition-colors shadow-xl"
            >
              Book Now
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BookingDetails;
