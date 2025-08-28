#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_FILE_PATH = path.join(__dirname, '../src/environments/environment.base.ts');

// Environment variable mappings
const ENV_VARS = {
  'NG_APP_FIREBASE_API_KEY': process.env.NG_APP_FIREBASE_API_KEY,
  'NG_APP_FIREBASE_APP_ID': process.env.NG_APP_FIREBASE_APP_ID,
  'NG_APP_FIREBASE_MESSENGING_SENDER_ID': process.env.NG_APP_FIREBASE_MESSENGING_SENDER_ID,
  'NG_APP_FIREBASE_MEASUREMENT_ID': process.env.NG_APP_FIREBASE_MEASUREMENT_ID,
};

function updateEnvironmentFile() {
  try {
    // Read the current environment file
    const envContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    
    // Replace import.meta.env references with actual values
    let updatedContent = envContent;
    
    Object.entries(ENV_VARS).forEach(([key, value]) => {
      if (value) {
        // Replace import.meta.env.KEY with actual quoted value
        const regex = new RegExp(`import\\.meta\\.env\\.${key}`, 'g');
        updatedContent = updatedContent.replace(regex, `'${value}'`);
        console.log(`Updated ${key}`);
      } else {
        console.warn(`Warning: Environment variable ${key} is not set`);
      }
    });
    
    // Write the updated content back to the file
    fs.writeFileSync(ENV_FILE_PATH, updatedContent);
    console.log('Environment file updated successfully');
    
  } catch (error) {
    console.error('Error updating environment file:', error);
    process.exit(1);
  }
}

updateEnvironmentFile();