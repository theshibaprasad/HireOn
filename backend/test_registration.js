// Test script to register a new user and test verification
import axios from 'axios';

async function testRegistration() {
    try {
        // Register a new user
        console.log('Registering new user...');
        const registerData = {
            fullname: 'Test User',
            email: 'testuser@example.com',
            phoneNumber: '1234567890',
            password: 'testpassword123',
            role: 'student'
        };
        
        const registerResponse = await axios.post('http://localhost:8000/api/v1/user/register', registerData);
        console.log('Registration response:', registerResponse.data);
        
        if (registerResponse.data.success) {
            console.log('User registered successfully!');
            console.log('Check your email for verification link.');
        }
        
    } catch (error) {
        console.error('Registration error:', error.response?.data || error.message);
    }
}

testRegistration(); 