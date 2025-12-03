#!/usr/bin/env node

/**
 * Firebase Credentials Diagnostic Script
 * 
 * This script helps diagnose Firebase Admin SDK credential issues.
 * Run with: npm run check-firebase
 */

const fs = require('fs');
const path = require('path');

// Load .env.local file manually
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return {};
  }
  
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  // Handle multi-line values (for private keys that span multiple lines)
  const lines = content.split('\n');
  let currentKey = null;
  let currentValue = [];
  let inQuotedValue = false;
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    const trimmed = line.trim();
    
    // Skip comments and empty lines (unless we're in a multi-line value)
    if (!inQuotedValue && (trimmed.startsWith('#') || trimmed === '')) {
      continue;
    }
    
    // Check if this line starts a new key=value pair
    const keyMatch = trimmed.match(/^([^=]+)=(.*)$/);
    
    if (keyMatch && !inQuotedValue) {
      // Save previous key-value if exists
      if (currentKey) {
        let value = currentValue.join('\n').trim();
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        process.env[currentKey] = value;
        env[currentKey] = value;
      }
      
      // Start new key-value
      currentKey = keyMatch[1].trim();
      const valueStart = keyMatch[2].trim();
      currentValue = [valueStart];
      
      // Check if value starts with quote but doesn't end on same line
      if ((valueStart.startsWith('"') && !valueStart.endsWith('"')) ||
          (valueStart.startsWith("'") && !valueStart.endsWith("'"))) {
        inQuotedValue = true;
      } else {
        inQuotedValue = false;
      }
    } else if (currentKey) {
      // Continuation of multi-line value
      currentValue.push(line);
      // Check if this line ends the quoted value
      if (inQuotedValue && (trimmed.endsWith('"') || trimmed.endsWith("'"))) {
        inQuotedValue = false;
      }
    }
  }
  
  // Don't forget the last key-value pair
  if (currentKey) {
    let value = currentValue.join('\n').trim();
    // Remove surrounding quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[currentKey] = value;
    env[currentKey] = value;
  }
  
  return env;
}

loadEnvFile();

console.log('🔍 Firebase Credentials Diagnostic Tool\n');
console.log('=' .repeat(50));

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  console.log('\nPlease create a .env.local file with your Firebase credentials.');
  process.exit(1);
}

console.log('✅ .env.local file found\n');

// Check required environment variables
const requiredVars = {
  'FIREBASE_PROJECT_ID': process.env.FIREBASE_PROJECT_ID,
  'FIREBASE_CLIENT_EMAIL': process.env.FIREBASE_CLIENT_EMAIL,
  'FIREBASE_PRIVATE_KEY': process.env.FIREBASE_PRIVATE_KEY,
};

let allPresent = true;
for (const [key, value] of Object.entries(requiredVars)) {
  if (!value || value.trim() === '') {
    console.error(`❌ ${key} is missing or empty`);
    allPresent = false;
  } else {
    console.log(`✅ ${key} is set`);
  }
}

if (!allPresent) {
  console.log('\n❌ Some required environment variables are missing!');
  process.exit(1);
}

console.log('\n' + '='.repeat(50));
console.log('📋 Validating Private Key Format\n');

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

// Check for BEGIN marker
if (!privateKey.includes('BEGIN PRIVATE KEY')) {
  console.error('❌ Private key is missing "-----BEGIN PRIVATE KEY-----" marker');
  console.log('   The private key must start with: -----BEGIN PRIVATE KEY-----');
} else {
  console.log('✅ Private key has BEGIN marker');
}

// Check for END marker
if (!privateKey.includes('END PRIVATE KEY')) {
  console.error('❌ Private key is missing "-----END PRIVATE KEY-----" marker');
  console.log('   The private key must end with: -----END PRIVATE KEY-----');
} else {
  console.log('✅ Private key has END marker');
}

