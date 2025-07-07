import React, { useState, useEffect } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useSelector } from 'react-redux';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PostJob = () => {
  const [input, setInput] = useState({
    title: '',
    description: '',
    requirements: '',
    salary: '',
    location: '',
    jobType: '',
    experience: '',
    position: 0,
    companyId: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { companies } = useSelector(store => store.company);

  const changeEventHandler = e => {
    const { name, value } = e.target;
    const formattedValue = name === 'salary' ? value.replace(/[^0-9]/g, '') : value;
    setInput({ ...input, [name]: formattedValue });
  };

  const selectChangeHandler = value => {
    const selectedCompany = companies.find(company => company.name.toLowerCase() === value);
    setInput({ ...input, companyId: selectedCompany?._id });
  };

  const submitHandler = async e => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post(`${JOB_API_END_POINT}/post`, input, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/admin/jobs');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>
      <div className="pt-28 pb-10 px-4 max-w-4xl mx-auto">
        <motion.form
          onSubmit={submitHandler}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-8 border border-gray-200 dark:border-gray-800 shadow-xl rounded-3xl bg-white dark:bg-gray-900"
        >
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">Post a New Job</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Title</Label>
              <Input name="title" value={input.title} onChange={changeEventHandler} className="mt-1" />
            </div>
            <div>
              <Label>Description</Label>
              <Input name="description" value={input.description} onChange={changeEventHandler} className="mt-1" />
            </div>
            <div>
              <Label>Requirements</Label>
              <Input name="requirements" value={input.requirements} onChange={changeEventHandler} className="mt-1" />
            </div>
            <div>
              <Label>Salary (₹) in Lakhs</Label>
              <Input
                name="salary"
                value={input.salary}
                onChange={changeEventHandler}
                className="mt-1"
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
            <div>
              <Label>Location</Label>
              <Input name="location" value={input.location} onChange={changeEventHandler} className="mt-1" />
            </div>

            {/* Job Type as Dropdown */}
            <div>
              <Label>Job Type</Label>
              <Select
                onValueChange={(value) => setInput({ ...input, jobType: value })}
                value={input.jobType}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Job Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="Intern">Intern</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Experience</Label>
              <Input name="experience" value={input.experience} onChange={changeEventHandler} className="mt-1" />
            </div>
            <div>
              <Label>Open Positions</Label>
              <Input name="position" type="number" value={input.position} onChange={changeEventHandler} className="mt-1" />
            </div>

            {/* Company Select Dropdown */}
            {companies.length > 0 && (
              <div className="md:col-span-2">
                <Label>Select Company</Label>
                <Select onValueChange={selectChangeHandler}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Choose a Company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {companies.map(company => (
                        <SelectItem key={company._id} value={company.name.toLowerCase()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Submit Button */}
          {loading ? (
            <Button className="w-full mt-6">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting...
            </Button>
          ) : (
            <Button type="submit" className="bg-[#6A38C2] hover:bg-[#5b30a6] w-full mt-6">
              Post Job
            </Button>
          )}

          {/* Note if no company found */}
          {companies.length === 0 && (
            <p className="text-sm text-red-600 text-center mt-4 font-medium">
              * Please register a company first to post a job.
            </p>
          )}
        </motion.form>
      </div>
    </div>
  );
};

export default PostJob;
