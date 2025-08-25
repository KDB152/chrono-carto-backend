const fetch = require('node-fetch');

async function testEmptyString() {
  const API_BASE = 'http://localhost:3001';
  
  try {
    console.log('=== TESTING EMPTY STRING SCENARIO ===\n');
    
    // Test 1: Empty string
    console.log('1. Testing with empty string:');
    const conversationData1 = {
      participant1Id: 28,
      participant2Id: parseInt('')  // This will be NaN
    };
    
    console.log('conversationData1:', conversationData1);
    console.log('participant2Id type:', typeof conversationData1.participant2Id);
    console.log('participant2Id value:', conversationData1.participant2Id);
    console.log('participant2Id is NaN:', isNaN(conversationData1.participant2Id));
    console.log('');
    
    // Test 2: Undefined
    console.log('2. Testing with undefined:');
    const conversationData2 = {
      participant1Id: 28,
      participant2Id: undefined
    };
    
    console.log('conversationData2:', conversationData2);
    console.log('participant2Id type:', typeof conversationData2.participant2Id);
    console.log('participant2Id value:', conversationData2.participant2Id);
    console.log('');
    
    // Test 3: Empty string without parseInt
    console.log('3. Testing with empty string without parseInt:');
    const conversationData3 = {
      participant1Id: 28,
      participant2Id: ''
    };
    
    console.log('conversationData3:', conversationData3);
    console.log('participant2Id type:', typeof conversationData3.participant2Id);
    console.log('participant2Id value:', conversationData3.participant2Id);
    console.log('');
    
    // Test 4: Make API call with empty string
    console.log('4. Making API call with empty string...');
    
    const conversationResponse = await fetch(`${API_BASE}/messaging/conversations/create-or-get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversationData3)
    });
    
    console.log('Response status:', conversationResponse.status);
    
    if (!conversationResponse.ok) {
      const errorText = await conversationResponse.text();
      console.log('Error response:', errorText);
    } else {
      const conversation = await conversationResponse.json();
      console.log('Success response:', conversation);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testEmptyString();
