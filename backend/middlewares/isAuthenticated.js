import jwt from "jsonwebtoken";
import { Application } from '../models/application.model.js';
import { Job } from '../models/job.model.js';
import { User } from '../models/user.model.js';

const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({
                message: "User not authenticated",
                success: false,
            })
        }
        const decode = await jwt.verify(token, process.env.JWT_SECRET);
        if(!decode){
            return res.status(401).json({
                message:"Invalid token",
                success:false
            })
        };
        req.id = decode.id;
        next();
    } catch (error) {
        console.log(error);
    }
}

// Middleware to check if user can chat on an application
export const canChatOnApplication = async (req, res, next) => {
  try {
    const applicationId = req.params.applicationId || req.body.applicationId;
    if (!applicationId) {
      return res.status(400).json({ message: 'Application ID required', success: false });
    }
    const application = await Application.findById(applicationId).populate('job applicant');
    if (!application) {
      return res.status(404).json({ message: 'Application not found', success: false });
    }
    if (application.status !== 'accepted') {
      return res.status(403).json({ message: 'Chat not allowed until application is accepted', success: false });
    }
    // Only applicant or recruiter (job creator) can chat
    const userId = req.id;
    const isApplicant = application.applicant._id.equals(userId);
    const isRecruiter = application.job && application.job.created_by && application.job.created_by.equals(userId);
    if (!isApplicant && !isRecruiter) {
      return res.status(403).json({ message: 'Not authorized to chat on this application', success: false });
    }
    // Attach application and job to request for downstream use
    req.application = application;
    req.job = application.job;
    req.chatPartnerId = isApplicant ? application.job.created_by : application.applicant._id;
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Server error', success: false });
  }
};

export default isAuthenticated;