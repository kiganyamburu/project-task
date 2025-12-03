#!/usr/bin/env node

/**
 * Script to fix Firebase private key format in .env.local
 * This script reads the key, cleans it, and shows you the correct format
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

const content = fs.readFileSync(envPath, 'utf8');

// Extract the private key (handling multi-line values)
const keyMatch = content.match(/FIREBASE_PRIVATE_KEY=(.*?)(?=\n[A-Z_][A-Z_]*=|$)/s);

if (!keyMatch) {
  console.error('❌ FIREBASE_PRIVATE_KEY not found in .env.local');
  process.exit(1);
}

let keyValue = keyMatch[1].trim();

// Remove surrounding quotes
if ((keyValue.startsWith('"') && keyValue.endsWith('"')) ||
    (keyValue.startsWith("'") && keyValue.endsWith("'"))) {
  keyValue = keyValue.slice(1, -1);
}

// Remove spaces before \n
keyValue = keyValue.replace(/\s+\\n/g, '\\n');

// Replace \n with actual newlines
keyValue = keyValue.replace(/\\n/g, '\n');

// Trim and clean each line
const lines = keyValue.split('\n').map(line => line.trim()).filter(line => line.length > 0);

// Reconstruct the key
const cleanedKey = lines.join('\n');

// Check if key is valid
if (!cleanedKey.includes('BEGIN PRIVATE KEY') || !cleanedKey.includes('END PRIVATE KEY')) {
  console.error('❌ Key is missing BEGIN or END markers');
  console.error('   The key appears to be corrupted or incomplete.');
  console.error('\n🔧 Solution:');
  console.error('   1. Go to Firebase Console > Project Settings > Service accounts');
  console.error('   2. Click "Generate new private key"');
  console.error('   3. Open the downloaded JSON file');
  console.error('   4. Copy the ENTIRE "private_key" value');
  console.error('   5. Paste it into .env.local on a SINGLE line with quotes and \\n');
  process.exit(1);
}

// Extract key content
const beginIndex = cleanedKey.indexOf('-----BEGIN PRIVATE KEY-----');
const endIndex = cleanedKey.indexOf('-----END PRIVATE KEY-----');
const keyContent = cleanedKey.substring(beginIndex + '-----BEGIN PRIVATE KEY-----'.length, endIndex).trim();

// Remove all whitespace from key content and reformat
const base64Only = keyContent.replace(/\s+/g, '');

if (base64Only.length < 1000) {
  console.error('❌ Key content is too short');
  console.error(`   Found ${base64Only.length} characters, expected 1000+`);
  console.error('   The key appears to be truncated.');
  process.exit(1);
}

// Reformat into 64-char lines
const reformatted = [];
for (let i = 0; i < base64Only.length; i += 64) {
  reformatted.push(base64Only.substring(i, i + 64));
}

const finalKey = '-----BEGIN PRIVATE KEY-----\n' + 
                 reformatted.join('\n') + 
                 '\n-----END PRIVATE KEY-----\n';

// Convert back to .env format (with \n escapes)
const envFormat = finalKey.replace(/\n/g, '\\n');

console.log('✅ Key cleaned and reformatted successfully!');
console.log(`\n📋 Correct format for .env.local:\n`);
console.log(`FIREBASE_PRIVATE_KEY="${envFormat}"`);
console.log(`\n💡 Copy the line above and replace FIREBASE_PRIVATE_KEY in your .env.local file.`);



