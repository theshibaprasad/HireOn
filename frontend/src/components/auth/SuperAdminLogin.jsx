import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

const SuperAdminLogin = () => {
  const [input, setInput] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const changeHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${USER_API_END_POINT}/login`, { ...input, role: 'superadmin' }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });
      if (res.data.success && res.data.user.role === 'superadmin') {
        toast.success('Welcome, Super Admin!');
        navigate('/superadmin/dashboard');
      } else {
        toast.error('Not authorized as Super Admin.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <form onSubmit={submitHandler} className="w-full max-w-md border border-gray-200 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-gray-900 shadow-lg">
        <h1 className="font-bold text-2xl mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">Super Admin Login</h1>
        <div className="my-4">
          <Label>Email</Label>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeHandler}
            placeholder="superadmin@hireon.com"
            required
          />
        </div>
        <div className="my-4">
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            value={input.password}
            onChange={changeHandler}
            placeholder="Password"
            required
          />
        </div>
        <Button type="submit" className="w-full my-4 bg-[#6A38C2] hover:bg-[#5b30a6]" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>
    </div>
  );
};

export default SuperAdminLogin; 