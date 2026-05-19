import React from 'react';
import { motion } from 'framer-motion';
import { profilePosts } from '../data/mockData';
import { useAppContext } from '../context/AppContext';

const ProfileFeed = () => {
  const { user } = useAppContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-4rem)] w-full py-12 bg-white"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center md:items-start mb-12 gap-8 md:gap-16">
          <div className="flex-shrink-0">
            <img 
              src={user?.avatar || 'https://i.pravatar.cc/150?img=11'} 
              alt="Profile Avatar" 
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[#E6F0F9]"
            />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl font-bold text-black mb-4">{user?.name || 'Ocean'}</h2>
            
            <div className="flex justify-center md:justify-start space-x-8 mb-6">
              <div className="text-center">
                <span className="block font-bold text-xl text-black">24</span>
                <span className="text-gray-500">Posts</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-xl text-black">1.2k</span>
                <span className="text-gray-500">Followers</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-xl text-black">350</span>
                <span className="text-gray-500">Following</span>
              </div>
            </div>
            
            <div className="max-w-md mx-auto md:mx-0">
              <p className="text-black font-medium mb-1">Ocean 🌊🐚✨</p>
              <p className="text-gray-600">Dog lover | Coffee addict | Exploring the world one bark at a time. 🌍🐶</p>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 mb-8" />

        {/* Image Grid */}
        <div className="grid grid-cols-3 gap-1 md:gap-4">
          {profilePosts.map((post, index) => (
            <motion.div 
              key={post.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative aspect-square overflow-hidden bg-gray-100 group cursor-pointer"
            >
              <img 
                src={post.image} 
                alt={`Post ${post.id}`} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <span className="text-white font-bold text-lg">❤️ {Math.floor(Math.random() * 500) + 50}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileFeed;
