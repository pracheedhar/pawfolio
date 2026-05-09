import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-4rem)] w-full py-12 flex items-center"
      style={{
        backgroundImage: 'repeating-linear-gradient(90deg, #E6F0F9, #E6F0F9 20px, #ffffff 20px, #ffffff 40px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Image Section */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative">
            <img 
              src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1000" 
              alt="Happy pet owner" 
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>

          {/* Text Section */}
          <div className="w-full md:w-1/2 p-12 lg:p-16 flex flex-col justify-center">
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold text-black mb-6 tracking-tight">About Pawfolio</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Welcome to Pawfolio, the ultimate social and service platform designed exclusively for pet lovers. Our mission is to provide an easy and friendly experience for you and your furry friends.
              </p>
              
              <ul className="space-y-4">
                {[
                  'Connect with other pet owners',
                  'Book vet visits with experts',
                  'Schedule grooming sessions',
                  'Access top-tier training services'
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="flex items-center text-gray-800 font-medium text-lg"
                  >
                    <span className="h-2 w-2 bg-[#6A92C5] rounded-full mr-4"></span>
                    {item}
                  </motion.li>
                ))}
              </ul>
              
              <div className="mt-10">
                <button className="bg-[#6A92C5] hover:bg-[#587ea8] text-white px-8 py-3 rounded-full font-semibold transition-colors">
                  Join Our Community
                </button>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default About;
