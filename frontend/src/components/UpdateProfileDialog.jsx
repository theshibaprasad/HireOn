import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const [universities, setUniversities] = useState([]);
    const { user } = useSelector((store) => store.auth);

    const [input, setInput] = useState({
        fullname: user?.fullname || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        university: user?.profile?.university?.universityID || '',
        universityRegistrationNo: user?.profile?.universityRegistrationNo || '',
        bio: user?.profile?.bio || '',
        skills: user?.profile?.skills?.join(', ') || '',
        file: user?.profile?.resume || '',
    });
    const dispatch = useDispatch();

    // Fetch universities where user.role === 'university'
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const res = await axios.get(`${USER_API_END_POINT}/universities`, {
                    withCredentials: true,
                });
                if (res.data.success) {
                    setUniversities(res.data.universities);
                }
            } catch (error) {
                console.error('Error fetching universities:', error);
                toast.error('Failed to load universities');
            }
        };
        fetchUniversities();
    }, []);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const fileChangeHandler = (e) => {
        const file = e.target.files?.[0];
        setInput({ ...input, file });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('fullname', input.fullname);
        formData.append('email', input.email);
        formData.append('phoneNumber', input.phoneNumber);
        formData.append('university', input.university);
        formData.append('universityRegistrationNo', input.universityRegistrationNo);
        formData.append('bio', input.bio);
        formData.append('skills', input.skills);
        if (input.file) {
            formData.append('file', input.file);
        }

        try {
            setLoading(true);
            const res = await axios.post(`${USER_API_END_POINT}/profile/update`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Profile</DialogTitle>
                </DialogHeader>
                <form onSubmit={submitHandler}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                name="fullname"
                                type="text"
                                value={input.fullname}
                                onChange={changeEventHandler}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={input.email}
                                onChange={changeEventHandler}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="number" className="text-right">Number</Label>
                            <Input
                                id="number"
                                name="phoneNumber"
                                value={input.phoneNumber}
                                onChange={changeEventHandler}
                                className="col-span-3"
                            />
                        </div>
                        {user?.role === 'student' && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="university" className="text-right">University</Label>
                                    <select
                                        id="university"
                                        name="university"
                                        value={input.university}
                                        onChange={changeEventHandler}
                                        className="col-span-3 border rounded px-2 py-1"
                                    >
                                        <option value="">Select a university/college</option>
                                        {universities.map((university) => (
                                            <option key={university._id} value={university.fullname}>
                                                {university.fullname}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="universityRegistrationNo" className="text-right">University Reg. No.</Label>
                                    <Input
                                        id="universityRegistrationNo"
                                        name="universityRegistrationNo"
                                        value={input.universityRegistrationNo}
                                        onChange={changeEventHandler}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="bio" className="text-right">Bio</Label>
                                    <Input
                                        id="bio"
                                        name="bio"
                                        value={input.bio}
                                        onChange={changeEventHandler}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="skills" className="text-right">Skills</Label>
                                    <Input
                                        id="skills"
                                        name="skills"
                                        value={input.skills}
                                        onChange={changeEventHandler}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="file" className="text-right">Resume</Label>
                                    <Input
                                        id="file"
                                        name="file"
                                        type="file"
                                        accept="application/pdf"
                                        onChange={fileChangeHandler}
                                        className="col-span-3"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        {loading ? (
                            <Button className="w-full my-4">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full my-4">Update</Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateProfileDialog;
