import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Avatar, AvatarFallback } from '../ui/avatar';
import Modal from '../ui/Modal';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../ui/table';

const API_BASE = '/api/v1/user';

const SuperAdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [msgSearch, setMsgSearch] = useState('');

  const fetchUsers = async (role = '') => {
    setLoading(true);
    setFetchError("");
    try {
      const res = await axios.get(`${API_BASE}/all${role ? `?role=${role}` : ''}`);
      console.log("Fetched users:", res.data.users);
      if (res.data.success) setUsers(res.data.users);
    } catch (err) {
      setFetchError("Failed to fetch users");
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    setMsgLoading(true);
    try {
      const res = await axios.get('/api/v1/user/contact');
      if (res.data.success) setMessages(res.data.messages);
    } catch (err) {
      toast.error('Failed to fetch messages');
    } finally {
      setMsgLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(roleFilter);
    fetchMessages();
    // eslint-disable-next-line
  }, [roleFilter]);

  const handleVerify = async (id) => {
    try {
      await axios.patch(`${API_BASE}/verify/${id}`);
      toast.success('Recruiter verified and email sent');
      fetchUsers(roleFilter);
    } catch (err) {
      toast.error('Failed to verify recruiter');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      toast.success('User deleted and email sent');
      fetchUsers(roleFilter);
    } catch (err) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await axios.delete(`/api/v1/user/contact/${id}`);
      toast.success('Message deleted');
      fetchMessages();
    } catch (err) {
      toast.error('Failed to delete message');
    }
  };

  // Summary stats
  const totalUsers = users.length;
  const totalRecruiters = users.filter(u => u.role === 'recruiter').length;
  const pendingRecruiters = users.filter(u => u.role === 'recruiter' && !u.isVerified).length;
  const totalMessages = messages.length;

  // Filtered users/messages
  const filteredUsers = users.filter(u =>
    (!userSearch || u.fullname.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
  );
  const filteredMessages = messages.filter(m =>
    (!msgSearch || m.name.toLowerCase().includes(msgSearch.toLowerCase()) || m.email.toLowerCase().includes(msgSearch.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-56 bg-gradient-to-b from-purple-700 to-blue-700 text-white flex flex-col py-8 px-4 min-h-screen">
        <h2 className="text-2xl font-bold mb-8 text-center">Super Admin</h2>
        <nav className="flex flex-col gap-4">
          <a href="#users" className="hover:bg-purple-800 rounded px-3 py-2 transition">Users</a>
          <a href="#messages" className="hover:bg-purple-800 rounded px-3 py-2 transition">Messages</a>
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold text-purple-600">{totalUsers}</span>
            <span className="mt-2 text-gray-600 dark:text-gray-300">Total Users</span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-600">{totalRecruiters}</span>
            <span className="mt-2 text-gray-600 dark:text-gray-300">Recruiters</span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold text-yellow-500">{pendingRecruiters}</span>
            <span className="mt-2 text-gray-600 dark:text-gray-300">Pending Recruiters</span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col items-center">
            <span className="text-3xl font-bold text-green-600">{totalMessages}</span>
            <span className="mt-2 text-gray-600 dark:text-gray-300">Messages</span>
          </div>
        </div>
        {/* Users Section */}
        <section id="users" className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h1 className="text-2xl font-bold">Users</h1>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="border rounded px-3 py-2 dark:bg-gray-900 dark:text-gray-100"
              />
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="border rounded px-3 py-2 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchError && (
                  <TableRow><TableCell colSpan={6} className="text-center text-red-600 dark:text-red-400 font-bold">{fetchError}</TableCell></TableRow>
                )}
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredUsers.length === 0 && !fetchError ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">No users found.</TableCell></TableRow>
                ) : (
                  filteredUsers.map(user => (
                    <TableRow key={user._id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      <TableCell>
                        <Avatar>
                          <AvatarFallback>{user.fullname ? user.fullname.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() : '?'}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>{user.fullname}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'superadmin' ? 'secondary' : user.role === 'recruiter' ? 'outline' : 'default'}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.role === 'recruiter' ? (
                          user.isVerified ? <Badge className="bg-green-600 text-white">Verified</Badge> : <Badge className="bg-yellow-500 text-white">Pending</Badge>
                        ) : (
                          user.isVerified ? <Badge className="bg-green-600 text-white">Yes</Badge> : <Badge className="bg-red-600 text-white">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {user.role === 'recruiter' && !user.isVerified && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" title="Verify Recruiter" onClick={() => handleVerify(user._id)}>Verify</Button>
                        )}
                        {user.role !== 'superadmin' && (
                          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" title="Delete User" onClick={() => handleDelete(user._id)}>Delete</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
        {/* Messages Section */}
        <section id="messages">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
            <h2 className="text-2xl font-bold">Contact Messages</h2>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={msgSearch}
                onChange={e => setMsgSearch(e.target.value)}
                className="border rounded px-3 py-2 dark:bg-gray-900 dark:text-gray-100"
              />
              <Button size="sm" variant="outline" onClick={fetchMessages} disabled={msgLoading} title="Refresh messages">
                {msgLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-xl shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {msgLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8">No messages found.</TableCell></TableRow>
                ) : (
                  filteredMessages.map(msg => (
                    <TableRow key={msg._id} className="hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                      <TableCell>{msg.name}</TableCell>
                      <TableCell>{msg.email}</TableCell>
                      <TableCell><Badge>{msg.role ? (msg.role.charAt(0).toUpperCase() + msg.role.slice(1)) : 'Unknown'}</Badge></TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => setSelectedMsg(msg)} title="View Full Message">View</Button>
                      </TableCell>
                      <TableCell>{new Date(msg.createdAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" title="Delete Message" onClick={() => handleDeleteMessage(msg._id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>
        {/* Modal for full message view */}
        <Modal open={!!selectedMsg} onClose={() => setSelectedMsg(null)}>
          {selectedMsg && (
            <div className="p-4 max-w-lg mx-auto bg-gray-900 dark:bg-gray-950 rounded-xl border border-gray-800">
              <h3 className="text-xl font-bold mb-2 text-[#6A38C2] dark:text-purple-300">Message from {selectedMsg.name}</h3>
              <div className="mb-2 flex flex-col gap-1">
                <span className="font-semibold text-gray-200">Email:</span>
                <span className="text-gray-100">{selectedMsg.email}</span>
              </div>
              <div className="mb-2 flex flex-col gap-1">
                <span className="font-semibold text-gray-200">Role:</span>
                <span className="text-gray-100">{selectedMsg.role}</span>
              </div>
              <div className="mb-2 flex flex-col gap-1">
                <span className="font-semibold text-gray-200">Date:</span>
                <span className="text-gray-100">{new Date(selectedMsg.createdAt).toLocaleString()}</span>
              </div>
              <div className="bg-gray-800 dark:bg-gray-900 rounded-lg p-4 mt-4 border border-gray-700">
                <span className="block text-lg font-semibold text-gray-100 mb-2">Message:</span>
                <p className="text-gray-100 whitespace-pre-line break-words">{selectedMsg.message}</p>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
};

export default SuperAdminDashboard; 