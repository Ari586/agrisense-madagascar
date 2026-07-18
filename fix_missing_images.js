const fs = require('fs');
const path = require('path');
const https = require('https');

const weathers = {
    hot_windy: "windy and hot weather",
    humid_rain: "heavy rain and humid weather",
    highlands: "cloudy and fresh highlands weather",
    stormy: "dark stormy and thunderstorm weather",
    extreme_dry: "extreme dry desert and hot sun weather"
};

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

async function fix() {
    const dir = path.join(__dirname, 'public', 'assets', 'weather');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));
    
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stats = fs.statSync(fullPath);
        if (stats.size === 0) {
            console.log(`Fixing ${file}...`);
            const parts = file.replace('.jpg', '').split('_');
            const region = parts[0];
            const weatherKey = parts.slice(1).join('_');
            const weatherDesc = weathers[weatherKey];
            
            const prompt = `Beautiful landscape photo of Madagascar ${region.replace(/([A-Z])/g, ' $1').trim()} region during ${weatherDesc}, highly detailed, photorealistic, 8k, nature`;
            const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1600&height=900&nologo=true`;
            
            try {
                await downloadImage(url, fullPath);
                console.log(`Successfully fixed ${file}`);
            } catch (err) {
                console.error(`Error fixing ${file}:`, err);
            }
        }
    }
}

fix();
