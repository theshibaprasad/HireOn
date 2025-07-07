import React, { useState, useEffect } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Contact, Mail, Pen, Eye, FileText, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import AppliedJobTable from './AppliedJobTable';
import UpdateProfileDialog from './UpdateProfileDialog';
import ProfileImagePopup from './ProfileImagePopup';
import DeleteAccountDialog from './DeleteAccountDialog';
import ChangePasswordDialog from './ChangePasswordDialog';
import { useSelector, useDispatch } from 'react-redux';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
import { setSavedJobs } from '@/redux/jobSlice';
import axios from 'axios';
import { JOB_API_END_POINT } from '@/utils/constant';
import Job from './Job';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const dispatch = useDispatch();
  const { savedJobs } = useSelector(store => store.job);
  const { user } = useSelector(store => store.auth);
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const [imagePopupOpen, setImagePopupOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const navigate = useNavigate();
  
  // Debug logging
  console.log('Profile component - user:', user);
  console.log('Profile component - profilePhoto:', user?.profile?.profilePhoto);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/saved`, { withCredentials: true });
        if (res.data.success) {
          dispatch(setSavedJobs(res.data.jobs));
        }
      } catch (err) {
        // Optionally show error
      }
    };
    fetchSavedJobs();
  }, [dispatch, user]);

  const handleImageClick = () => {
    setImagePopupOpen(true);
  };

  const handleUpdateProfile = () => {
    setImagePopupOpen(false);
    setOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto mt-[70px] mb-[70px] px-4">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl my-5 p-8">
                      <div className='flex justify-between'>
              <div className='flex items-center gap-4'>
                <div 
                  className="relative group cursor-pointer"
                  onClick={handleImageClick}
                >
                  <Avatar className="h-24 w-24 rounded-lg transition-transform duration-200 group-hover:scale-105">
                    <AvatarImage
                      src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"}
                      alt="profile"
                      className="h-full w-full object-cover rounded-lg"
                      onLoad={() => console.log('Profile image loaded:', user?.profile?.profilePhoto)}
                      onError={(e) => console.error('Profile image error:', e.target.src)}
                    />
                  </Avatar>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="text-white text-center">
                      <Eye className="h-6 w-6 mx-auto mb-1" />
                      <span className="text-xs">View Image</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h1 className='font-medium text-xl'>{user?.fullname}</h1>
                  <p>{user?.profile?.bio}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setOpen(true)} variant="outline">
                  <Pen className="h-4 w-4" />
                </Button>
                <Button onClick={() => setChangePasswordOpen(true)} variant="outline">
                  Change Password
                </Button>
                <Button 
                  onClick={() => setDeleteAccountOpen(true)} 
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 dark:hover:bg-red-900 dark:hover:border-red-500 dark:text-red-400"
                >
                  <Trash2 className="h-4 w-4 dark:text-red-400" />
                </Button>
              </div>
            </div>
          
          <div className='my-5'>
            <div className='flex items-center gap-3 my-2'>
              <Mail className="dark:text-gray-200" />
              <span className="dark:text-gray-100">{user?.email}</span>
            </div>
            <div className='flex items-center gap-3 my-2'>
              <Contact className="dark:text-gray-200" />
              <span className="dark:text-gray-100">{user?.phoneNumber}</span>
            </div>
          </div>

          {user?.profile?.university && (
            <div className='my-5'>
              <h1 className='font-medium text-lg dark:text-gray-100'>University/College:</h1>
              <p className="dark:text-gray-100">{user?.profile?.university}</p>
              {user?.profile?.universityRegistrationNo && (
                <p className="text-sm text-gray-600 dark:text-gray-400">Reg. No.: {user?.profile?.universityRegistrationNo}</p>
              )}
            </div>
          )}

          {user?.role === 'student' && (
            <>
              <div className='my-5'>
                <h1>Skills</h1>
                <div className='flex items-center gap-1'>
                  {user?.profile?.skills?.length !== 0
                    ? user?.profile?.skills.map((item, index) => <Badge key={index}>{item}</Badge>)
                    : <span>NA</span>}
                </div>
              </div>
              <div className='grid w-full max-w-sm items-center gap-1.5'>
                <Label className="text-md font-bold">Resume</Label>
                {user?.profile?.resume ? (
                  <div className="flex items-center gap-2 mt-2">
                    <a
                      href={user.profile.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 border border-blue-500 text-blue-600 rounded hover:bg-blue-50 transition font-medium"
                      title={user.profile.resumeOriginalName || 'View Resume'}
                    >
                      <FileText className="h-4 w-4 text-blue-500" />
                      <span>{user.profile.resumeOriginalName || 'View Resume'}</span>
                    </a>
                  </div>
                ) : (
                  <span className="text-gray-500">No resume uploaded</span>
                )}
              </div>
            </>
          )}
        </div>

        {user?.role === 'student' && (
          <div className='max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-2xl'>
            <h1 className='font-bold text-lg my-5 dark:text-gray-100'>Applied Jobs</h1>
            <AppliedJobTable />
          </div>
        )}

        {user?.role === 'student' && (
          <div className="mt-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Saved Jobs</h2>
            {savedJobs && savedJobs.length > 0 ? (
              <div className="w-full max-w-5xl px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-center">
                {savedJobs.map(job => (
                  <div key={job._id} className="relative rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow p-4 flex flex-col min-h-[170px] transition hover:shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <img src={job.company?.logo} alt="logo" className="h-10 w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" />
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">{job.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{job.company?.name}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-2 mb-2 font-normal">{job.description}</p>
                    <div className="flex items-center gap-2 mt-auto mb-2">
                      <span className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded text-xs font-medium">{job.position} Positions</span>
                      <span className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200 px-2 py-0.5 rounded text-xs font-medium">{job.salary} LPA</span>
                    </div>
                    <div className="flex gap-2 mt-auto justify-end items-center">
                      <button
                        onClick={() => navigate(`/description/${job._id}`)}
                        className="flex-1 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold py-2 rounded transition hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Details
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await axios.delete(`${JOB_API_END_POINT}/unsave/${job._id}`, { withCredentials: true });
                            // Refetch saved jobs
                            const res = await axios.get(`${JOB_API_END_POINT}/saved`, { withCredentials: true });
                            if (res.data.success) {
                              dispatch(setSavedJobs(res.data.jobs));
                            }
                          } catch (err) {}
                        }}
                        className="ml-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-full p-1 z-10"
                        title="Remove from saved"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-gray-500">No saved jobs found.</span>
            )}
          </div>
        )}
      </div>

      {/* Unfixed Footer */}
      <Footer />

      <UpdateProfileDialog open={open} setOpen={setOpen} />
      <DeleteAccountDialog open={deleteAccountOpen} setOpen={setDeleteAccountOpen} />
      <ChangePasswordDialog open={changePasswordOpen} setOpen={setChangePasswordOpen} />
      <ProfileImagePopup 
        open={imagePopupOpen} 
        setOpen={setImagePopupOpen}
        profileImage={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"}
        onUpdateProfile={handleUpdateProfile}
      />
    </div>
  );
};

export default Profile;
