import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/authSlice';
import { useNavigate } from 'react-router-dom';

const GoogleAuthSuccess = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');
    if (token) {
      dispatch(setUser({ token }));
      localStorage.setItem('token', token);
      navigate('/'); // or change to '/' if you want
    } else {
      navigate('/login');
    }
  }, [dispatch, navigate]);

  return <div>Logging you in...</div>;
};

export default GoogleAuthSuccess; 