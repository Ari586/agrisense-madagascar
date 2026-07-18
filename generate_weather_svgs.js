const fs = require('fs');
const path = require('path');

const regions = [
    "Diana", "Sava", "Itasy", "Analamanga", "Vakinankaratra", "Bongolava", 
    "Sofia", "Boeny", "Betsiboka", "Melaky", "AlaotraMangoro", "Atsinanana", 
    "Analanjirofo", "AmoroniMania", "HauteMatsiatra", 
    "VatovavyFitovinany", "AtsimoAtsinanana", "Ihorombe", "Menabe", 
    "AtsimoAndrefana", "Androy", "Anosy"
];

const weathers = {
    hot_windy: { color1: '#ff9966', color2: '#ff5e62', icon: '💨' },
    humid_rain: { color1: '#4b6cb7', color2: '#182848', icon: '🌧️' },
    highlands: { color1: '#8e9eab', color2: '#eef2f3', icon: '☁️' },
    stormy: { color1: '#141e30', color2: '#243b55', icon: '⛈️' },
    extreme_dry: { color1: '#CAC531', color2: '#F3F9A7', icon: '☀️' }
};

const outputDir = path.join(__dirname, 'public', 'assets', 'weather');

for (const region of regions) {
    for (const [weather, props] of Object.entries(weathers)) {
        const svg = `
<svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <linearGradient id="grad_${weather}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${props.color1};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${props.color2};stop-opacity:1" />
        </linearGradient>
    </defs>
    <rect width="1920" height="1080" fill="url(#grad_${weather})" />
    <!-- Dynamic overlay for glassmorphism effect -->
    <circle cx="1500" cy="200" r="400" fill="#ffffff" opacity="0.1" />
    <circle cx="300" cy="900" r="600" fill="#000000" opacity="0.1" />
    
    <text x="50%" y="45%" font-family="system-ui, sans-serif" font-size="120" font-weight="900" fill="#ffffff" opacity="0.3" text-anchor="middle" dominant-baseline="middle">
        ${region.replace(/([A-Z])/g, ' $1').trim()}
    </text>
    <text x="50%" y="65%" font-family="system-ui, sans-serif" font-size="100" fill="#ffffff" opacity="0.5" text-anchor="middle" dominant-baseline="middle">
        ${props.icon} ${weather.replace(/_/g, ' ').toUpperCase()}
    </text>
</svg>`;
        
        const filename = `${region}_${weather}.svg`;
        fs.writeFileSync(path.join(outputDir, filename), svg.trim());
    }
}
console.log('Successfully generated SVGs for EXACT regions x 5 weathers!');
