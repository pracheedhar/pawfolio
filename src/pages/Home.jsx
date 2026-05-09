import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden flex flex-col"
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/src/assets/parkimg.png")', // Exact park image provided by user
        }}
      >
        {/* Dark gradient overlay starting from the left */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex-grow max-w-[1400px] w-full mx-auto px-6 sm:px-12 flex flex-col justify-end pb-24 md:pb-32">
        
        <div className="flex justify-between items-end w-full">
          {/* Left: Text Content */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-white max-w-3xl"
          >
            <h1 className="text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-bold leading-[1.1] tracking-tight mb-2">
              Welcome to <br /> Pawfolio-
            </h1>
            <p className="text-2xl md:text-[2.75rem] lg:text-[3.25rem] font-semibold tracking-tight mt-4">
              Connect, Share & Love Pets
            </p>
          </motion.div>

          {/* Right: Illustration */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="hidden lg:flex flex-col items-center justify-center relative right-0 bottom-[-20px] w-[500px]"
          >
             <img 
               src={dogWalkerImg} 
               alt="Person walking dog sketch" 
               className="w-[450px] h-auto object-contain drop-shadow-lg pointer-events-none"
               style={{ 
                 /* 
                   We use contrast(200%) to crush the white background of the JPEG 
                   into pure white so that invert(1) turns it into PURE black. 
                   This prevents the "black box" artifact when using mixBlendMode: 'screen' 
                 */
                 filter: 'grayscale(100%) contrast(500%) invert(1)',
                 mixBlendMode: 'screen'
               }}
             /> 
          </motion.div>
        </div>

        {/* Floating Button Bottom Center */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/discover')}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-[#E1E0D6] text-black p-3 rounded-full shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] transition-all flex items-center justify-center z-20"
        >
          <Plus className="h-6 w-6 stroke-[3]" />
        </motion.button>

      </div>
    </motion.div>
  );
};

export default Home;
