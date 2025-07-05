// Browse.jsx
import React, { useEffect, useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import Job from './Job';
import { useDispatch, useSelector } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';

const Browse = () => {
  const dispatch = useDispatch();
  const { allJobs, searchedQuery } = useSelector((store) => store.job);

  const [query, setQuery] = useState(searchedQuery || '');
  const [filteredJobs, setFilteredJobs] = useState([]);

  useGetAllJobs();

  // Filter based on 'query' not 'searchedQuery' to preserve user input state
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q === '') {
      setFilteredJobs(allJobs);
    } else {
      const filtered = allJobs.filter((job) =>
        job.title.toLowerCase().includes(q) ||
        job.description.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q)
      );
      setFilteredJobs(filtered);
    }
  }, [query, allJobs]);

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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto mt-[70px] mb-[70px] px-4">
        {/* Top Search Bar */}
        <div className="max-w-4xl mx-auto mt-6 mb-8">
          <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 shadow-sm bg-white">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search jobs by title, description, or location..."
              className="flex-1 outline-none bg-transparent text-sm text-gray-700"
            />
            {query && (
              <button onClick={handleClearSearch}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
            <Button onClick={handleSearch} className="rounded-full bg-[#6A38C2] text-white hover:bg-[#582ea5]">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="max-w-7xl mx-auto">
          <h1 className="font-bold text-xl mb-6">Search Results ({filteredJobs.length})</h1>
          {filteredJobs.length === 0 ? (
            <p className="text-gray-600">No jobs found for "{query}"</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => (
                <Job key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <Footer />
      </div>
    </div>
  );
};

export default Browse;
