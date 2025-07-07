import { Message } from '../models/message.model.js';
import { Application } from '../models/application.model.js';
import { Job } from '../models/job.model.js';

// Fetch chat history for an application
export const getChatHistory = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const userId = req.id;
    // Authorization already checked by middleware
    let messages = await Message.find({ application: applicationId })
      .sort({ createdAt: 1 })
      .populate('sender receiver')
      .populate('replyTo')
      .lean();
    // Persistent clear chat for me: filter messages
    const application = await Application.findById(applicationId);
    if (application && application.clearedChats && userId) {
      const clearEntry = application.clearedChats.find(c => c.user.toString() === userId.toString());
      if (clearEntry) {
        messages = messages.filter(m => new Date(m.createdAt) > new Date(clearEntry.clearedAt));
      }
    }
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// List all applications where user can chat (status: accepted)
export const getChatEnabledApplications = async (req, res) => {
  try {
    const userId = req.id;
    // As applicant
    const asApplicant = await Application.find({ applicant: userId, status: 'accepted' })
      .populate('job');
    // As recruiter (job creator)
    const jobs = await Job.find({ created_by: userId });
    const jobIds = jobs.map(j => j._id);
    const asRecruiter = await Application.find({ job: { $in: jobIds }, status: 'accepted' })
      .populate('job applicant');
    res.json({
      success: true,
      applications: [
        ...asApplicant.map(a => ({ ...a.toObject(), role: 'student' })),
        ...asRecruiter.map(a => ({ ...a.toObject(), role: 'recruiter' }))
      ]
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Clear all messages for an application
export const clearChatHistory = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    await Message.deleteMany({ application: applicationId });
    res.json({ success: true, message: 'Chat history cleared.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a single message (for everyone)
export const deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    await Message.findByIdAndDelete(messageId);
    res.json({ success: true, message: 'Message deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Persistent clear chat for me
export const clearChatForMe = async (req, res) => {
  try {
    const applicationId = req.params.applicationId;
    const userId = req.id;
    const application = await Application.findById(applicationId);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found.' });
    }
    // Remove any previous clear for this user
    application.clearedChats = application.clearedChats.filter(c => c.user.toString() !== userId.toString());
    // Add new clear
    application.clearedChats.push({ user: userId, clearedAt: new Date() });
    await application.save();
    res.json({ success: true, message: 'Chat cleared for you.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
}; 