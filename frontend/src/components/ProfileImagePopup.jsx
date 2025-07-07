import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Camera } from 'lucide-react';
import { Avatar, AvatarImage } from './ui/avatar';

const ProfileImagePopup = ({ open, setOpen, profileImage, onUpdateProfile }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const handleImageError = () => {
    setIsImageLoading(false);
  };



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profile Image</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Profile Image Display */}
          <div className="relative">
            {isImageLoading && (
              <div className="w-80 h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            )}
            <img
              src={profileImage}
              alt="Profile"
              className={`w-80 h-80 object-cover rounded-lg shadow-lg ${
                isImageLoading ? 'hidden' : 'block'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={onUpdateProfile}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Camera className="mr-2 h-4 w-4" />
              Change Profile Image
            </Button>
          </div>

          {/* Image Info */}
          <div className="text-center text-sm text-gray-600">
            <p>Click "Change Profile Image" to update your profile photo</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileImagePopup; 