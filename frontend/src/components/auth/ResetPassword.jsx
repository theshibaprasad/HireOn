import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { USER_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword = () => {
    const [passwords, setPasswords] = useState({
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token } = useParams();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setPasswords(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!passwords.password || !passwords.confirmPassword) {
            toast.error('Please fill all fields');
            return;
        }

        if (passwords.password !== passwords.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/reset-password/${token}`, {
                password: passwords.password
            });
            if (res.data.success) {
                toast.success('Password reset successful');
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <Navbar />
            <motion.div
                className='flex items-center justify-center max-w-7xl mx-auto min-h-[90vh]'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <form onSubmit={handleSubmit} className='w-full sm:w-2/3 md:w-1/2 border border-gray-200 rounded-2xl p-6 bg-white shadow-lg'>
                    <h1 className='font-bold text-2xl mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text'>
                        Reset Password 🔒
                    </h1>

                    <div className='my-3 relative'>
                        <Label>New Password</Label>
                        <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={passwords.password}
                            onChange={handleChange}
                            placeholder="Enter new password"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className='my-3 relative'>
                        <Label>Confirm Password</Label>
                        <Input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm new password"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                            tabIndex={-1}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    <Button
                        type="submit"
                        className='w-full mt-4'
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Resetting Password
                            </>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ResetPassword;