// Check for newlines
const hasNewlines = privateKey.includes('\\n') || privateKey.includes('\n');
if (!hasNewlines) {
  console.warn('⚠️  Private key might be missing newlines');
  console.log('   The private key should contain \\n characters (escaped newlines)');
  console.log('   Format: "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
} else {
  // Count newlines to show this is normal
  const newlineCount = (privateKey.match(/\\n/g) || []).length;
  console.log(`✅ Private key contains newlines (${newlineCount} \\n characters found)`);
  if (newlineCount >= 20 && newlineCount <= 35) {
    console.log('   ✅ This is normal! PEM format keys have newlines every ~64 characters');
    console.log('   ✅ A 2048-bit RSA key typically has 20-30 lines of base64 content');
  } else if (newlineCount < 5) {
    console.warn('   ⚠️  Very few newlines - key might be on a single line');
    console.warn('   ⚠️  This can cause parsing issues. Ensure newlines are preserved.');
  }
}

// Check if wrapped in quotes
const isQuoted = (privateKey.startsWith('"') && privateKey.endsWith('"')) ||
                 (privateKey.startsWith("'") && privateKey.endsWith("'"));
if (!isQuoted && privateKey.includes(' ')) {
  console.warn('⚠️  Private key contains spaces but is not wrapped in quotes');
  console.log('   Consider wrapping it in double quotes: FIREBASE_PRIVATE_KEY="..."');
} else {
  console.log('✅ Private key format looks correct');
}

// Try to clean the key using the same logic as firebaseAdmin.ts
console.log('\n' + '='.repeat(50));
console.log('🧹 Testing Key Cleaning\n');

try {
  // Use the same cleaning logic as firebaseAdmin.ts
  let cleaned = privateKey.trim();
  
  // Remove surrounding quotes if present
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
      (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1);
  }
  
  // CRITICAL: Remove spaces before escaped newlines first
  // This handles cases like "                    \n" where spaces precede the \n
  cleaned = cleaned.replace(/\s+\\n/g, "\\n");
  cleaned = cleaned.replace(/\s+\\r/g, "\\r");
  
  // Replace escaped newlines with actual newlines
  cleaned = cleaned.replace(/\\n/g, "\n");
  cleaned = cleaned.replace(/\\r/g, "\r");
  cleaned = cleaned.trim();
  
  // Normalize newlines first (before line-by-line processing)
  cleaned = cleaned.replace(/\r\n/g, "\n");
  cleaned = cleaned.replace(/\r/g, "\n");
  
  // CRITICAL: Remove leading/trailing whitespace from each line
  // This handles cases where the key was copied with indentation/spaces
  const lines = cleaned.split('\n');
  cleaned = lines.map(line => line.trim()).join('\n');
  
  const allLines = cleaned.split('\n');
  const nonEmptyLines = allLines.filter(line => line.trim().length > 0);
  console.log(`📊 Key has ${nonEmptyLines.length} non-empty lines after cleaning`);
  console.log(`   Total lines (including empty): ${allLines.length}`);
  
  // Explain why multiple lines are normal
  if (nonEmptyLines.length >= 20 && nonEmptyLines.length <= 35) {
    console.log('   ✅ This is the expected format! PEM keys are base64-encoded and');
    console.log('      typically split into 20-30 lines of ~64 characters each.');
  }
  
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    const lastLine = lines[lines.length - 1].trim();
    
    console.log(`   First line: ${firstLine.substring(0, Math.min(50, firstLine.length))}${firstLine.length > 50 ? '...' : ''}`);
    console.log(`   Last line: ${lastLine.length > 50 ? '...' : ''}${lastLine.substring(Math.max(0, lastLine.length - 50))}`);
    
    // Check if first line has BEGIN marker
    if (!firstLine.includes('BEGIN PRIVATE KEY') && !firstLine.includes('BEGIN RSA PRIVATE KEY')) {
      console.error('   ❌ First line does not contain BEGIN marker');
    }
    
    // Check if last line has END marker
    if (!lastLine.includes('END PRIVATE KEY') && !lastLine.includes('END RSA PRIVATE KEY')) {
      console.error('   ❌ Last line does not contain END marker');
      console.error('   ⚠️  This suggests the key is truncated or incomplete!');
    }
  }
  
  // Check if it looks like a valid key
  const hasBegin = cleaned.includes('BEGIN PRIVATE KEY') || cleaned.includes('BEGIN RSA PRIVATE KEY');
  const hasEnd = cleaned.includes('END PRIVATE KEY') || cleaned.includes('END RSA PRIVATE KEY');
  
  if (hasBegin && hasEnd) {
    // Extract key content
    const beginMarker = cleaned.includes('BEGIN PRIVATE KEY') 
      ? '-----BEGIN PRIVATE KEY-----' 
      : '-----BEGIN RSA PRIVATE KEY-----';
    const endMarker = cleaned.includes('END PRIVATE KEY') 
      ? '-----END PRIVATE KEY-----' 
      : '-----END RSA PRIVATE KEY-----';
    
    const beginIndex = cleaned.indexOf(beginMarker);
    const endIndex = cleaned.indexOf(endMarker);
    
    if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
      const keyContent = cleaned.substring(
        beginIndex + beginMarker.length,
        endIndex
      ).trim();
      
      // Count lines in key content
      const keyContentLines = keyContent.split('\n').filter(l => l.trim().length > 0);
      console.log(`\n📏 Key content length: ${keyContent.length} characters`);
      console.log(`   Key content lines: ${keyContentLines.length} lines`);
      
      if (keyContent.length > 1000) {
        console.log('✅ Key content appears to be valid (has substantial content)');
        if (keyContentLines.length >= 15 && keyContentLines.length <= 30) {
          console.log('✅ Line count is normal for a 2048-bit RSA key');
        }
      } else if (keyContent.length > 100) {
        console.warn('⚠️  Key content is present but shorter than expected');
        console.warn('   A typical 2048-bit RSA key has 1200-1700 characters');
      } else {
        console.error('❌ Key content appears to be too short or empty');
        console.error('   A valid private key should be at least 1000+ characters');
      }
    } else {
      console.error('❌ Could not extract key content between markers');
    }
  } else {
    console.error('❌ Key is missing BEGIN or END markers');
  }
  
  // Check key length
  console.log(`\n📏 Total key length: ${cleaned.length} characters`);
  if (cleaned.length < 500) {
    console.error('⚠️  Key appears to be too short. A valid private key is typically 1500+ characters.');
    console.error('   This strongly suggests the key is truncated or incomplete.');
  }
  
} catch (error) {
  console.error('❌ Error cleaning key:', error.message);
}

