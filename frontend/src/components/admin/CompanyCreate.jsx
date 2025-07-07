import React, { useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { COMPANY_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setSingleCompany } from '@/redux/companySlice';
import { motion } from 'framer-motion';
import Footer from '../shared/Footer';

const CompanyCreate = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [companyName, setCompanyName] = useState('');

  const registerNewCompany = async () => {
    if (!companyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    try {
      const res = await axios.post(
        `${COMPANY_API_END_POINT}/register`,
        { companyName },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        dispatch(setSingleCompany(res.data.company));
        toast.success(res.data.message);
        const companyId = res?.data?.company?._id;
        navigate(`/admin/companies/${companyId}`);
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong while creating the company.');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <Navbar />
      </div>
      {/* Main Content */}
      <motion.div
        className="max-w-4xl mx-auto pt-[90px] px-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow">
          <div className="my-10">
            <h1 className="font-bold text-3xl text-gray-800 mb-2 dark:text-gray-100">Name Your Company</h1>
            <p className="text-gray-500 text-sm">
              What would you like to name your company? You can change this later.
            </p>
          </div>
          <div className="mb-6">
            <Label className="text-gray-700 dark:text-gray-100">Company Name</Label>
            <Input
              type="text"
              className="my-2"
              placeholder="e.g. JobHunt, Microsoft"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              onClick={() => navigate('/admin/companies')}
            >
              Cancel
            </Button>
            <Button
              className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white px-6 py-2 rounded-md"
              onClick={registerNewCompany}
            >
              Continue
            </Button>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default CompanyCreate;
