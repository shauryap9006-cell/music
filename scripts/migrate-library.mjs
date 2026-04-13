import { put } from '@vercel/blob';
import { readdir, readFile, writeFile } from 'fs/promises';
import { parseBuffer } from 'music-metadata';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const CONFIG = {
  sources: [
    { dir: 'songs', scope: 'library', folder: 'Songs Library' },
    { dir: 'public/preview-songs', scope: 'preview', folder: 'Preview Songs' },
    { dir: 'c:/Users/shaur/OneDrive/hakathon/songs_backup', scope: 'library', folder: 'Backup Collection' }
  ],
  output: 'src/lib/songs-catalog.json'
};

function cleanTitle(filename) {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/_spotdown\.org/gi, "")
    .replace(/\s*\(\d+\)$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function migrate() {
  const catalog = [];
  const processedHashes = new Set(); // Simple uniqueness check

  for (const source of CONFIG.sources) {
    console.log(`\n--- Scanning ${source.dir} ---`);
    let files = [];
    try {
      files = (await readdir(source.dir)).filter(f => f.match(/\.(mp3|flac|wav|ogg)$/i));
    } catch (e) {
      console.warn(`Could not read ${source.dir}: ${e.message}`);
      continue;
    }

    for (const filename of files) {
      const filePath = path.join(source.dir, filename);
      const title = cleanTitle(filename);
      
      // Basic duplicate skip within the same migration run
      if (processedHashes.has(title.toLowerCase())) {
        console.log(`Skipping duplicate: ${title}`);
        continue;
      }

      console.log(`Processing: ${title}...`);
      
      try {
        const buffer = await readFile(filePath);
        const metadata = await parseBuffer(buffer);
        
        // 1. Upload Artwork (if exists)
        let posterUrl = null;
        const picture = metadata.common.picture?.[0];
        if (picture) {
          const artName = `artwork/${title.replace(/\s+/g, '-')}-${Date.now()}.jpg`;
          const artBlob = await put(artName, picture.data, {
            access: 'public',
            contentType: picture.format || 'image/jpeg'
          });
          posterUrl = artBlob.url;
        }

        // 2. Upload Audio
        const audioName = `${source.scope}/${filename}`;
        const audioBlob = await put(audioName, buffer, {
          access: 'public',
          contentType: 'audio/mpeg'
        });

        // 3. Add to Catalog
        catalog.push({
          id: `cloud-${Math.random().toString(36).substr(2, 9)}`,
          audio_url: audioBlob.url,
          title: metadata.common.title?.trim() || title,
          artist: metadata.common.artist?.trim() || "Unknown Artist",
          album: metadata.common.album?.trim() || null,
          duration: metadata.format.duration ? Math.round(metadata.format.duration) : null,
          poster_url: posterUrl,
          source: "cloud",
          folder: source.folder,
          play_count: 0
        });

        processedHashes.add(title.toLowerCase());
        console.log(`Successfully migrated: ${title}`);
      } catch (e) {
        console.error(`Error migrating ${filename}: ${e.message}`);
      }
    }
  }

  // Save the catalog
  await writeFile(CONFIG.output, JSON.stringify(catalog, null, 2));
  console.log(`\nMigration Complete! Catalog saved to ${CONFIG.output}`);
  console.log(`Total songs migrated: ${catalog.length}`);
}

migrate().catch(console.error);
