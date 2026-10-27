import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ id, title, image, buttonText, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col items-center"
    >
      <div className="w-full h-48 sm:h-56 overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-110"
        />
      </div>
      <div className="p-5 w-full flex flex-col items-center">
        <h3 className="text-xl font-bold mb-4 text-black">{title}</h3>
        <button
          onClick={onClick}
          className="bg-[#6A92C5] hover:bg-[#587ea8] text-white px-8 py-2 rounded-full font-medium transition-colors w-3/4 max-w-[150px]"
        >
          {buttonText}
        </button>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
