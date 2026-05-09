import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { vetServices } from '../data/mockData';

const VetListings = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-4rem)] w-full py-12 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-12">
          Expert Care for Every Paw.
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vetServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <ServiceCard
                id={service.id}
                title={service.name}
                image={service.image}
                buttonText="View"
                onClick={() => navigate(`/booking/${service.id}`)}
              />
            </motion.div>
          ))}
        </div>

        {/* Small dog sketch placeholder */}
        <div className="mt-16 flex justify-center">
          <svg width="200" height="100" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
             {/* Replace with actual dog sketch path */}
             <path d="M50 80 C50 60 70 60 70 80 C70 100 50 100 50 80 Z" stroke="black" strokeWidth="2" fill="none"/>
             <path d="M70 80 L120 80 C140 80 150 70 150 50 C150 30 140 20 120 20 L80 20 C60 20 50 30 50 50 L50 80" stroke="black" strokeWidth="2" fill="none"/>
             <path d="M120 20 C130 10 140 10 150 20" stroke="black" strokeWidth="2" fill="none"/>
             <path d="M50 50 L30 60" stroke="black" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default VetListings;
