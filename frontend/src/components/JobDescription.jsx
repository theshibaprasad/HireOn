import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import { setSingleJob } from '@/redux/jobSlice';
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import {
  MapPin, Briefcase, Clock, Building, Star, Award
} from 'lucide-react';
import { motion } from 'framer-motion';

const JobDescription = () => {
  const { singleJob } = useSelector(store => store.job);
  const { user } = useSelector(store => store.auth);
  const params = useParams();
  const jobId = params.id;
  const dispatch = useDispatch();

  const isInitiallyApplied = singleJob?.applications?.some(app => app.applicant === user?._id) || false;
  const [isApplied, setIsApplied] = useState(isInitiallyApplied);
  const [isLoading, setIsLoading] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const applyJobHandler = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, { withCredentials: true });
      if (res.data.success) {
        setIsApplied(true);
        const updatedJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        };
        dispatch(setSingleJob(updatedJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`, { withCredentials: true });
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(res.data.job.applications.some(app => app.applicant === user?._id));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchJob();
  }, [jobId, dispatch, user?._id]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const jobDetails = [
    { icon: Briefcase, label: 'Role', value: singleJob?.title },
    { icon: MapPin, label: 'Location', value: singleJob?.location },
    { icon: Clock, label: 'Experience', value: `${singleJob?.experience} yrs` },
    {
      icon: () => <span className="text-lg font-bold text-purple-600">₹</span>,
      label: 'Salary',
      value: `${singleJob?.salary} LPA`
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white dark:bg-gray-900 shadow-md py-2' : 'bg-white dark:bg-gray-900 py-4'
        }`}
      >
        <Navbar />
      </div>

      <div className="flex-1 mt-[90px] px-4 max-w-3xl mx-auto pb-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className='relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 shadow-lg'>
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
              <div className='space-y-2 flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200'>
                    {singleJob?.company?.name || 'Company'}
                  </div>
                  <div className='flex items-center gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                    ))}
                    <span className='text-sm ml-1 text-gray-600 dark:text-gray-300'>4.9</span>
                  </div>
                </div>
                <h1 className='text-3xl font-bold text-gray-900 dark:text-gray-100'>
                  {singleJob?.title}
                </h1>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 border border-blue-200 dark:border-blue-800 px-4 py-2 rounded-full flex items-center gap-2'>
                    <Building className='w-4 h-4' />
                    {singleJob?.position || 'N/A'} Positions
                  </div>
                  <div className='bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 px-4 py-2 rounded-full flex items-center gap-2'>
                    <Briefcase className='w-4 h-4' />
                    {singleJob?.jobType || 'N/A'}
                  </div>
                  <div className='bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 border border-purple-200 dark:border-purple-800 px-4 py-2 rounded-full flex items-center gap-2'>
                    <span className='text-lg font-bold text-purple-600 dark:text-purple-300'>₹</span>
                    {singleJob?.salary || 'N/A'} LPA
                  </div>
                </div>
              </div>
              <div className='md:ml-8 w-full md:w-auto'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isApplied ? null : applyJobHandler}
                  disabled={isApplied || isLoading}
                  className={`w-full md:w-auto px-8 py-3 text-base font-semibold rounded-xl transition-all duration-500 transform focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                    ${isApplied
                      ? 'bg-green-500 text-white cursor-default shadow-lg shadow-green-500/25'
                      : 'bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 shadow-xl hover:shadow-2xl'}
                  `}
                >
                  {isLoading ? 'Applying...' : isApplied ? 'Applied Successfully!' : 'Apply Now'}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className='mt-10 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800'
        >
          <div className='px-6 py-6 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4'>
            <div className='p-3 bg-purple-600 dark:bg-purple-800 rounded-xl shadow-lg'>
              <Briefcase className='w-8 h-8 text-white' />
            </div>
            <div>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>Job Description</h2>
              <p className='text-gray-600 dark:text-gray-300 mt-1'>Everything you need to know about this role</p>
            </div>
          </div>

          <div className='p-6'>
            <div className='mb-8'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-3'>
                <Award className='w-5 h-5 text-purple-600 dark:text-purple-400' />
                About this role
              </h3>
              <div className='rounded-xl p-4 border border-blue-100 dark:border-blue-900 bg-blue-50 dark:bg-blue-950'>
                <p className='text-gray-700 dark:text-gray-200 leading-relaxed text-base'>
                  {singleJob?.description}
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              {jobDetails.map((detail, index) => {
                const Icon = detail.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className='p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex items-center gap-3'
                  >
                    <div className='p-2 bg-purple-100 dark:bg-purple-900 rounded-full'>
                      <Icon className='w-5 h-5 text-purple-600 dark:text-purple-300' />
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>{detail.label}</p>
                      <p className='text-base font-semibold text-gray-900 dark:text-gray-100'>{detail.value}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default JobDescription;
