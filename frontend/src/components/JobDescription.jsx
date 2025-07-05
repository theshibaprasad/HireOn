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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'
        }`}
      >
        <Navbar />
      </div>

      <div className="flex-1 mt-[90px] px-4 max-w-5xl mx-auto pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-8 text-white shadow-2xl'>
            <div className='flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8'>
              <div className='space-y-4 flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='px-3 py-1 bg-white/20 rounded-full text-sm font-medium'>
                    {singleJob?.company?.name || 'Company'}
                  </div>
                  <div className='flex items-center gap-1'>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />
                    ))}
                    <span className='text-sm ml-1'>4.9</span>
                  </div>
                </div>
                <h1 className='text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>
                  {singleJob?.title}
                </h1>
                <div className='flex flex-wrap items-center gap-3'>
                  <div className='bg-blue-500/20 text-blue-100 border border-blue-400/30 px-4 py-2 rounded-full flex items-center gap-2'>
                    <Building className='w-4 h-4' />
                    {singleJob?.position || 'N/A'} Positions
                  </div>
                  <div className='bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 px-4 py-2 rounded-full flex items-center gap-2'>
                    <Briefcase className='w-4 h-4' />
                    {singleJob?.jobType || 'N/A'}
                  </div>
                  <div className='bg-purple-500/20 text-purple-100 border border-purple-400/30 px-4 py-2 rounded-full flex items-center gap-2'>
                    <span className='text-lg font-bold text-purple-300'>₹</span>
                    {singleJob?.salary || 'N/A'} LPA
                  </div>
                </div>
              </div>
              <div className='lg:ml-8'>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isApplied ? null : applyJobHandler}
                  disabled={isApplied || isLoading}
                  className={`px-8 py-4 text-lg font-semibold rounded-2xl transition-all duration-500 transform ${
                    isApplied
                      ? 'bg-green-500 text-white cursor-default shadow-lg shadow-green-500/25'
                      : 'bg-white text-purple-700 hover:bg-gray-50 shadow-xl hover:shadow-2xl'
                  }`}
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
          className='mt-12 bg-white rounded-3xl shadow-2xl border border-gray-100'
        >
          <div className='px-8 py-8 border-b border-gray-200 flex items-center gap-4'>
            <div className='p-3 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl shadow-lg'>
              <Briefcase className='w-8 h-8 text-white' />
            </div>
            <div>
              <h2 className='text-3xl font-bold text-gray-800'>Job Description</h2>
              <p className='text-gray-600 mt-1'>Everything you need to know about this role</p>
            </div>
          </div>

          <div className='p-8'>
            <div className='mb-10'>
              <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center gap-3'>
                <Award className='w-6 h-6 text-purple-600' />
                About this role
              </h3>
              <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100'>
                <p className='text-gray-700 leading-relaxed text-lg'>
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
                    className='p-4 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center gap-3'
                  >
                    <div className='p-2 bg-purple-100 rounded-full'>
                      <Icon className='w-5 h-5 text-purple-600' />
                    </div>
                    <div>
                      <p className='text-sm text-gray-500'>{detail.label}</p>
                      <p className='text-base font-semibold text-gray-800'>{detail.value}</p>
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
