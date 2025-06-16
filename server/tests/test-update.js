import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment for dev testing
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({
  path: path.resolve(__dirname, '../.env.development'),
});

// Initialize Supabase client with dev credentials
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Test data
const testOwnerFingerprint = `test-${uuidv4()}`;
const testRequestData = {
  id: uuidv4(),
  user_name: 'Test User',
  user_gender: 'Any',
  user_abstract: 'Test Abstract',
  user_personal_phone: '1234567890',
  owner_fingerprint: testOwnerFingerprint,
  contact_email: 'test@example.com',
  contact_discord: 'test#1234',
  group_size: 3,
  created_at: new Date().toISOString()
};

// Test team member data
const testMember = {
  tech_field: ['JavaScript', 'React'],
  gender: 'Any',
  major: 'Computer Science',
  planguage: ['JavaScript', 'Python'],
  already_know: false
};

/**
 * Run the update test
 */
async function runUpdateTest() {
  console.log('🧪 Starting update functionality test');
  console.log('----------------------------------');
  
  try {
    // Step 1: Create a test record
    console.log(`📝 Creating test record with ID: ${testRequestData.id}`);
    const { data: createdRequest, error: createError } = await supabase
      .from('requests')
      .insert([testRequestData])
      .select();
      
    if (createError) {
      throw new Error(`Failed to create test record: ${createError.message}`);
    }
    
    console.log('✅ Test record created successfully');
    console.log(createdRequest[0]);
    
    // Add test team member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert([{
        request_id: testRequestData.id,
        ...testMember
      }]);
      
    if (memberError) {
      console.warn(`⚠️ Warning: Failed to add team member: ${memberError.message}`);
    } else {
      console.log('✅ Test team member added successfully');
    }
    
    // Step 2: Update the test record
    const updatedData = {
      ...testRequestData,
      user_name: 'Updated Test User',
      user_abstract: 'Updated Abstract',
      members: [{
        ...testMember,
        major: 'Updated Major'
      }]
    };
    
    console.log(`🔄 Updating test record with ID: ${testRequestData.id}`);
    
    // Simulate the PUT request from the client-side code
    const { data: beforeUpdate, error: beforeError } = await supabase
      .from('requests')
      .select('*');
      
    if (beforeError) {
      throw new Error(`Failed to fetch records before update: ${beforeError.message}`);
    }
    
    console.log(`ℹ️ Number of records before update: ${beforeUpdate.length}`);
    
    // Perform update
    const { data: updatedRequest, error: updateError } = await supabase
      .from('requests')
      .update({
        user_name: updatedData.user_name,
        user_abstract: updatedData.user_abstract,
        updated_at: new Date().toISOString()
      })
      .eq('id', testRequestData.id)
      .select();
      
    if (updateError) {
      throw new Error(`Failed to update test record: ${updateError.message}`);
    }
    
    console.log('✅ Test record updated successfully');
    console.log(updatedRequest[0]);
    
    // Update team members
    // First delete existing
    await supabase
      .from('team_members')
      .delete()
      .eq('request_id', testRequestData.id);
      
    // Then insert updated
    await supabase
      .from('team_members')
      .insert([{
        request_id: testRequestData.id,
        ...updatedData.members[0]
      }]);
    
    // Step 3: Verify no duplicate records were created
    const { data: afterUpdate, error: afterError } = await supabase
      .from('requests')
      .select('*');
      
    if (afterError) {
      throw new Error(`Failed to fetch records after update: ${afterError.message}`);
    }
    
    console.log(`ℹ️ Number of records after update: ${afterUpdate.length}`);
    
    // Assert that no new records were created
    if (afterUpdate.length !== beforeUpdate.length) {
      throw new Error(`❌ TEST FAILED: New record was created instead of updating. Before: ${beforeUpdate.length}, After: ${afterUpdate.length}`);
    }
    
    // Assert that the record was actually updated
    const updatedRecord = afterUpdate.find(r => r.id === testRequestData.id);
    if (updatedRecord.user_name !== updatedData.user_name) {
      throw new Error(`❌ TEST FAILED: Record was not actually updated. Name should be "${updatedData.user_name}" but is "${updatedRecord.user_name}"`);
    }
    
    console.log('✅ TEST PASSED: Record was updated correctly without creating duplicates');
    
    // Step 4: Get the updated team members
    const { data: updatedMembers, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('request_id', testRequestData.id);
      
    if (membersError) {
      console.warn(`⚠️ Warning: Failed to fetch updated team members: ${membersError.message}`);
    } else {
      console.log('✅ Team members updated successfully');
      console.log(updatedMembers);
      
      // Assert that member was updated correctly
      if (updatedMembers.length !== 1 || updatedMembers[0].major !== updatedData.members[0].major) {
        console.warn(`⚠️ Warning: Team members may not have updated correctly`);
      }
    }
    
  } catch (error) {
    console.error(`❌ TEST ERROR: ${error.message}`);
  } finally {
    // Clean up: Delete the test record
    try {
      console.log(`🧹 Cleaning up test data with ID: ${testRequestData.id}`);
      
      // Clean up team members first
      await supabase
        .from('team_members')
        .delete()
        .eq('request_id', testRequestData.id);
        
      // Then delete the request
      const { error: deleteError } = await supabase
        .from('requests')
        .delete()
        .eq('id', testRequestData.id);
        
      if (deleteError) {
        console.error(`Failed to delete test record: ${deleteError.message}`);
      } else {
        console.log('✅ Test data cleaned up successfully');
      }
    } catch (cleanupError) {
      console.error(`Failed during cleanup: ${cleanupError.message}`);
    }
  }
}

// Run the test
runUpdateTest().then(() => {
  console.log('----------------------------------');
  console.log('🏁 Test complete');
  process.exit(0);
}).catch(error => {
  console.error(`Unhandled error in test: ${error.message}`);
  process.exit(1);
}); 