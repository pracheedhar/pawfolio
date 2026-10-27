import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import { useResource } from '../lib/useResource';
import DataState from '../components/DataState';

const TrainingListings = () => {
  const navigate = useNavigate();
  const { data, loading, error, reload } = useResource('/services?category=training&limit=100');
  const trainingServices = data?.items || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[calc(100vh-4rem)] w-full py-12 bg-white"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-black mb-12">
          Expert Training at Your Fingertips.
        </h2>
        
        <DataState loading={loading} error={error} empty={!trainingServices.length} retry={reload} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trainingServices.map((service, index) => (
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
      </div>
    </motion.div>
  );
};

export default TrainingListings;
