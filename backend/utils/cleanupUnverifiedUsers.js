import { User } from '../models/user.model.js';

export const cleanupUnverifiedUsers = async () => {
    try {
        const result = await User.deleteMany({
            isVerified: false,
            verificationExpires: { $lt: new Date() }
        });
        
        if (result.deletedCount > 0) {
            console.log(`Cleaned up ${result.deletedCount} unverified user accounts`);
        }
    } catch (error) {
        console.error('Error cleaning up unverified users:', error);
    }
}; 