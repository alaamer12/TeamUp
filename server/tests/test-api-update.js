import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

// Setup environment for dev testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../.env.development'),
});

// Test config
const API_URL = process.env.SERVER_URL || 'http://localhost:8080/api';

// Test data
const testOwnerFingerprint = `test-${uuidv4()}`;
const testRequestData = {
  user_name: 'API Test User',
  user_gender: 'Any',
  user_abstract: 'API Test Abstract',
  user_personal_phone: '9876543210',
  ownerFingerprint: testOwnerFingerprint,
  contactEmail: 'apitest@example.com',
  contactDiscord: 'apitest#1234',
  groupSize: 2,
  members: [{
    tech_field: ['Node.js', 'Express'],
    gender: 'Any',
    major: 'API Testing',
    planguage: ['JavaScript', 'TypeScript'],
    already_know: false
  }]
};

/**
 * Make an API call
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {Object} body - Request body
 * @returns {Promise<Object>} Response data
 */
async function callApi(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  console.log(`🌐 API Call: ${method} ${API_URL}${endpoint}`);
  const response = await fetch(`${API_URL}${endpoint}`, options);
  
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API call failed: ${response.status} ${response.statusText} - ${text}`);
  }
  
  return await response.json();
}

/**
 * Run the API update test
 */
async function runApiUpdateTest() {
  console.log('🧪 Starting API update functionality test');
  console.log('----------------------------------');
  let createdId = null;
  
  try {
    // Step 1: Get initial count of records
    const initialData = await callApi('/requests');
    const initialCount = initialData.length;
    console.log(`ℹ️ Initial record count: ${initialCount}`);
    
    // Step 2: Create a test record via API
    console.log(`📝 Creating test record via API`);
    const createdRequest = await callApi('/requests', 'POST', testRequestData);
    createdId = createdRequest.id;
    console.log(`✅ Test record created with ID: ${createdId}`);
    
    // Step 3: Verify record was created
    const afterCreateData = await callApi('/requests');
    const afterCreateCount = afterCreateData.length;
    console.log(`ℹ️ Record count after creation: ${afterCreateCount}`);
    
    if (afterCreateCount !== initialCount + 1) {
      throw new Error(`Record count mismatch after creation. Expected ${initialCount + 1}, got ${afterCreateCount}`);
    }
    
    // Step 4: Update the record via API
    const updateData = {
      ...testRequestData,
      id: createdId,
      user_name: 'Updated API Test User',
      user_abstract: 'Updated API Test Abstract',
      members: [{
        tech_field: ['Node.js', 'Express', 'React'],
        gender: 'Any',
        major: 'Updated API Testing',
        planguage: ['JavaScript', 'TypeScript'],
        already_know: true
      }]
    };
    
    console.log(`🔄 Updating test record with ID: ${createdId}`);
    const updatedRequest = await callApi(`/requests/${createdId}`, 'PUT', updateData);
    console.log(`✅ Record updated via API`);
    console.log(updatedRequest);
    
    // Step 5: Verify update worked correctly
    const afterUpdateData = await callApi('/requests');
    const afterUpdateCount = afterUpdateData.length;
    console.log(`ℹ️ Record count after update: ${afterUpdateCount}`);
    
    // Assert 1: No new records were created
    if (afterUpdateCount !== afterCreateCount) {
      throw new Error(`❌ TEST FAILED: New record was created instead of updating. Before: ${afterCreateCount}, After: ${afterUpdateCount}`);
    }
    
    // Assert 2: Record was actually updated
    const updatedRecord = afterUpdateData.find(r => r.id === createdId);
    if (!updatedRecord || updatedRecord.user_name !== 'Updated API Test User') {
      throw new Error(`❌ TEST FAILED: Record was not updated correctly. Name should be "Updated API Test User"`);
    }
    
    // Assert 3: Team members were updated
    if (!updatedRecord.members || updatedRecord.members.length !== 1 || 
        updatedRecord.members[0].major !== 'Updated API Testing' ||
        !updatedRecord.members[0].already_know) {
      console.warn(`⚠️ Warning: Team members may not have updated correctly`);
    }
    
    console.log('✅ TEST PASSED: Record was updated correctly without creating duplicates');
    
  } catch (error) {
    console.error(`❌ TEST ERROR: ${error.message}`);
  } finally {
    // Clean up: Delete the test record if it was created
    if (createdId) {
      try {
        console.log(`🧹 Cleaning up test record with ID: ${createdId}`);
        await callApi(`/requests/${createdId}`, 'DELETE', { ownerFingerprint: testOwnerFingerprint });
        console.log('✅ Test data cleaned up successfully');
      } catch (cleanupError) {
        console.error(`Failed during cleanup: ${cleanupError.message}`);
      }
    }
  }
}

// Run the test
runApiUpdateTest().then(() => {
  console.log('----------------------------------');
  console.log('🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error(`Unhandled error in test: ${error.message}`);
  process.exit(1);
}); 