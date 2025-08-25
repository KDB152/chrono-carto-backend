const fetch = require('node-fetch');

async function testNullParticipant() {
  const API_BASE = 'http://localhost:3001';
  
  try {
    console.log('=== TESTING NULL PARTICIPANT SCENARIO ===\n');
    
    // Simulate the problematic scenario
    const conversationData = {
      participant1Id: 28,
      participant2Id: null  // This is what's causing the error
    };
    
    console.log('1. Sending conversation data with null participant2Id:');
    console.log('conversationData:', conversationData);
    console.log('');
    
    // Make the API call
    console.log('2. Making API call...');
    
    const conversationResponse = await fetch(`${API_BASE}/messaging/conversations/create-or-get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(conversationData)
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

testNullParticipant();
