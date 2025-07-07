import React from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Badge } from './ui/badge'
import { useSelector } from 'react-redux'
import Chat from './shared/Chat'
import { Button } from './ui/button'

const AppliedJobTable = () => {
    const {allAppliedJobs} = useSelector(store=>store.job);
    const {user, token} = useSelector(store=>store.auth);
    const [chatOpen, setChatOpen] = React.useState(false);
    const [chatProps, setChatProps] = React.useState(null);
    return (
        <div>
            {chatOpen && chatProps && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <Chat {...chatProps} onClose={() => setChatOpen(false)} />
                </div>
            )}
            <Table>
                <TableCaption>A list of your applied jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Job Role</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                        <TableHead>Chat</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        allAppliedJobs.length <= 0 ? <span>You haven't applied any job yet.</span> :
                        allAppliedJobs.filter(appliedJob => appliedJob.job && appliedJob.job.title).length === 0 ?
                            <span>You haven't applied any job yet.</span> :
                        allAppliedJobs.filter(appliedJob => appliedJob.job && appliedJob.job.title).map((appliedJob) => (
                            <TableRow key={appliedJob._id}>
                                <TableCell>{appliedJob?.createdAt?.split("T")[0]}</TableCell>
                                <TableCell>{appliedJob.job?.title}</TableCell>
                                <TableCell>{appliedJob.job?.company?.name}</TableCell>
                                <TableCell className="text-right"><Badge className={`${appliedJob?.status === "rejected" ? 'bg-red-400' : appliedJob.status === 'pending' ? 'bg-gray-400' : 'bg-green-400'}`}>{appliedJob.status.toUpperCase()}</Badge></TableCell>
                                <TableCell>
                                    {appliedJob.status.toLowerCase() === 'accepted' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setChatProps({
                                                    applicationId: appliedJob._id,
                                                    jobId: appliedJob.job?._id,
                                                    currentUser: user,
                                                    chatPartner: appliedJob.job?.created_by, // recruiter user object if available
                                                    jwtToken: token, // Always use latest token from Redux
                                                    job: appliedJob.job // Pass job for company info
                                                });
                                                setChatOpen(true);
                                            }}
                                        >
                                            Chat
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AppliedJobTable