import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import FilterCard from './FilterCard';
import Job from './Job';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { setSearchedQuery, setAllJobs } from '@/redux/jobSlice';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#6A38C2] mb-3"></div>
    <span className="text-gray-600 dark:text-gray-300 font-medium">Loading jobs...</span>
  </div>
);

const Jobs = () => {
  const { allJobs, jobFilters } = useSelector(store => store.job);
  const filters = jobFilters || { location: '', industry: '', salary: '' };
  const [filterJobs, setFilterJobs] = useState(allJobs);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Always fetch all jobs (no search) on Jobs page mount
  useEffect(() => {
    const fetchAllJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get`, { withCredentials: true });
        if (res.data.success) {
          dispatch(setAllJobs(res.data.jobs));
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllJobs();
    dispatch(setSearchedQuery(''));
  }, [dispatch]);

  useEffect(() => {
    let filtered = allJobs;
    if (filters.location) {
      filtered = filtered.filter(job => job.location === filters.location);
    }
    if (filters.industry) {
      filtered = filtered.filter(job => job.title === filters.industry);
    }
    if (filters.salary) {
      // Example: filter by salary range string match (customize as needed)
      filtered = filtered.filter(job => {
        if (!job.salary) return false;
        const s = job.salary.toString();
        return s.includes(filters.salary) || filters.salary.includes(s);
      });
    }
    setFilterJobs(filtered);
  }, [allJobs, filters]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="flex-1 mt-[70px] mb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-bold text-xl mb-6 dark:text-gray-100">All Jobs</h1>
          {loading ? <Spinner /> : null}
          {error ? (
            <p className="text-red-500 dark:text-red-400">Failed to load jobs. Please try again.</p>
          ) : null}
          <div className='flex gap-5'>
            {/* Sidebar filter */}
            <div className='w-[20%]'>
              <FilterCard />
            </div>

            {/* Job listing */}
            {filterJobs.length <= 0 && !loading ? (
              <span>Job not found</span>
            ) : (
              <div className='flex-1'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                  {filterJobs.map((job) => (
                    <motion.div
                      key={job?._id}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Job job={job} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Jobs;
