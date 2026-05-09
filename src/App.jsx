import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Discover from './pages/Discover';
import About from './pages/About';
import ProfileFeed from './pages/ProfileFeed';
import VetListings from './pages/VetListings';
import TrainingListings from './pages/TrainingListings';
import BookingDetails from './pages/BookingDetails';
import Payment from './pages/Payment';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<ProfileFeed />} />
              <Route path="/vets" element={<VetListings />} />
              <Route path="/training" element={<TrainingListings />} />
              <Route path="/booking/:serviceId" element={<BookingDetails />} />
              <Route path="/payment/:bookingId" element={<Payment />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
