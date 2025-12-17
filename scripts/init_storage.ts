
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Manual .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');

        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
                process.env[key] = value;
            }
        });
    } catch (error) {
        console.warn('Could not read .env file', error);
    }
}

loadEnv();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function initStorage() {
    console.log('Initializing Supabase Storage...');

    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();

        if (listError) {
            console.error('Error listing buckets:', listError);
            return;
        }

        const bucketName = 'products';
        const productsBucket = buckets.find(b => b.name === bucketName);

        if (productsBucket) {
            console.log(`✅ Bucket '${bucketName}' already exists.`);
        } else {
            console.log(`Creating bucket '${bucketName}'...`);
            const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
                public: true,
                fileSizeLimit: 10485760, // 10MB
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
            });

            if (createError) {
                console.error(`Error creating bucket '${bucketName}': `, createError);
            } else {
                console.log(`✅ Bucket '${bucketName}' created successfully.`);
            }
        }

        // Test Connection
        const { count, error } = await supabase.from('products').select('*', { count: 'exact', head: true });
        if (error) {
            console.error('Error connecting to database:', error.message);
        } else {
            console.log(`✅ Database connected successfully. Found ${count} products.`);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
}

initStorage();

