import React, { useState, useEffect, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { LogOut, User2, Moon, Sun, Menu } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { logout } from '@/redux/authSlice'
import { toast } from 'sonner'
import UserAvatar from '../shared/UserAvatar'
import { motion } from 'framer-motion'
import { useDarkMode } from '../../main'
import { createPortal } from 'react-dom';

const Navbar = () => {
  const { user } = useSelector(store => store.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const { isDark, setIsDark } = useDarkMode()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [rippleActive, setRippleActive] = useState(false);
  const [rippleStyle, setRippleStyle] = useState({});
  const [rippleColor, setRippleColor] = useState('');
  const [pendingTheme, setPendingTheme] = useState(null);
  const toggleRef = useRef(null);

  const logoutHandler = async () => {
    setLogoutLoading(true)
    try {
      const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true })
      if (res.data.success) {
        dispatch(logout())
        // Clear all cookies
        document.cookie.split(';').forEach(c => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
        // Clear all localStorage
        localStorage.clear();
        navigate('/')
        toast.success(res.data.message)
      } else {
        toast.error(res.data.message || 'Logout failed')
      }
    } catch (error) {
      dispatch(logout()) // force logout on error
      document.cookie.split(';').forEach(c => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
      });
      localStorage.clear();
      toast.error(error.response?.data?.message || 'Logout failed')
    } finally {
      setLogoutLoading(false)
    }
  }

  const handleToggleDark = (e) => {
    if (rippleActive) return; // Prevent double click
    // Get toggle button position
    const btn = toggleRef.current;
    if (!btn) {
      setIsDark((prev) => !prev);
      return;
    }
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Calculate max distance to cover viewport
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dx = Math.max(cx, vw - cx);
    const dy = Math.max(cy, vh - cy);
    const radius = Math.sqrt(dx * dx + dy * dy);
    const goingDark = !isDark;
    setRippleStyle({
      left: cx,
      top: cy,
      width: 0,
      height: 0,
      background: goingDark ? 'rgba(17,24,39,0.72)' : 'rgba(255,255,255,0.22)', // much darker for dark mode
      boxShadow: '0 0 32px 8px rgba(0,0,0,0.10)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      opacity: 0.94,
    });
    setRippleColor(goingDark ? 'rgba(17,24,39,0.72)' : 'rgba(255,255,255,0.22)');
    setRippleActive(true);
    setPendingTheme(goingDark);
    // Theme will be toggled after animation
  };

  // Animation effect
  useEffect(() => {
    if (!rippleActive) return;
    // Start expansion
    const btn = toggleRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dx = Math.max(cx, vw - cx);
    const dy = Math.max(cy, vh - cy);
    const radius = Math.sqrt(dx * dx + dy * dy);
    // Animate expansion (no bounce)
    setTimeout(() => {
      setRippleStyle((prev) => ({
        ...prev,
        width: radius * 2,
        height: radius * 2,
        marginLeft: -radius,
        marginTop: -radius,
        opacity: 0.94,
        transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1), height 0.7s cubic-bezier(0.4,0,0.2,1), margin 0.7s cubic-bezier(0.4,0,0.2,1), opacity 0.5s',
        background: rippleColor,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }));
    }, 10);
    // Switch theme after expansion
    const themeTimeout = setTimeout(() => {
      setIsDark(pendingTheme);
    }, 600);
    // Fade out after theme switch
    const fadeTimeout = setTimeout(() => {
      setRippleStyle((prev) => ({
        ...prev,
        opacity: 0,
        transition: (prev.transition || '') + ', opacity 0.5s',
      }));
    }, 900);
    // Remove overlay after fade
    const cleanupTimeout = setTimeout(() => {
      setRippleActive(false);
      setRippleStyle({});
      setPendingTheme(null);
    }, 1300);
    return () => {
      clearTimeout(themeTimeout);
      clearTimeout(fadeTimeout);
      clearTimeout(cleanupTimeout);
    };
  }, [rippleActive, pendingTheme, setIsDark, rippleColor]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Helper to close mobile menu on navigation
  const handleMobileNav = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Ripple Overlay Animation */}
      {rippleActive && createPortal(
        <div
          style={{
            position: 'fixed',
            zIndex: 9999,
            pointerEvents: 'none',
            left: 0,
            top: 0,
            width: '100vw',
            height: '100vh',
            overflow: 'visible',
          }}
        >
          <div
            style={{
              position: 'absolute',
              borderRadius: '50%',
              ...rippleStyle,
              opacity: rippleStyle.opacity ?? 1,
              willChange: 'width, height, margin, opacity',
            }}
          />
        </div>,
        document.body
      )}
      {/* Main Navbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'
        } dark:bg-gray-900`}
      >
        <div className="flex items-center justify-between mx-auto max-w-7xl px-2 sm:px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link to="/">
              <h1 className="text-2xl sm:text-4xl font-bold transition-all duration-300 hover:text-[#6A38C2] hover:scale-105 dark:text-gray-100">
                Hire<span className="transition-all duration-300 text-[#6A38C2] dark:hover:text-gray-100">On</span>
              </h1>
            </Link>
          </motion.div>

          {/* Hamburger for mobile */}
          <button
            className="sm:hidden ml-2 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#6A38C2]"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Open menu"
          >
            <Menu className="w-7 h-7 text-gray-700 dark:text-gray-100" />
          </button>

          {/* Desktop nav */}
          <motion.div
            className="hidden sm:flex items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ul className="flex font-medium items-center gap-5 dark:text-gray-100">
              {(user && user.role === 'recruiter') ? (
                <>
                  <li>
                    <Link
                      to="/admin/companies"
                      className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                    >
                      Companies
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/admin/jobs"
                      className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                    >
                      Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                    >
                      Contact
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      to="/"
                      className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/jobs"
                      className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                    >
                      Jobs
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/browse"
                      className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                    >
                      Browse
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/contact"
                      className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                    >
                      Contact
                    </Link>
                  </li>
                </>
              )}
            </ul>

            {!user ? (
              <motion.div
                className="flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link to="/login">
                  <Button variant="outline" className="transition-all hover:shadow hover:-translate-y-[1px] dark:bg-gray-800 dark:hover:bg-gray-700">
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] transition-all text-white">
                    Signup
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Popover>
                  <PopoverTrigger asChild>
                    <span className="cursor-pointer">
                      <UserAvatar src={user?.profile?.profilePhoto} name={user?.fullname} />
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100">
                    <div>
                      <div className="flex gap-2 items-center mb-3">
                        <UserAvatar src={user?.profile?.profilePhoto} name={user?.fullname} />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-gray-100">{user?.fullname}</h4>
                          <p className="text-sm text-muted-foreground dark:text-gray-400">
                            {user?.profile?.bio && user.profile.bio.length > 100
                              ? user.profile.bio.slice(0, 100) + '...'
                              : user?.profile?.bio}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col text-gray-600 dark:text-gray-200 space-y-2">
                        <div className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition cursor-pointer">
                          <User2 className="w-4 h-4" />
                          <Button variant="link" className="p-0 h-auto text-sm font-medium text-gray-700 dark:text-gray-100">
                            <Link to="/profile">View Profile</Link>
                          </Button>
                        </div>
                        <div
                          onClick={logoutHandler}
                          className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <Button variant="link" className="p-0 h-auto text-sm font-medium text-gray-700 dark:text-gray-100" disabled={logoutLoading}>
                            {logoutLoading ? 'Logging out...' : 'Logout'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </motion.div>
            )}

            <div className="flex items-center gap-4">
              <motion.button
                ref={toggleRef}
                onClick={handleToggleDark}
                className="ml-2 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-lg"
                aria-label="Toggle dark mode"
                initial={false}
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.span
                  key={isDark ? 'sun' : 'moon'}
                  initial={{ rotate: isDark ? -90 : 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: isDark ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  style={{ display: 'inline-block' }}
                >
                  {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
                </motion.span>
              </motion.button>
            </div>
          </motion.div>

          {/* Mobile nav menu */}
          {mobileMenuOpen && (
            <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-900 shadow-md sm:hidden z-50">
              <ul className="flex flex-col font-medium items-start gap-2 p-4 dark:text-gray-100">
                {(user && user.role === 'recruiter') ? (
                  <>
                    <li>
                      <Link
                        to="/admin/companies"
                        onClick={handleMobileNav}
                        className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                      >
                        Companies
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/admin/jobs"
                        onClick={handleMobileNav}
                        className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                      >
                        Jobs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        onClick={handleMobileNav}
                        className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                      >
                        Contact
                      </Link>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/"
                        onClick={handleMobileNav}
                        className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                      >
                        Home
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/jobs"
                        onClick={handleMobileNav}
                        className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                      >
                        Jobs
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/browse"
                        onClick={handleMobileNav}
                        className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                      >
                        Browse
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/contact"
                        onClick={handleMobileNav}
                        className="hover:text-[#6A38C2] transition-all duration-200 relative after:content-[''] after:absolute after:left-0 after:bottom-[-2px] after:w-0 hover:after:w-full after:h-[2px] after:bg-[#6A38C2] after:transition-all after:duration-300"
                      >
                        Contact
                      </Link>
                    </li>
                  </>
                )}
              </ul>
              <div className="flex flex-col gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                {!user ? (
                  <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Link to="/login">
                      <Button variant="outline" className="transition-all hover:shadow hover:-translate-y-[1px] dark:bg-gray-800 dark:hover:bg-gray-700">
                        Login
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] transition-all text-white">
                        Signup
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                  >
                    <Popover>
                      <PopoverTrigger asChild>
                        <span className="cursor-pointer">
                          <UserAvatar src={user?.profile?.profilePhoto} name={user?.fullname} />
                        </span>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-100">
                        <div>
                          <div className="flex gap-2 items-center mb-3">
                            <UserAvatar src={user?.profile?.profilePhoto} name={user?.fullname} />
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-gray-100">{user?.fullname}</h4>
                              <p className="text-sm text-muted-foreground dark:text-gray-400">
                                {user?.profile?.bio && user.profile.bio.length > 100
                                  ? user.profile.bio.slice(0, 100) + '...'
                                  : user?.profile?.bio}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col text-gray-600 dark:text-gray-200 space-y-2">
                            <div className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition cursor-pointer">
                              <User2 className="w-4 h-4" />
                              <Button variant="link" className="p-0 h-auto text-sm font-medium text-gray-700 dark:text-gray-100">
                                <Link to="/profile">View Profile</Link>
                              </Button>
                            </div>
                            <div
                              onClick={logoutHandler}
                              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1 transition cursor-pointer"
                            >
                              <LogOut className="w-4 h-4" />
                              <Button variant="link" className="p-0 h-auto text-sm font-medium text-gray-700 dark:text-gray-100" disabled={logoutLoading}>
                                {logoutLoading ? 'Logging out...' : 'Logout'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </motion.div>
                )}

                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleToggleDark}
                    className="ml-2 w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition shadow-lg"
                    aria-label="Toggle dark mode"
                    initial={false}
                    animate={{ rotate: isDark ? 180 : 0 }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <motion.span
                      key={isDark ? 'sun' : 'moon'}
                      initial={{ rotate: isDark ? -90 : 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: isDark ? 90 : -90, opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                      style={{ display: 'inline-block' }}
                    >
                      {isDark ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-700" />}
                    </motion.span>
                  </motion.button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </>
  )
}

export default Navbar