// Try to initialize Firebase Admin SDK
console.log('\n' + '='.repeat(50));
console.log('🔥 Testing Firebase Admin SDK Initialization\n');

try {
  const admin = require('firebase-admin');
  
  // Clean the private key using the same logic as firebaseAdmin.ts
  let cleanedKey = privateKey.trim();
  
  // Remove surrounding quotes if present
  if ((cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) || 
      (cleanedKey.startsWith("'") && cleanedKey.endsWith("'"))) {
    cleanedKey = cleanedKey.slice(1, -1);
  }
  
  // Replace escaped newlines with actual newlines
  cleanedKey = cleanedKey.replace(/\\n/g, "\n");
  cleanedKey = cleanedKey.replace(/\\r/g, "\r");
  cleanedKey = cleanedKey.trim();
  
  // Normalize newlines
  cleanedKey = cleanedKey.replace(/\r\n/g, "\n");
  cleanedKey = cleanedKey.replace(/\r/g, "\n");
  
  // Ensure proper newlines between BEGIN/END markers and the key content
  if (cleanedKey.includes('BEGIN PRIVATE KEY')) {
    cleanedKey = cleanedKey.replace(
      /-----BEGIN PRIVATE KEY-----\s*/,
      '-----BEGIN PRIVATE KEY-----\n'
    );
    cleanedKey = cleanedKey.replace(
      /\s*-----END PRIVATE KEY-----/,
      '\n-----END PRIVATE KEY-----'
    );
  } else if (cleanedKey.includes('BEGIN RSA PRIVATE KEY')) {
    cleanedKey = cleanedKey.replace(
      /-----BEGIN RSA PRIVATE KEY-----\s*/,
      '-----BEGIN RSA PRIVATE KEY-----\n'
    );
    cleanedKey = cleanedKey.replace(
      /\s*-----END RSA PRIVATE KEY-----/,
      '\n-----END RSA PRIVATE KEY-----'
    );
  }
  
  // Remove trailing newline
  cleanedKey = cleanedKey.replace(/\n+$/, '');
  
  const config = {
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: cleanedKey,
    }),
  };
  
  // Initialize app
  if (admin.apps.length === 0) {
    admin.initializeApp(config);
  }
  
  console.log('✅ Firebase Admin SDK initialized successfully!');
  
  // Try to get Firestore
  const db = admin.firestore();
  console.log('✅ Firestore instance created');
  
  // Try a simple operation (this will fail if credentials are invalid)
  console.log('⏳ Testing Firestore connection...');
  db.collection('_test').limit(1).get()
    .then(() => {
      console.log('✅ Firestore connection successful!');
      console.log('\n🎉 All checks passed! Your Firebase credentials are valid.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Firestore connection failed!');
      console.error('   Error:', error.message);
      
      if (error.message.includes('DECODER') || error.message.includes('DECODER routines') || 
          error.message.includes('Invalid PEM') || error.message.includes('PEM formatted')) {
        console.log('\n🔧 DECODER/PEM Error Troubleshooting:');
        console.log('   1. The private key format is likely incorrect or truncated');
        console.log('   2. Make sure you copied the ENTIRE key from the JSON file');
        console.log('   3. The key must include both BEGIN and END markers');
        console.log('   4. Ensure newlines are escaped as \\n in .env.local');
        console.log('   5. Wrap the entire key in double quotes');
        console.log('   6. Try regenerating the service account key from Firebase Console');
        console.log('\n   Example format in .env.local:');
        console.log('   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"');
        console.log('\n   Steps to fix:');
        console.log('   1. Go to Firebase Console > Project Settings > Service accounts');
        console.log('   2. Click "Generate new private key"');
        console.log('   3. Open the downloaded JSON file');
        console.log('   4. Copy the ENTIRE "private_key" value (it should be very long)');
        console.log('   5. Paste it into .env.local with quotes and \\n characters');
      } else if (error.message.includes('invalid_grant') || error.message.includes('unauthorized')) {
        console.log('\n🔧 Authentication Error:');
        console.log('   1. The service account key may have been revoked');
        console.log('   2. Check that FIREBASE_PROJECT_ID and FIREBASE_CLIENT_EMAIL are correct');
        console.log('   3. Generate a new private key from Firebase Console');
      }
      
      process.exit(1);
    });
    
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK');
  console.error('   Error:', error.message);
  
  if (error.message.includes('DECODER') || error.message.includes('Invalid PEM') || 
      error.message.includes('PEM formatted')) {
    console.log('\n🔧 The private key appears to be malformed or truncated.');
    console.log('   Common issues:');
    console.log('   - Key is missing the END marker (truncated)');
    console.log('   - Key is missing newlines (all on one line)');
    console.log('   - Key is not wrapped in quotes');
    console.log('   - Key was not copied completely from JSON file');
    console.log('\n   Solution: Regenerate the key from Firebase Console and copy it carefully.');
  }
  
  process.exit(1);
}

