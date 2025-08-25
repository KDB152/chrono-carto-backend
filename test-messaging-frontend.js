const fetch = require('node-fetch');

async function testMessagingFrontend() {
  const API_BASE = 'http://localhost:3001';
  
  try {
    console.log('=== TESTING MESSAGING FRONTEND SIMULATION ===\n');
    
    // Simulate the frontend data
    const currentUserId = 28;
    const composeData = {
      to: '36', // This should be a string from the dropdown
      subject: 'Test message',
      content: 'This is a test message',
      priority: 'normal',
      category: 'general'
    };
    
    console.log('1. Frontend data:');
    console.log('currentUserId:', currentUserId);
    console.log('composeData:', composeData);
    console.log('');
    
    // Test 1: Check if validation would pass
    console.log('2. Validation check:');
    console.log('content.trim() empty:', !composeData.content.trim());
    console.log('to empty:', !composeData.to);
    console.log('currentUserId null:', !currentUserId);
    console.log('All valid:', composeData.content.trim() && composeData.to && currentUserId);
    console.log('');
    
    // Test 2: Check conversation data
    const conversationData = {
      participant1Id: currentUserId,
      participant2Id: parseInt(composeData.to)
    };
    
    console.log('3. Conversation data:');
    console.log('conversationData:', conversationData);
    console.log('participant1Id type:', typeof conversationData.participant1Id);
    console.log('participant2Id type:', typeof conversationData.participant2Id);
    console.log('participant2Id value:', conversationData.participant2Id);
    console.log('participant2Id is null:', conversationData.participant2Id === null);
    console.log('participant2Id is NaN:', isNaN(conversationData.participant2Id));
    console.log('');
    
    // Test 3: Make the actual API call
    console.log('4. Making API call to create conversation...');
    
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
      console.error('Error response:', errorText);
    } else {
      const conversation = await conversationResponse.json();
      console.log('Success! Conversation created:', conversation);
      
      // Test 4: Send a message
      console.log('\n5. Sending message...');
      
      const messageData = {
        conversationId: conversation.id,
        senderId: currentUserId,
        content: composeData.content,
        messageType: 'text'
      };
      
      console.log('Message data:', messageData);
      
      const messageResponse = await fetch(`${API_BASE}/messaging/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      });
      
      console.log('Message response status:', messageResponse.status);
      
      if (!messageResponse.ok) {
        const errorText = await messageResponse.text();
        console.error('Message error:', errorText);
      } else {
        const message = await messageResponse.json();
        console.log('Success! Message sent:', message);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testMessagingFrontend();
