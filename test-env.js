const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, 'web/.env.local') });

console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

try {
  // We can't easily import the TS file directly without ts-node or similar
  // But we can check if the variables are loaded correctly in this environment.
  if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyBEPHGDf5nUhMkD4U3qinSpVdxoVpkdMfg') {
    console.log('Verification Successful: Environment variables loaded correctly.');
  } else {
    console.log('Verification Failed: API Key does not match.');
    process.exit(1);
  }
} catch (error) {
  console.error('Verification Error:', error);
  process.exit(1);
}
