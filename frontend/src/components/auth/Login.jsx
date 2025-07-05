import React, { useEffect, useState } from 'react';
import Navbar from '../shared/Navbar';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setUser } from '@/redux/authSlice';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const { loading, user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        } finally {
            dispatch(setLoading(false));
        }
    }

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, []);

    return (
        <div>
            <Navbar />
            <motion.div 
                className='flex items-center justify-center max-w-7xl mx-auto min-h-[90vh]'
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <form onSubmit={submitHandler} className='w-full sm:w-2/3 md:w-1/2 border border-gray-200 rounded-2xl p-6 bg-white shadow-lg'>
                    <h1 className='font-bold text-2xl mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text'>Welcome Back! 👋</h1>

                    <div className='my-3'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="example@example.com"
                        />
                    </div>

                    <div className='my-3'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="password"
                        />
                    </div>

                    <div className='my-5'>
                        <Label className='mb-2 block'>Select Your Role</Label>
                        <RadioGroup className="flex flex-wrap gap-4">
                            {['student', 'university', 'recruiter'].map((role, idx) => (
                                <div key={idx} className="flex items-center space-x-2">
                                    <Input
                                        type="radio"
                                        name="role"
                                        value={role}
                                        checked={input.role === role}
                                        onChange={changeEventHandler}
                                        className="cursor-pointer"
                                    />
                                    <Label>{role.charAt(0).toUpperCase() + role.slice(1)}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {
                        loading ? (
                            <Button className="w-full my-4"> 
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait 
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4 bg-[#6A38C2] hover:bg-[#5b30a6]">Login</Button>
                        )
                    }

                    <span className='text-sm text-center block'>Don't have an account? <Link to="/signup" className='text-blue-600'>Signup</Link></span>
                </form>
            </motion.div>
        </div>
    );
}

export default Login;
