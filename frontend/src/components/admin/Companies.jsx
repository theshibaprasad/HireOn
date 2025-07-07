import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import CompaniesTable from './CompaniesTable';
import { useNavigate } from 'react-router-dom';
import useGetAllCompanies from '@/hooks/useGetAllCompanies';
import { useDispatch } from 'react-redux';
import { setSearchCompanyByText } from '@/redux/companySlice';
import { motion } from 'framer-motion';
import Footer from '../shared/Footer';

const Companies = () => {
  useGetAllCompanies();
  const [input, setInput] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchCompanyByText(input));
  }, [input]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pt-[90px] max-w-6xl mx-auto px-4 flex-1 w-full"
      >
        <div className="flex items-center justify-between my-8">
          <Input
            className="w-1/2 border border-gray-300"
            placeholder="🔍 Search companies by name..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button
            onClick={() => navigate('/admin/companies/create')}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
          >
            + New Company
          </Button>
        </div>
        <CompaniesTable />
      </motion.div>
      <Footer />
    </div>
  );
};

export default Companies;
