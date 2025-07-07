import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, AlertTriangle, Trash2 } from 'lucide-react';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/authSlice';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const DeleteAccountDialog = ({ open, setOpen }) => {
    const [step, setStep] = useState(1); // 1: email confirmation, 2: final confirmation
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleEmailSubmit = (e) => {
        e.preventDefault();
        if (formData.email.trim()) {
            setStep(2);
        } else {
            toast.error('Please enter your email address');
        }
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.password.trim()) {
            toast.error('Please enter your password');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`${USER_API_END_POINT}/delete-account`, formData, {
                withCredentials: true
            });

            if (response.data.success) {
                toast.success('Account deleted successfully');
                dispatch(logout());
                setOpen(false);
                navigate('/');
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to delete account');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setStep(1);
        setFormData({ email: '', password: '' });
        setOpen(false);
    };

    const handleBack = () => {
        setStep(1);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-900 dark:text-gray-100">
                <DialogHeader className="text-center pb-6">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                            <Trash2 className="h-8 w-8 text-red-600" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        Delete Account
                    </DialogTitle>
                    <p className="text-gray-500 dark:text-gray-300 mt-2">
                        {step === 1 
                            ? "This action cannot be undone. Please enter your email to continue."
                            : "Final confirmation required. Please enter your password to permanently delete your account."
                        }
                    </p>
                </DialogHeader>

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900 dark:border-red-700">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-800 dark:text-red-200">
                                        <p className="font-medium mb-1">Warning: This action is irreversible</p>
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Your account will be permanently deleted</li>
                                            <li>All your data will be lost</li>
                                            <li>You will be logged out immediately</li>
                                            <li>This action cannot be undone</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="h-11 border-gray-200 focus:border-red-500 focus:ring-red-500 dark:bg-gray-900"
                                    placeholder="Enter your email address"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            >
                                Continue
                            </Button>
                        </DialogFooter>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleFinalSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900 dark:border-red-700">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <div className="text-sm text-red-800 dark:text-red-200">
                                        <p className="font-medium mb-1">Final Confirmation</p>
                                        <p>You are about to permanently delete your account. This action cannot be undone.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    className="h-11 border-gray-200 bg-gray-50 dark:bg-gray-900"
                                    disabled
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-100">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="h-11 border-gray-200 focus:border-red-500 focus:ring-red-500 dark:bg-gray-900"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleBack}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete Account
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default DeleteAccountDialog; 