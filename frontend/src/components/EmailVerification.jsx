import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

const EmailVerification = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const hasVerified = useRef(false); // Prevent double effect

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                if (hasVerified.current) return;
                hasVerified.current = true;
                console.log('Attempting to verify email with token:', token);
                console.log('API endpoint:', `${USER_API_END_POINT}/verify-email/${token}`);
                
                const response = await axios.get(`${USER_API_END_POINT}/verify-email/${token}`);
                
                console.log('Verification response:', response.data);
                
                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message);
                    // Redirect to login page after 3 seconds
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(response.data.message);
                }
            } catch (error) {
                console.error('Verification error:', error);
                console.error('Error response:', error.response?.data);
                setStatus('error');
                setMessage(error.response?.data?.message || 'Verification failed. Please try again.');
            }
        };

        if (token) {
            verifyEmail();
        }
    }, [token, navigate]);

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {status === 'verifying' && (
                    <div className="space-y-4">
                        <div className="flex justify-center">
                            <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Verifying Your Email</h1>
                        <p className="text-gray-600">Please wait while we verify your email address...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <CheckCircle className="h-16 w-16 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Email Verified!</h1>
                        <p className="text-gray-600">{message}</p>
                        <div className="space-y-3">
                            <Button 
                                onClick={handleGoToLogin}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                Go to Login
                            </Button>
                            <p className="text-sm text-gray-500">
                                Redirecting automatically in a few seconds...
                            </p>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <XCircle className="h-16 w-16 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Verification Failed</h1>
                        <p className="text-gray-600">{message}</p>
                        <div className="space-y-3">
                            <Button 
                                onClick={handleGoToLogin}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                            >
                                Go to Login
                            </Button>
                            <Button 
                                onClick={handleGoHome}
                                variant="outline"
                                className="w-full"
                            >
                                Go to Home Page
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmailVerification; 