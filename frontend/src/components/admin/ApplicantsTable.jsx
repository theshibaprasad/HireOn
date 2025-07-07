import React, { useState } from 'react';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Pencil } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { APPLICATION_API_END_POINT } from '@/utils/constant';
import axios from 'axios';
import { motion } from 'framer-motion';
import { setAllApplicants } from '@/redux/applicationSlice';
import Chat from '../shared/Chat';
import { Button } from '../ui/button';

const shortlistingStatus = ['Accepted', 'Rejected'];

const getStatusStyle = (status) => {
  switch (status) {
    case 'Accepted':
      return 'bg-green-100 text-green-800';
    case 'Rejected':
      return 'bg-red-100 text-red-800';
    case 'Pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const ApplicantsTable = () => {
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);
  const { user, token } = useSelector((store) => store.auth);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProps, setChatProps] = useState(null);

  const statusHandler = async (status, id) => {
    try {
      axios.defaults.withCredentials = true;
      const res = await axios.post(`${APPLICATION_API_END_POINT}/status/${id}/update`, { status });
      if (res.data.success) {
        const updatedApplications = applicants.applications.map((app) =>
          app._id === id ? { ...app, status } : app
        );
        dispatch(setAllApplicants({ ...applicants, applications: updatedApplications }));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="overflow-x-auto"
    >
      {chatOpen && chatProps && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <Chat {...chatProps} onClose={() => setChatOpen(false)} />
        </div>
      )}
      <Table>
        <TableCaption>A list of your recent applied users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Full Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Action</TableHead>
            <TableHead>Chat</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants?.applications?.map((item) => {
            // Normalize status to Title Case for consistent color and display
            const statusRaw = item.status || 'Pending';
            const status =
              statusRaw.charAt(0).toUpperCase() + statusRaw.slice(1).toLowerCase();
            return (
              <TableRow key={item._id}>
                <TableCell>{item?.applicant?.fullname}</TableCell>
                <TableCell>{item?.applicant?.email}</TableCell>
                <TableCell>{item?.applicant?.phoneNumber}</TableCell>
                <TableCell>
                  {item.applicant?.profile?.resume ? (
                    <div className="flex gap-2 items-center">
                      <a
                        href={item.applicant.profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <span>NA</span>
                  )}
                </TableCell>
                <TableCell>
                  {item?.applicant?.createdAt
                    ? item.applicant.createdAt.split('T')[0]
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(
                      status
                    )}`}
                  >
                    {status}
                  </span>
                </TableCell>
                <TableCell className="float-right cursor-pointer">
                  <Popover>
                    <PopoverTrigger>
                      <div className="p-2 border border-gray-300 rounded-md hover:border-blue-500 transition-colors">
                        <Pencil className="w-4 h-4 text-gray-600 hover:text-blue-600" />
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-32">
                      {shortlistingStatus.map((status, index) => (
                        <div
                          key={index}
                          onClick={() => statusHandler(status, item?._id)}
                          className="flex w-fit items-center my-2 cursor-pointer hover:text-blue-600"
                        >
                          <span>{status}</span>
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  {status.toLowerCase() === 'accepted' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setChatProps({
                          applicationId: item._id,
                          jobId: item.job,
                          currentUser: user,
                          chatPartner: item.applicant,
                          jwtToken: token,
                          job: applicants.job
                        });
                        setChatOpen(true);
                      }}
                    >
                      Chat
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default ApplicantsTable;
