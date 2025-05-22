const axios = require('axios');

const testWalletAPI = async () => {
  try {
    console.log('Testing Wallet Analyzer API...');
    
    const response = await axios.post('http://localhost:3001/api/analyze-wallet', {
      address: '0x43199f5aDe055BE1E2e622141755FD579f984199'
    });
    
    console.log('API Response Status:', response.status);
    console.log('Success:', response.data.success);
    console.log('Address:', response.data.address);
    
    if (response.data.details) {
      console.log('Details found. Balance:', response.data.details.balance?.native || 'Not found');
    } else {
      console.log('No details returned');
    }
    
    if (response.data.persona) {
      console.log('Persona found:', response.data.persona.category || 'No category');
    } else {
      console.log('No persona returned');
    }
    
  } catch (error) {
    console.error('Error testing API:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Server might not be running.');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
};

testWalletAPI(); 