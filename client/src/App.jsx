import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Auth from './pages/Auth';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Discover from './pages/Discover';
import About from './pages/About';
import ProfileFeed from './pages/ProfileFeed';
import VetListings from './pages/VetListings';
import TrainingListings from './pages/TrainingListings';
import GroomingListings from './pages/GroomingListings';
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
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth signup />} />
              <Route path="*" element={<div className="p-12 text-center">Page not found</div>} />
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/about" element={<About />} />
              <Route path="/profile" element={<ProtectedRoute><ProfileFeed /></ProtectedRoute>} />
              <Route path="/vets" element={<VetListings />} />
              <Route path="/training" element={<TrainingListings />} />
              <Route path="/grooming" element={<GroomingListings />} />
              <Route path="/booking/:serviceId" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
              <Route path="/payment/:bookingId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
