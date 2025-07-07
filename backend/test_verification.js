// Test script to debug verification
import axios from 'axios';

async function testVerification() {
    try {
        // Test the debug endpoint first
        console.log('Testing debug endpoint...');
        const debugResponse = await axios.get('http://localhost:8000/api/v1/user/debug-verify/theshibaprasad@gmail.com');
        console.log('Debug response:', debugResponse.data);
        
        // Test the actual verification endpoint
        console.log('\nTesting verification endpoint...');
        const verifyResponse = await axios.get('http://localhost:8000/api/v1/user/verify-email/44848bf131bb2fda0ab161d523fbcefeb93dd45e3fddb87586526a63bc252204');
        console.log('Verification response:', verifyResponse.data);
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testVerification(); 