// Browse.jsx
import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useGetBrowseJobs } from '@/hooks/useGetAllJobs';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';
import Loader from './shared/Loader';

const Spinner = () => (
  <div className="flex flex-col items-center justify-center py-8">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#6A38C2] mb-3"></div>
    <span className="text-gray-600 dark:text-gray-300 font-medium">Loading jobs...</span>
  </div>
);

const Browse = () => {
  const dispatch = useDispatch();
  const { browseJobs, searchedQuery } = useSelector((store) => store.job);
  const jobs = Array.isArray(browseJobs) ? browseJobs : [];

  const [query, setQuery] = useState(searchedQuery || '');
  const { loading, error } = useGetBrowseJobs();

  const handleSearch = () => {
    dispatch(setSearchedQuery(query.trim()));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleClearSearch = () => {
    setQuery('');
    dispatch(setSearchedQuery(''));
  };

  useEffect(() => {
    // Reset search when entering Browse
    dispatch(setSearchedQuery(''));
    return () => {
      dispatch(setSearchedQuery(''));
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="flex-1 mt-[70px] mb-8 px-4">
        {/* Top Search Bar */}
        <div className="max-w-4xl mx-auto mt-6 mb-8">
          <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-2 shadow-sm bg-white dark:bg-gray-900">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search jobs by title, description, or location..."
              className="flex-1 outline-none bg-transparent text-sm text-gray-700 dark:text-gray-100"
            />
            {query && (
              <button onClick={handleClearSearch}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-gray-100" />
              </button>
            )}
            <Button onClick={handleSearch} className="rounded-full bg-[#6A38C2] text-white hover:bg-[#582ea5]">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-7xl mx-auto">
          <h1 className="font-bold text-xl mb-6 dark:text-gray-100">Search Results ({jobs.length})</h1>
          {loading ? <Spinner /> : null}
          {loading ? null : error ? (
            <p className="text-red-500 dark:text-red-400">Failed to load jobs. Please try again.</p>
          ) : jobs.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No jobs found for "{query}"</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map((job) => (
                <Job key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
