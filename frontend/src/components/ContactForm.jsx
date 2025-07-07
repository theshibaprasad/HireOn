import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from './shared/Navbar';
import Footer from './shared/Footer';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';
import axios from 'axios';

const ContactForm = () => {
  const [form, setForm] = useState({ name: '', email: '', role: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setForm({
        name: user.fullname || '',
        email: user.email || '',
        role: user.role || '',
        message: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/v1/user/contact', form);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', role: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        {!user ? (
          <div className="w-full max-w-md mx-auto text-center border border-gray-200 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-gray-900 shadow-lg">
            <h2 className="font-bold text-2xl mb-4 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">Contact Us</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-200">You must be logged in to use the contact form.</p>
            <Button className="w-full bg-[#6A38C2] hover:bg-[#5b30a6]" onClick={() => navigate('/login')}>
              Login to Continue
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full max-w-lg border border-gray-200 dark:border-gray-800 rounded-2xl p-8 bg-white dark:bg-gray-900 shadow-lg">
            <h1 className="font-bold text-2xl mb-6 text-center bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text">Contact Us</h1>
            <div className="mb-4">
              <Label>Name</Label>
              <Input name="name" value={form.name} readOnly disabled className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
            </div>
            <div className="mb-4">
              <Label>Email</Label>
              <Input name="email" type="email" value={form.email} readOnly disabled className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed" />
            </div>
            <div className="mb-4">
              <Label>Message</Label>
              <textarea name="message" value={form.message} onChange={handleChange} required rows={5} className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-gray-100" placeholder="Type your message here..." />
            </div>
            <Button type="submit" className="w-full bg-[#6A38C2] hover:bg-[#5b30a6]" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ContactForm; 