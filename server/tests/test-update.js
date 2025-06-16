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
 * Test creating and updating a team request
 */
async function testDatabaseOperations() {
  console.log('🧪 Starting database operations test');
  console.log('----------------------------------');

  // Generate a unique test ID
  const testId = uuidv4();
  console.log(`📝 Using test ID: ${testId}`);

  try {
    // 1. Create a test record
    console.log('1️⃣ Creating test record...');
    const testData = {
      id: testId,
      owner_fingerprint: 'test-fingerprint-' + Date.now(),
      user_name: 'Test User',
      user_gender: 'Other',
      user_abstract: 'This is a test record',
      user_personal_phone: '123-456-7890',
      status: 'open'
    };

    const { data: createdData, error: createError } = await supabase
      .from('requests')
      .insert([testData])
      .select();

    if (createError) {
      throw new Error(`Failed to create test record: ${createError.message}`);
    }

    console.log('✅ Test record created successfully:', {
      id: createdData[0].id,
      user_name: createdData[0].user_name
    });

    // 2. Update the test record
    console.log('2️⃣ Updating test record...');
    const updateData = {
      user_name: 'Updated Test User',
      user_abstract: 'This record has been updated',
      status: 'closed'
    };

    const { data: updatedData, error: updateError } = await supabase
      .from('requests')
      .update(updateData)
      .eq('id', testId)
      .select();

    if (updateError) {
      throw new Error(`Failed to update test record: ${updateError.message}`);
    }

    console.log('✅ Test record updated successfully:', {
      id: updatedData[0].id,
      user_name: updatedData[0].user_name,
      status: updatedData[0].status
    });

    // 3. Verify the update
    console.log('3️⃣ Verifying update...');
    const { data: verifyData, error: verifyError } = await supabase
      .from('requests')
      .select('*')
      .eq('id', testId)
      .single();

    if (verifyError) {
      throw new Error(`Failed to verify test record: ${verifyError.message}`);
    }

    if (verifyData.user_name !== updateData.user_name || 
        verifyData.status !== updateData.status) {
      throw new Error('Verification failed: Updated data does not match');
    }

    console.log('✅ Update verified successfully');

  } catch (error) {
    console.error(`❌ TEST ERROR: ${error.message}`);
  } finally {
    // Clean up - delete the test record
    console.log(`🧹 Cleaning up test data with ID: ${testId}`);
    const { error: deleteError } = await supabase
      .from('requests')
      .delete()
      .eq('id', testId);

    if (deleteError) {
      console.error(`❌ Failed to clean up test data: ${deleteError.message}`);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }

    console.log('----------------------------------');
    console.log('🏁 Test complete');
  }
}

// Run the test
testDatabaseOperations(); 