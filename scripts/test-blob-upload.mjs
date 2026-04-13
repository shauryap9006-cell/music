import { put } from '@vercel/blob';
import { readFile } from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

async function uploadTestSong() {
  const songName = '100 Million_spotdown.org.mp3';
  const filePath = path.join(process.cwd(), 'songs', songName);
  
  console.log(`Reading ${filePath}...`);
  const buffer = await readFile(filePath);
  
  console.log('Uploading to Vercel Blob...');
  const blob = await put(`library/${songName}`, buffer, {
    access: 'public',
  });
  
  console.log('Upload successful!');
  console.log('URL:', blob.url);
}

uploadTestSong().catch(console.error);
