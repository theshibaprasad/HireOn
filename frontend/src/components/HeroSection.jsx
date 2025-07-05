import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Rotating taglines
const taglines = [
  'Connecting Ambitions with Opportunities.',
  'Find your Future, Start Today.',
  'Unlock Your Career Potential.',
  'Where Talent Meets Opportunity.',
  'Start Your Next Chapter Here.',
  'Jobs Tailored for Your Dreams.',
  'Search Smart. Work Smarter.',
  'Fueling India’s Career Journey.',
  'Your Dream Job is a Click Away.',
  'Crafting Careers, One Click at a Time.'
];

const HeroSection = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Tagline Typewriter Effect
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = taglines[index % taglines.length];
    const speed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      setText((prev) =>
        isDeleting ? current.substring(0, prev.length - 1) : current.substring(0, prev.length + 1)
      );

      if (!isDeleting && text === current) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setIndex((prev) => (prev + 1) % taglines.length);
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index]);

  const searchJobHandler = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery !== '') {
      dispatch(setSearchedQuery(trimmedQuery));
      navigate('/browse');
    }
  };

  return (
    <div className='text-center'>
      <div className='flex flex-col gap-5 my-10 px-4'>

        {/* Typewriter Tagline without cursor */}
        <motion.span
          className='mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#F83002] font-medium min-h-[2.5rem]'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {text}
        </motion.span>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className='text-5xl font-bold leading-snug'
        >
          Search, Apply & <br />
          Get Your{' '}
          <motion.span
            initial={{ textShadow: '0 0 5px rgba(106, 56, 194, 0.4)' }}
            animate={{
              textShadow: [
                '0 0 5px rgba(106, 56, 194, 0.4)',
                '0 0 10px rgba(106, 56, 194, 0.6)',
                '0 0 15px rgba(106, 56, 194, 0.8)',
                '0 0 10px rgba(106, 56, 194, 0.6)',
                '0 0 5px rgba(106, 56, 194, 0.4)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className='bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent'
          >
            Dream Jobs
          </motion.span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className='text-gray-500 max-w-xl mx-auto'
        >
          Discover thousands of job opportunities tailored to your skills and passion — your dream role is just a search away.
        </motion.p>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className='relative w-full max-w-xl mx-auto mt-4'
        >
          <input
            type='text'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchJobHandler()}
            placeholder='Find your dream jobs'
            className='w-full py-3 pl-4 pr-12 text-sm bg-white border border-gray-200 rounded-full shadow-sm outline-none'
          />
          <Button
            onClick={searchJobHandler}
            className='absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-[#6A38C2] text-white h-9 w-9 p-2 flex items-center justify-center transition hover:bg-[#5b2ca0] active:scale-95'
          >
            <Search className='h-4 w-4' />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
