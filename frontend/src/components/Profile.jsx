import React, { useState } from 'react';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { Avatar, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Contact, Mail, Pen } from 'lucide-react';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import AppliedJobTable from './AppliedJobTable';
import UpdateProfileDialog from './UpdateProfileDialog';
import { useSelector } from 'react-redux';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';

const isResume = true;

const Profile = () => {
  useGetAppliedJobs();
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navbar />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto mt-[70px] mb-[70px] px-4">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
          <div className='flex justify-between'>
            <div className='flex items-center gap-4'>
              <Avatar className="h-24 w-24 rounded-lg">
                <AvatarImage
                  src={user?.profile?.profilePhoto || "https://www.shutterstock.com/image-vector/circle-line-simple-design-logo-600nw-2174926871.jpg"}
                  alt="profile"
                  className="h-full w-full object-cover rounded-lg"
                />
              </Avatar>
              <div>
                <h1 className='font-medium text-xl'>{user?.fullname}</h1>
                <p>{user?.profile?.bio}</p>
              </div>
            </div>
            <Button onClick={() => setOpen(true)} className="text-right" variant="outline"><Pen /></Button>
          </div>
          <div className='my-5'>
            <div className='flex items-center gap-3 my-2'>
              <Mail />
              <span>{user?.email}</span>
            </div>
            <div className='flex items-center gap-3 my-2'>
              <Contact />
              <span>{user?.phoneNumber}</span>
            </div>
          </div>

          {user?.profile?.university && (
            <div className='my-5'>
              <h1 className='font-medium text-lg'>University/College:</h1>
              <p>{user?.profile?.university}</p>
              {user?.profile?.universityRegistrationNo && (
                <p className="text-sm text-gray-600">Reg. No.: {user?.profile?.universityRegistrationNo}</p>
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
                {isResume
                  ? <a target='blank' href={user?.profile?.resume} className='text-blue-500 w-full hover:underline cursor-pointer'>{user?.profile?.resumeOriginalName}</a>
                  : <span>NA</span>}
              </div>
            </>
          )}
        </div>

        {user?.role === 'student' && (
          <div className='max-w-4xl mx-auto bg-white rounded-2xl'>
            <h1 className='font-bold text-lg my-5'>Applied Jobs</h1>
            <AppliedJobTable />
          </div>
        )}
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40">
        <Footer />
      </div>

      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
