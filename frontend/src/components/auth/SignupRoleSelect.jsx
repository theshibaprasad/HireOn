import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import Navbar from '../shared/Navbar';

const SignupRoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 w-full max-w-md text-center border border-gray-200 dark:border-gray-800">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Sign Up As</h1>
          <div className="flex flex-col gap-6">
            <Button className="bg-[#6A38C2] hover:bg-[#5b30a6] text-white text-lg py-4" onClick={() => navigate('/signup/student')}>
              Student
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-4" onClick={() => navigate('/signup/recruiter')}>
              Recruiter
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupRoleSelect; 