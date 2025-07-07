import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import HeroSection from './HeroSection';
import CategoryCarousel from './CategoryCarousel';
import LatestJobs from './LatestJobs';
import Footer from './shared/Footer';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ScrollToTopButton from './shared/ScrollToTopButton'; // ✅ Import it
import { setSearchedQuery } from '@/redux/jobSlice';

const Home = () => {
  const dispatch = useDispatch();
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setSearchedQuery(''));
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, [dispatch, navigate, user?.role]);

  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen">
      <Navbar />
      <div className="pt-20">
        <HeroSection />
        <CategoryCarousel />
        <LatestJobs />
        {/* About & FAQ Section Container - matches job cards */}
        <div className="max-w-7xl mx-auto px-4">
          {/* About Section */}
          <section className="my-16 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-3xl font-bold mb-4 text-[#6A38C2] dark:text-purple-300">About HireOn</h2>
            <p className="text-lg text-gray-700 dark:text-gray-200 mb-2">
              <span className="font-semibold">HireOn</span> is a modern job portal connecting talented students and skilled recruiters. Our mission is to empower job seekers and companies by providing a seamless, transparent, and efficient hiring experience.
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-200">
              <li>🚀 <span className="font-semibold">Empowering Careers:</span> We help students and professionals find their dream jobs.</li>
              <li>🤝 <span className="font-semibold">Trusted by Recruiters:</span> Companies discover top talent with ease.</li>
              <li>🔒 <span className="font-semibold">Secure & Transparent:</span> Your data and privacy are our top priority.</li>
            </ul>
          </section>
          {/* FAQ Section */}
          <section className="my-16 p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800">
            <h2 className="text-3xl font-bold mb-6 text-[#6A38C2] dark:text-purple-300">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all">
                <summary className="font-semibold cursor-pointer text-lg text-gray-800 dark:text-gray-100 group-open:text-[#6A38C2]">How do I create an account on HireOn?</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Click on the Signup button in the top right, fill in your details, and verify your email to get started.</p>
              </details>
              <details className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all">
                <summary className="font-semibold cursor-pointer text-lg text-gray-800 dark:text-gray-100 group-open:text-[#6A38C2]">Is HireOn free for students and recruiters?</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Yes! HireOn is completely free for both students and recruiters to use.</p>
              </details>
              <details className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all">
                <summary className="font-semibold cursor-pointer text-lg text-gray-800 dark:text-gray-100 group-open:text-[#6A38C2]">How do I apply for jobs?</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Browse available jobs, click on a job to view details, and click the Apply button. Make sure your profile is complete for the best chance of success.</p>
              </details>
              <details className="group border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all">
                <summary className="font-semibold cursor-pointer text-lg text-gray-800 dark:text-gray-100 group-open:text-[#6A38C2]">How can I contact support?</summary>
                <p className="mt-2 text-gray-700 dark:text-gray-300">Use the Contact page to send us a message. Our team will get back to you as soon as possible.</p>
              </details>
            </div>
          </section>
        </div>
      </div>
      <Footer />
      <ScrollToTopButton /> {/* ✅ Add the button here */}
    </div>
  );
};

export default Home;
