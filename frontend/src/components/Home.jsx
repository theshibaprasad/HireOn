import React, { useEffect } from 'react';
import Navbar from './shared/Navbar';
import HeroSection from './HeroSection';
import CategoryCarousel from './CategoryCarousel';
import LatestJobs from './LatestJobs';
import Footer from './shared/Footer';
import useGetAllJobs from '@/hooks/useGetAllJobs';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ScrollToTopButton from './shared/ScrollToTopButton'; // ✅ Import it

const Home = () => {
  useGetAllJobs();
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role === 'recruiter') {
      navigate("/admin/companies");
    }
  }, []);

  return (
    <div>
      <Navbar />
      <div className="pt-20">
        <HeroSection />
        <CategoryCarousel />
        <LatestJobs />
      </div>
      <Footer />
      <ScrollToTopButton /> {/* ✅ Add the button here */}
    </div>
  );
};

export default Home;
