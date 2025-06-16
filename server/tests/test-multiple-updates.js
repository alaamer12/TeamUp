import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const nodeEnv = process.env.NODE_ENV || 'development';
dotenv.config({
  path: path.resolve(__dirname, `../.env.${nodeEnv}`),
});

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_ANON_KEY are set in your environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Test multiple updates to ensure they all work properly
 */
async function testMultipleUpdates() {
  console.log('🧪 Starting multiple updates test');
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
      user_name: createdData[0].user_name,
      status: createdData[0].status
    });

    // 2. First update - change name only
    console.log('2️⃣ First update - changing name only...');
    const update1 = {
      user_name: 'First Update Name'
    };

    const { data: update1Data, error: update1Error } = await supabase
      .from('requests')
      .update(update1)
      .eq('id', testId)
      .select();

    if (update1Error) {
      throw new Error(`Failed on first update: ${update1Error.message}`);
    }

    console.log('✅ First update successful:', {
      id: update1Data[0].id,
      user_name: update1Data[0].user_name,
      status: update1Data[0].status
    });

    // Verify status is still preserved
    if (update1Data[0].status !== testData.status) {
      throw new Error(`Status was changed unexpectedly. Expected: ${testData.status}, Got: ${update1Data[0].status}`);
    }

    // 3. Second update - change abstract only
    console.log('3️⃣ Second update - changing abstract only...');
    const update2 = {
      user_abstract: 'Updated abstract text'
    };

    const { data: update2Data, error: update2Error } = await supabase
      .from('requests')
      .update(update2)
      .eq('id', testId)
      .select();

    if (update2Error) {
      throw new Error(`Failed on second update: ${update2Error.message}`);
    }

    console.log('✅ Second update successful:', {
      id: update2Data[0].id,
      user_name: update2Data[0].user_name,
      user_abstract: update2Data[0].user_abstract,
      status: update2Data[0].status
    });

    // Verify name and status are still preserved
    if (update2Data[0].user_name !== update1.user_name) {
      throw new Error(`Name was changed unexpectedly. Expected: ${update1.user_name}, Got: ${update2Data[0].user_name}`);
    }
    if (update2Data[0].status !== testData.status) {
      throw new Error(`Status was changed unexpectedly. Expected: ${testData.status}, Got: ${update2Data[0].status}`);
    }

    // 4. Third update - change status
    console.log('4️⃣ Third update - changing status...');
    const update3 = {
      status: 'closed'
    };

    const { data: update3Data, error: update3Error } = await supabase
      .from('requests')
      .update(update3)
      .eq('id', testId)
      .select();

    if (update3Error) {
      throw new Error(`Failed on third update: ${update3Error.message}`);
    }

    console.log('✅ Third update successful:', {
      id: update3Data[0].id,
      user_name: update3Data[0].user_name,
      status: update3Data[0].status
    });

    // Verify status was changed but other fields preserved
    if (update3Data[0].status !== update3.status) {
      throw new Error(`Status was not changed. Expected: ${update3.status}, Got: ${update3Data[0].status}`);
    }
    if (update3Data[0].user_name !== update1.user_name) {
      throw new Error(`Name was changed unexpectedly. Expected: ${update1.user_name}, Got: ${update3Data[0].user_name}`);
    }
    if (update3Data[0].user_abstract !== update2.user_abstract) {
      throw new Error(`Abstract was changed unexpectedly. Expected: ${update2.user_abstract}, Got: ${update3Data[0].user_abstract}`);
    }

    console.log('✅ All updates verified successfully');

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
testMultipleUpdates(); 