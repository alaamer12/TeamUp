/**
 * Hot-fix script to update missing created_at dates in the TeamUp database
 * 
 * This script identifies records with missing created_at dates and adds them,
 * defaulting to the current time if no other reference is available.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
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
 * Updates records with missing created_at dates
 */
async function fixMissingDates() {
  try {
    console.log('Starting date fix process...');
    
    // 1. Find records with missing created_at dates
    const { data: missingDateRecords, error: fetchError } = await supabase
      .from('requests')
      .select('id, updated_at')
      .is('created_at', null);
    
    if (fetchError) {
      console.error('Error fetching records with missing dates:', fetchError);
      return;
    }
    
    console.log(`Found ${missingDateRecords?.length || 0} records with missing created_at dates`);
    
    if (!missingDateRecords || missingDateRecords.length === 0) {
      console.log('No records need fixing. Exiting...');
      return;
    }
    
    // 2. Update each record with an appropriate date
    let successCount = 0;
    let errorCount = 0;
    
    for (const record of missingDateRecords) {
      try {
        // Use updated_at as fallback if available, otherwise current time
        const fallbackDate = record.updated_at || new Date().toISOString();
        
        const { error: updateError } = await supabase
          .from('requests')
          .update({ created_at: fallbackDate })
          .eq('id', record.id);
        
        if (updateError) {
          console.error(`Error updating record ${record.id}:`, updateError);
          errorCount++;
        } else {
          console.log(`Updated record ${record.id} with created_at: ${fallbackDate}`);
          successCount++;
        }
      } catch (error) {
        console.error(`Exception updating record ${record.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n--- Summary ---');
    console.log(`Total records processed: ${missingDateRecords.length}`);
    console.log(`Successful updates: ${successCount}`);
    console.log(`Failed updates: ${errorCount}`);
    
  } catch (error) {
    console.error('Error in fixMissingDates function:', error);
  }
}

// Execute the fix
fixMissingDates()
  .then(() => console.log('Date fix process completed'))
  .catch(err => console.error('Error running date fix:', err)); 