/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const https = require('https');

const regions = [
    "Diana", "Sava", "Itasy", "Analamanga", "Vakinankaratra", "Bongolava", 
    "Sofia", "Boeny", "Betsiboka", "Melaky", "AlaotraMangoro", "Atsinanana", 
    "Analanjirofo", "AmoroniMania", "HauteMatsiatra", 
    "VatovavyFitovinany", "AtsimoAtsinanana", "Ihorombe", "Menabe", 
    "AtsimoAndrefana", "Androy", "Anosy"
];

const weathers = {
    hot_windy: "windy and hot weather",
    humid_rain: "heavy rain and humid weather",
    highlands: "cloudy and fresh highlands weather",
    stormy: "dark stormy and thunderstorm weather",
    extreme_dry: "extreme dry desert and hot sun weather"
};

const outputDir = path.join(__dirname, 'public', 'assets', 'weather');

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return downloadImage(response.headers.location, dest).then(resolve).catch(reject);
            }
            if (response.statusCode !== 200) {
                return reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    let tasks = [];
    let count = 0;
    
    // Create an array of tasks
    for (const region of regions) {
        for (const [weatherKey, weatherDesc] of Object.entries(weathers)) {
            const prompt = `Beautiful landscape photo of Madagascar ${region.replace(/([A-Z])/g, ' $1').trim()} region during ${weatherDesc}, highly detailed, photorealistic, 8k, nature`;
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1600&height=900&nologo=true`;
            const dest = path.join(outputDir, `${region}_${weatherKey}.jpg`);
            tasks.push({ region, weatherKey, url, dest });
        }
    }
    
    console.log(`Starting download of ${tasks.length} images...`);
    
    // Process in batches of 10 to avoid overwhelming the server
    const batchSize = 10;
    for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        console.log(`Processing batch ${Math.floor(i/batchSize) + 1} of ${Math.ceil(tasks.length/batchSize)}...`);
        
        await Promise.all(batch.map(async (task) => {
            try {
                if (!fs.existsSync(task.dest)) {
                    await downloadImage(task.url, task.dest);
                }
            } catch (err) {
                console.error(`Failed to download ${task.region}_${task.weatherKey}:`, err.message);
            }
        }));
    }
    
    console.log('All 110 images downloaded successfully!');
}

run();
