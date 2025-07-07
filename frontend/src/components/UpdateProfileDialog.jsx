import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader2, Camera, X, FileText, User, Mail, Phone, GraduationCap, BookOpen, FileText as FileTextIcon } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { USER_API_END_POINT } from '@/utils/constant';
import { setUser } from '@/redux/authSlice';
import { toast } from 'sonner';
import { Avatar, AvatarImage } from './ui/avatar';

const RESUME_UPLOAD_ENDPOINT = '/api/upload-resume';

const UpdateProfileDialog = ({ open, setOpen }) => {
    const [loading, setLoading] = useState(false);
    const [universities, setUniversities] = useState([]);
    const [universityError, setUniversityError] = useState('');
    const { user } = useSelector((store) => store.auth);

    const [input, setInput] = useState({
        fullname: user?.fullname || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        university: user?.profile?.university?.universityID || '',
        universityRegistrationNo: user?.profile?.universityRegistrationNo || '',
        bio: user?.profile?.bio || '',
        skills: user?.profile?.skills?.join(', ') || '',
        resume: user?.profile?.resume || '',
        profileImage: null,
    });
    const [previewImage, setPreviewImage] = useState(user?.profile?.profilePhoto || null);
    const [selectedResumeName, setSelectedResumeName] = useState(user?.profile?.resumeOriginalName || '');
    const dispatch = useDispatch();
    const [resumeUploading, setResumeUploading] = useState(false);
    const [resumeUploadError, setResumeUploadError] = useState('');
    const [showPDF, setShowPDF] = useState(false);

    // Fetch universities where user.role === 'university'
    useEffect(() => {
        const fetchUniversities = async () => {
            try {
                const res = await axios.get(`${USER_API_END_POINT}/universities`, {
                    withCredentials: true,
                });
                if (res.data.success) {
                    setUniversities(res.data.universities);
                    setUniversityError('');
                }
            } catch (error) {
                console.error('Error fetching universities:', error);
                setUniversityError('Failed to load universities. You can still type your university name.');
            }
        };
        fetchUniversities();
    }, []);

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setInput({
                fullname: user?.fullname || '',
                email: user?.email || '',
                phoneNumber: user?.phoneNumber || '',
                university: user?.profile?.university || '',
                universityRegistrationNo: user?.profile?.universityRegistrationNo || '',
                bio: user?.profile?.bio || '',
                skills: user?.profile?.skills?.join(', ') || '',
                resume: null,
                profileImage: null,
            });
            setPreviewImage(user?.profile?.profilePhoto || null);
            setSelectedResumeName(user?.profile?.resumeOriginalName || '');
        } else {
            // Clean up object URL when dialog closes
            if (previewImage && previewImage.startsWith('blob:')) {
                URL.revokeObjectURL(previewImage);
            }
        }
    }, [open, user]);

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    };

    const resumeChangeHandler = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (file.type !== 'application/pdf') {
                toast.error('Please select a PDF file');
                return;
            }
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                toast.error('Resume size should be less than 10MB');
                return;
            }
            setResumeUploading(true);
            setResumeUploadError('');
            try {
                const formData = new FormData();
                formData.append('resume', file);
                // Upload to Google Drive
                const res = await axios.post(RESUME_UPLOAD_ENDPOINT, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true,
                });
                if (res.data.success) {
                    setInput((prev) => ({
                        ...prev,
                        resume: res.data.viewLink,
                    }));
                    setSelectedResumeName(file.name);
                    toast.success('Resume uploaded successfully!');
                } else {
                    setResumeUploadError(res.data.message || 'Upload failed');
                    toast.error(res.data.message || 'Upload failed');
                }
            } catch (err) {
                setResumeUploadError('Upload failed');
                toast.error('Upload failed');
            } finally {
                setResumeUploading(false);
            }
        }
    };

    const removeResume = () => {
        setInput({ ...input, resume: null });
        setSelectedResumeName(user?.profile?.resumeOriginalName || '');
    };

    const profileImageChangeHandler = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file');
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }

            // Update input with selected file
            setInput({ ...input, profileImage: file });
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);
            
            toast.success('Image selected successfully!');
        }
    };

    const removeProfileImage = () => {
        setInput({ ...input, profileImage: null });
        setPreviewImage(user?.profile?.profilePhoto || null);
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
        // Only send resume link/name, not file
        if (input.resume) {
            formData.append('resume', input.resume);
            formData.append('resumeOriginalName', selectedResumeName);
        }
        if (input.profileImage && input.profileImage instanceof File) {
            formData.append('profileImage', input.profileImage);
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
                if (res.data.token) {
                    dispatch(setUser({ token: res.data.token }));
                }
                toast.success(res.data.message);
                setOpen(false);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-900 dark:text-gray-100">
                <DialogHeader className="text-center pb-6">
                    <DialogTitle className="text-2xl font-bold text-gray-900">Update Profile</DialogTitle>
                    <p className="text-gray-500 mt-2">Keep your profile information up to date</p>
                </DialogHeader>
                
                <form onSubmit={submitHandler} className="space-y-6">
                    {/* Profile Image Section */}
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative group">
                            <Avatar className="h-24 w-24 rounded-full ring-4 ring-gray-100 shadow-lg">
                                <AvatarImage
                                    src={previewImage || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"}
                                    alt="profile"
                                    className="h-full w-full object-cover rounded-full"
                                    onLoad={() => console.log('Avatar image loaded:', previewImage)}
                                    onError={(e) => console.error('Avatar image error:', e.target.src)}
                                />
                            </Avatar>
                            <label htmlFor="profileImage" className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-all duration-200 shadow-lg group-hover:scale-110">
                                <Camera className="h-4 w-4" />
                            </label>
                            <input
                                id="profileImage"
                                name="profileImage"
                                type="file"
                                accept="image/*"
                                onChange={profileImageChangeHandler}
                                className="hidden"
                            />
                        </div>
                        {previewImage && previewImage !== user?.profile?.profilePhoto && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={removeProfileImage}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Remove
                            </Button>
                        )}
                    </div>

                    {/* Personal Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-500" />
                            Personal Information
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
                                <Input
                                    id="name"
                                    name="fullname"
                                    type="text"
                                    value={input.fullname}
                                    onChange={changeEventHandler}
                                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter your full name"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={input.email}
                                        onChange={changeEventHandler}
                                        className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="number" className="text-sm font-medium text-gray-700">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    id="number"
                                    name="phoneNumber"
                                    value={input.phoneNumber}
                                    onChange={changeEventHandler}
                                    className="h-11 pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>
                    </div>

                    {user?.role === 'student' && (
                        <>
                            {/* Academic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <GraduationCap className="h-5 w-5 text-green-500" />
                                    Academic Information
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="university" className="text-sm font-medium text-gray-700">University/College</Label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="university"
                                                name="university"
                                                value={input.university}
                                                onChange={changeEventHandler}
                                                className="h-11 pl-10 border border-gray-200 dark:border-gray-700 focus:border-green-500 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                                placeholder="Enter your university or college name"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="universityRegistrationNo" className="text-sm font-medium text-gray-700">Registration No.</Label>
                                        <Input
                                            id="universityRegistrationNo"
                                            name="universityRegistrationNo"
                                            value={input.universityRegistrationNo}
                                            onChange={changeEventHandler}
                                            className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                                            placeholder="Enter registration number"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="bio" className="text-sm font-medium text-gray-700">Bio</Label>
                                    <Input
                                        id="bio"
                                        name="bio"
                                        value={input.bio}
                                        onChange={changeEventHandler}
                                        className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500"
                                        placeholder="Tell us about yourself"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="skills" className="text-sm font-medium text-gray-700">Skills</Label>
                                    <div className="relative">
                                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="skills"
                                            name="skills"
                                            value={input.skills}
                                            onChange={changeEventHandler}
                                            className="h-11 pl-10 border-gray-200 focus:border-green-500 focus:ring-green-500"
                                            placeholder="e.g., JavaScript, React, Node.js"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Resume Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileTextIcon className="h-5 w-5 text-purple-500" />
                                    Resume
                                </h3>
                                
                                <div className="space-y-4">
                                    {/* Current Resume Display */}
                                    {user?.profile?.resume && (
                                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded-full">
                                                    <FileText className="h-4 w-4 text-purple-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {user?.profile?.resumeOriginalName || 'Resume.pdf'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">Current resume</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* New Resume Upload */}
                                    <div className="relative">
                                        <label 
                                            htmlFor="resume" 
                                            className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:border-purple-300"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <FileText className="w-10 h-10 mb-3 text-gray-400" />
                                                <p className="mb-2 text-sm text-gray-500 dark:text-gray-300">
                                                    <span className="font-semibold text-gray-700 dark:text-gray-100">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-300">PDF (max 10MB)</p>
                                            </div>
                                            <input
                                                id="resume"
                                                name="resume"
                                                type="file"
                                                accept="application/pdf"
                                                onChange={resumeChangeHandler}
                                                className="hidden"
                                                disabled={resumeUploading}
                                            />
                                        </label>
                                        {resumeUploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 dark:bg-gray-900 dark:bg-opacity-70 rounded-xl">
                                                <Loader2 className="animate-spin h-6 w-6 text-purple-600" />
                                                <span className="ml-2 text-purple-700">Uploading...</span>
                                            </div>
                                        )}
                                        {resumeUploadError && (
                                            <div className="absolute bottom-2 left-2 text-xs text-red-500">{resumeUploadError}</div>
                                        )}
                                    </div>
                                    
                                    {/* Selected File Name */}
                                    {selectedResumeName && input.resume && (
                                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-full">
                                                    <FileText className="h-4 w-4 text-green-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-green-800">
                                                        {selectedResumeName}
                                                    </p>
                                                    <p className="text-xs text-green-600">Ready to upload</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                    
                    <DialogFooter className="pt-6">
                        {loading ? (
                            <Button className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                Updating Profile...
                            </Button>
                        ) : (
                            <Button type="submit" className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg">
                                Update Profile
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateProfileDialog;
