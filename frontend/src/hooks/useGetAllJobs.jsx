import { setAllJobs, setBrowseJobs } from '@/redux/jobSlice'
import { JOB_API_END_POINT } from '@/utils/constant'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const useGetAllJobs = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(()=>{
        const fetchAllJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setAllJobs(res.data.jobs));
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }
        fetchAllJobs();
    },[dispatch])
    return { loading, error };
}

export const useGetBrowseJobs = () => {
    const dispatch = useDispatch();
    const {searchedQuery} = useSelector(store=>store.job);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    useEffect(()=>{
        const fetchJobs = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get?keyword=${searchedQuery}`);
                if(res.data.success){
                    dispatch(setBrowseJobs(res.data.jobs));
                }
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        }
        fetchJobs();
    },[searchedQuery, dispatch])
    return { loading, error };
}

export default useGetAllJobs