import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { useResource } from '../lib/useResource';
import DataState from '../components/DataState';

const Discover = () => {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useResource('/categories?limit=100');
  const discoverCategories = data?.items || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-4rem)] w-full py-12"
      style={{
        backgroundImage: 'repeating-linear-gradient(90deg, #E6F0F9, #E6F0F9 20px, #ffffff 20px, #ffffff 40px)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-100">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-black mb-12">
            Book your favourites
          </h2>
          
        <DataState loading={loading} error={error} empty={!discoverCategories.length} retry={reload} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {discoverCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <ServiceCard
                  id={category.id}
                  title={category.title}
                  image={category.image}
                  buttonText="Book"
                  onClick={() => navigate(category.path)}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Discover;
