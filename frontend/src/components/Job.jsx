import React from 'react'
import { Button } from './ui/button'
import { Bookmark } from 'lucide-react'
import { Avatar, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';
import { setSavedJobs } from '@/redux/jobSlice';

const Job = ({job}) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, savedJobs } = useSelector(store => ({
        user: store.auth.user,
        savedJobs: store.job.savedJobs || [],
    }));
    const isSaved = savedJobs.some(j => j._id === job._id);

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference/(1000*24*60*60));
    }
    
    const handleSave = async () => {
        if (!user) {
            toast.error('Login to save jobs for later!');
            return;
        }
        try {
            const res = await axios.post(`${JOB_API_END_POINT}/save/${job._id}`, {}, { withCredentials: true });
            if (res.data.success) {
                toast.success('Job saved for later!');
                // Fetch updated saved jobs
                const savedRes = await axios.get(`${JOB_API_END_POINT}/saved`, { withCredentials: true });
                if (savedRes.data.success) {
                    dispatch(setSavedJobs(savedRes.data.jobs));
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save job');
        }
    };
    const handleUnsave = async () => {
        try {
            const res = await axios.delete(`${JOB_API_END_POINT}/unsave/${job._id}`, { withCredentials: true });
            if (res.data.success) {
                toast.success('Job removed from saved!');
                // Fetch updated saved jobs
                const savedRes = await axios.get(`${JOB_API_END_POINT}/saved`, { withCredentials: true });
                if (savedRes.data.success) {
                    dispatch(setSavedJobs(savedRes.data.jobs));
                }
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to unsave job');
        }
    };

    return (
        <div className='flex flex-col justify-between h-full min-h-[340px] p-5 rounded-md shadow-xl bg-white border border-gray-100 dark:bg-gray-900 dark:border-gray-800 transition-colors'>
            <div>
                <div className='flex items-center justify-between'>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                </div>

                <div className='flex items-center gap-2 my-2'>
                    <Button className="p-6" variant="outline" size="icon">
                        <Avatar>
                            <AvatarImage src={job?.company?.logo} />
                        </Avatar>
                    </Button>
                    <div>
                        <h1 className='font-medium text-lg dark:text-white'>{job?.company?.name}</h1>
                        <p className='text-sm text-gray-500 dark:text-gray-400'>India</p>
                    </div>
                </div>

                <div>
                    <h1 className='font-bold text-lg my-2 dark:text-white'>{job?.title}</h1>
                    <p className='text-sm text-gray-600 dark:text-gray-300 line-clamp-3'>{job?.description}</p>
                </div>
                <div className='flex items-center gap-2 mt-4'>
                    <Badge className={'text-blue-700 font-bold dark:text-blue-300'} variant="ghost">{job?.position} Positions</Badge>
                    <Badge className={'text-[#F83002] font-bold dark:text-red-400'} variant="ghost">{job?.jobType}</Badge>
                    <Badge className={'text-[#7209b7] font-bold dark:text-purple-300'} variant="ghost">{job?.salary}LPA</Badge>
                </div>
            </div>
            <div className='flex items-center gap-4 mt-4'>
                <Button onClick={()=> navigate(`/description/${job?._id}`)} variant="outline" className="dark:bg-gray-800 dark:border-gray-700 dark:text-white">Details</Button>
                {user && isSaved ? (
                  <Button onClick={handleUnsave} className="bg-green-600 dark:bg-green-700 dark:text-white">Saved ✓</Button>
                ) : (
                  <Button onClick={handleSave} className="bg-[#7209b7] dark:bg-purple-700 dark:text-white">Save For Later</Button>
                )}
            </div>
        </div>
    )
}

export default Job