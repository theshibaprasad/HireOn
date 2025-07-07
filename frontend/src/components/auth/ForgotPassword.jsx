import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { USER_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/forgot-password`, { email });
            if (res.data.success) {
                toast.success('Password reset link sent to your email');
                setEmail('');
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
                        Forgot Password? 🔑
                    </h1>
                    <p className='text-gray-600 text-center mb-6'>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>

                    <div className='my-3'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="example@example.com"
                        />
                    </div>

                    <Button
                        type="submit"
                        className='w-full mt-4'
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending Reset Link
                            </>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;