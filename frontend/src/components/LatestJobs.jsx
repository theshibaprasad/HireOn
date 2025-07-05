import React from 'react';
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

const LatestJobs = () => {
  const { allJobs } = useSelector((store) => store.job);

  return (
    <div className='max-w-7xl mx-auto my-20 px-4'>
      {/* Animated Heading */}
      <motion.h1
        className='text-4xl font-bold text-center md:text-left'
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <span className='text-[#6A38C2]'>Latest & Top </span> Job Openings
      </motion.h1>

      {/* Job Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8'>
        {allJobs.length <= 0 ? (
          <span className='text-gray-500'>No Job Available</span>
        ) : (
          allJobs.slice(0, 6).map((job, index) => (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <LatestJobCards job={job} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default LatestJobs;
