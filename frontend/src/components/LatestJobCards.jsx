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
      className='p-5 rounded-md shadow-md bg-white border border-gray-100 cursor-pointer transition-all hover:shadow-lg hover:border-gray-300'
    >
      {/* Company Info */}
      <div>
        <h1 className='font-semibold text-lg text-gray-800'>
          {job?.company?.name || 'Company Name'}
        </h1>
        <p className='text-sm text-gray-500'>India</p>
      </div>

      {/* Job Title & Description */}
      <div className='mt-2'>
        <h2 className='font-bold text-lg text-[#6A38C2] mb-1'>
          {job?.title || 'Job Title'}
        </h2>
        <p className='text-sm text-gray-600 line-clamp-2'>
          {job?.description || 'No description provided.'}
        </p>
      </div>

      {/* Badges */}
      <div className='flex flex-wrap items-center gap-2 mt-4'>
        <Badge variant='ghost' className='text-blue-700 font-bold'>
          {job?.position || '0'} Positions
        </Badge>
        <Badge variant='ghost' className='text-[#F83002] font-bold'>
          {job?.jobType || 'N/A'}
        </Badge>
        <Badge variant='ghost' className='text-[#7209b7] font-bold'>
          {job?.salary ? `${job.salary} LPA` : 'Salary Not Disclosed'}
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
