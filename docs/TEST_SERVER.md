# TeamUp API Testing

This document outlines the testing methodology for the TeamUp API server, particularly focused on the bug fix for inconsistent update behavior.

## Bug Fixed: Inconsistent Updating Behavior

**Issue #2**: Sometimes when updating a record, a new instance would be created instead of updating the existing one.

The tests in this directory verify the fix for this bug by ensuring:
1. Updates correctly modify the existing record
2. No duplicate records are created during the update process
3. Both API endpoints and direct database interactions handle updates consistently

## Test Files

### 1. Direct Database Testing (`src/test-update.js`)

This test directly interacts with the Supabase database to verify update operations work correctly:
- Creates a test record with a unique fingerprint
- Updates the record via direct Supabase queries
- Verifies no duplicate records are created
- Verifies the record was properly updated
- Cleans up test data

### 2. API Endpoint Testing (`src/test-api-update.js`)

This test simulates client-side behavior by making HTTP requests to the API endpoints:
- Gets initial record count
- Creates a test record via the API
- Updates the record via the API endpoint
- Verifies no duplicate records are created
- Verifies the record was properly updated
- Cleans up the test data

## How to Run Tests

### Prerequisites

- Node.js 18 or higher
- Local or development instance of the TeamUp API server
- Valid Supabase development credentials in `.env.development`

### Running Tests

To run all tests:

```bash
npm test
```

To run individual test suites:

```bash
# Run database interaction tests
npm run test:db

# Run API endpoint tests
npm run test:api
```

## Expected Output

Successful tests will:
1. Show a record being created
2. Show the record being updated
3. Verify that record counts before and after update are identical (no duplication)
4. Verify that the updated data contains the modified values
5. Report cleanup of the test data

## Troubleshooting

If tests fail, check:
1. The Supabase connection in `.env.development` is valid and accessible
2. The API server is running (for API endpoint tests)
3. Your database schema matches what's expected by the tests 