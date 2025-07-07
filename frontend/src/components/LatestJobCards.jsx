import React from 'react';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (job?._id) {
      navigate(`/description/${job._id}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className='flex flex-col justify-between h-full min-h-[220px] p-5 rounded-md shadow-md bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 cursor-pointer transition-all hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600'
    >
      {/* Top: Company Info, Title, Description */}
      <div>
        {/* Company Info */}
        <h1 className='font-semibold text-lg text-gray-800 dark:text-white'>
          {job?.company?.name || 'Company Name'}
        </h1>
        <p className='text-sm text-gray-500 dark:text-gray-400'>India</p>
        {/* Job Title & Description */}
        <div className='mt-2'>
          <h2 className='font-bold text-lg text-[#6A38C2] dark:text-purple-300 mb-1'>
            {job?.title || 'Job Title'}
          </h2>
          <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-2'>
            {job?.description || 'No description provided.'}
          </p>
        </div>
      </div>
      {/* Bottom: Badges */}
      <div className='flex flex-wrap items-center gap-2 mt-4'>
        <Badge variant='ghost' className='text-blue-700 font-bold dark:text-blue-300'>
          {job?.position || '0'} Positions
        </Badge>
        <Badge variant='ghost' className='text-[#F83002] font-bold dark:text-red-400'>
          {job?.jobType || 'N/A'}
        </Badge>
        <Badge variant='ghost' className='text-[#7209b7] font-bold dark:text-purple-300'>
          {job?.salary ? `${job.salary} LPA` : 'Salary Not Disclosed'}
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
