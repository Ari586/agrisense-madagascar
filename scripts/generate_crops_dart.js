// Script to extract all crops from legacy-data.ts and generate Dart code
const fs = require('fs');
const path = require('path');

const tsFile = fs.readFileSync(
  path.resolve(__dirname, '../src/components/agrisense/legacy-data.ts'),
  'utf8'
);

// Extract getCropImagePath overrides
const overridesMatch = tsFile.match(/const overrides[\s\S]*?};/);
const overrides = {};
if (overridesMatch) {
  const lines = overridesMatch[0].split('\n');
  for (const line of lines) {
    const m = line.match(/'([^']+)':\s*'([^']+)'/);
    if (m) overrides[m[1]] = m[2];
  }
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-–\s]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

const customImageMap = {
  'ble': 'blé.jpg',
  'chou_fleur': 'chou_fleur.jpg',
  'epinard': 'epinard.jpg',
  'poivron': 'poivron_doux.jpg',
  'poivron_doux': 'poivron_doux.jpg',
  'sakay_fanendy': 'poivron_doux.jpg',
  'voatabia_cada': 'voatabia_lava.jpg',
  'voatabia_japonais': 'voatabia_boribory.jpg',
  'laisoa': 'chou_chinois.jpg',
  'anapatsa_queue_de_renard': 'amarante_queue_de_renard.jpg',
  'anamalaho': 'anamalaho.jpg',
  'bredes_mafana': 'bredes_mafana.jpg',
  'tongolo_mena': 'tongolo_gasy.jpg',
  'kotomila': 'persil.jpg',
  'patsoy': 'petsay.jpg',
  'poireau': 'celeri.jpg',
  'soja': 'haricots_grains.jpg',
  'voanemba': 'voanjobory.jpg',
  'tissam': 'petsay.jpg',
  'ramirebaka': 'anatsonga.jpg',
  'anapatsa': 'anatsonga.jpg',
  'voatavo': 'courgette.jpg',
  'tournesol': 'luzerne.jpg',
  'voasary': 'papaye.jpg',
};

function getImagePath(cropName) {
  const slug = slugify(cropName);
  
  if (overrides[slug]) {
    const basename = path.basename(overrides[slug]);
    return `assets/voly/${basename}`;
  }

  if (customImageMap[slug]) {
    return `assets/voly/${customImageMap[slug]}`;
  }

  const imgDir = path.resolve(__dirname, '../public/assets/voly');
  const candidates = [
    `${slug}.jpg`,
    `${slug}.png`,
  ];
  for (const c of candidates) {
    if (fs.existsSync(path.join(imgDir, c))) {
      return `assets/voly/${c}`;
    }
  }

  // Fallback search by prefix/token
  for (const file of availableImages) {
    const nameWithoutExt = file.replace(/\.[^/.]+$/, "");
    if (slug.includes(nameWithoutExt) || nameWithoutExt.includes(slug)) {
      return `assets/voly/${file}`;
    }
  }

  return 'assets/voly/anana.jpg'; // default fallback photo
}

// Check available images
const imgDir = path.resolve(__dirname, '../public/assets/voly');
const availableImages = fs.readdirSync(imgDir);

// Parse CROPS_DATA entries
const cropsRegex = /'([^']+)':\s*\{[^}]*"emoji":\s*"([^"]*)"[\s\S]*?"name":\s*"([^"]*)"[\s\S]*?"season":\s*"([^"]*)"[\s\S]*?"duration":\s*"([^"]*)"[\s\S]*?"climate":\s*"([^"]*)"[\s\S]*?"spacing":\s*"([^"]*)"[\s\S]*?"yield":\s*"([^"]*)"[\s\S]*?"waterNeeds":\s*"([^"]*)"[\s\S]*?"soil":\s*"([^"]*)"[\s\S]*?"seed":\s*"([\s\S]*?)"[\s\S]*?"nursery":\s*"([\s\S]*?)"[\s\S]*?"plantingGuide":\s*"([\s\S]*?)"[\s\S]*?"steps":\s*\[([\s\S]*?)\][\s\S]*?"tips":\s*\[([\s\S]*?)\][\s\S]*?"cat":\s*"([^"]*)"[\s\S]*?"cost":\s*(\d+)[\s\S]*?"rev":\s*(\d+)[\s\S]*?"weeks":\s*(\d+)/g;

// Simpler approach: find each crop entry block
const cropEntries = [];
const blockRegex = /^\s+'([^']+)':\s*\{$/gm;
let match;
const positions = [];
while ((match = blockRegex.exec(tsFile)) !== null) {
  // Only match if within CROPS_DATA (before getCropImagePath function)
  if (match.index < tsFile.indexOf('export function getCropImagePath')) {
    positions.push({ name: match[1], start: match.index });
  }
}

// For each crop, extract its data
for (let i = 0; i < positions.length; i++) {
  const cropName = positions[i].name;
  const start = positions[i].start;
  const end = i < positions.length - 1 ? positions[i + 1].start : tsFile.indexOf('export function getCropImagePath');
  const block = tsFile.substring(start, end);
  
  const extract = (key) => {
    const m = block.match(new RegExp(`"${key}":\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
  };
  
  const extractNum = (key) => {
    const m = block.match(new RegExp(`"${key}":\\s*(\\d+)`));
    return m ? parseInt(m[1]) : 0;
  };

  // Extract steps
  const stepsMatch = block.match(/"steps":\s*\[([\s\S]*?)\]/);
  const steps = [];
  if (stepsMatch) {
    const stepRegex = /"week":\s*"([^"]*)"[\s\S]*?"action":\s*"([^"]*)"/g;
    let sm;
    while ((sm = stepRegex.exec(stepsMatch[1])) !== null) {
      steps.push({ week: sm[1], action: sm[2] });
    }
  }

  // Extract tips
  const tipsMatch = block.match(/"tips":\s*\[([\s\S]*?)\]/);
  const tips = [];
  if (tipsMatch) {
    const tipRegex = /"([^"]+)"/g;
    let tm;
    while ((tm = tipRegex.exec(tipsMatch[1])) !== null) {
      tips.push(tm[1]);
    }
  }

  const catMatch = block.match(/"cat":\s*"([^"]*)"/);
  const category = catMatch ? catMatch[1] : 'Hafa';

  const imagePath = getImagePath(cropName);

  cropEntries.push({
    key: cropName,
    emoji: extract('emoji'),
    name: extract('name'),
    season: extract('season'),
    duration: extract('duration'),
    climate: extract('climate'),
    spacing: extract('spacing'),
    yield_: extract('yield'),
    waterNeeds: extract('waterNeeds'),
    soil: extract('soil'),
    seed: extract('seed'),
    nursery: extract('nursery'),
    plantingGuide: extract('plantingGuide'),
    steps,
    tips,
    category,
    cost: extractNum('cost'),
    revenue: extractNum('rev'),
    weeks: extractNum('weeks'),
    imagePath,
  });
}

console.log(`Found ${cropEntries.length} crops`);
console.log(`Available images: ${availableImages.length}`);

// Generate Dart code
function escapeDart(s) {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\$/g, '\\$')
    .replace(/\r?\n/g, '\\n');
}

let dart = `/// Step in a crop's growing timeline.
class CropStep {
  final String week;
  final String action;

  const CropStep({required this.week, required this.action});
}

/// Complete crop data — direct port from legacy-data.ts CROPS_DATA.
class CropData {
  final String emoji;
  final String name;
  final String season;
  final String duration;
  final String climate;
  final String spacing;
  final String yield_;
  final String waterNeeds;
  final String soil;
  final String seed;
  final String nursery;
  final String plantingGuide;
  final List<CropStep> steps;
  final List<String> tips;
  final String category;
  final int cost;
  final int revenue;
  final int weeks;
  final String imagePath;

  const CropData({
    required this.emoji,
    required this.name,
    required this.season,
    required this.duration,
    required this.climate,
    required this.spacing,
    required this.yield_,
    required this.waterNeeds,
    required this.soil,
    required this.seed,
    required this.nursery,
    required this.plantingGuide,
    required this.steps,
    required this.tips,
    required this.category,
    required this.cost,
    required this.revenue,
    required this.weeks,
    this.imagePath = '',
  });
}

/// All crops data — ported from CROPS_DATA in legacy-data.ts
const Map<String, CropData> cropsData = {
`;

for (const crop of cropEntries) {
  dart += `  '${escapeDart(crop.key)}': CropData(\n`;
  dart += `    emoji: '${escapeDart(crop.emoji)}',\n`;
  dart += `    name: '${escapeDart(crop.name)}',\n`;
  dart += `    season: '${escapeDart(crop.season)}',\n`;
  dart += `    duration: '${escapeDart(crop.duration)}',\n`;
  dart += `    climate: '${escapeDart(crop.climate)}',\n`;
  dart += `    spacing: '${escapeDart(crop.spacing)}',\n`;
  dart += `    yield_: '${escapeDart(crop.yield_)}',\n`;
  dart += `    waterNeeds: '${escapeDart(crop.waterNeeds)}',\n`;
  dart += `    soil: '${escapeDart(crop.soil)}',\n`;
  dart += `    seed: '${escapeDart(crop.seed)}',\n`;
  dart += `    nursery: '${escapeDart(crop.nursery)}',\n`;
  dart += `    plantingGuide: '${escapeDart(crop.plantingGuide)}',\n`;
  dart += `    imagePath: '${escapeDart(crop.imagePath)}',\n`;
  dart += `    steps: [\n`;
  for (const step of crop.steps) {
    dart += `      CropStep(week: '${escapeDart(step.week)}', action: '${escapeDart(step.action)}'),\n`;
  }
  dart += `    ],\n`;
  dart += `    tips: [\n`;
  for (const tip of crop.tips) {
    dart += `      '${escapeDart(tip)}',\n`;
  }
  dart += `    ],\n`;
  dart += `    category: '${escapeDart(crop.category)}',\n`;
  dart += `    cost: ${crop.cost},\n`;
  dart += `    revenue: ${crop.revenue},\n`;
  dart += `    weeks: ${crop.weeks},\n`;
  dart += `  ),\n`;
}

dart += `};\n\n`;

// Add categories
dart += `/// Available filter categories
const List<String> cropCategories = [
  'Rehetra',
  'Céréales',
  'Tubercules',
  'Légumineuses',
  'Légumes',
  'Feuilles',
  'Brèdes',
  'Racines',
  'Bulbes',
  'Arbres Fruitiers',
  'Fruits',
  'Herbes',
  'Hafa',
];

/// Region-based crop recommendations
const Map<String, List<String>> regionRecommendations = {
  'Analamanga': ['Vary', 'Katsaka', 'Voatabia', 'Anana', 'Karoty', 'Tongolo', 'Salady'],
  'Vakinankaratra': ['Vary', 'Ovy', 'Karoty', 'Salady', 'Blé', 'Orge', 'Brocoli', 'Chou-fleur'],
  'Itasy': ['Vary', 'Katsaka', 'Voatabia', 'Voanjo', 'Tsaramaso'],
  'Bongolava': ['Vary', 'Katsaka', 'Mangahazo', 'Voanjo'],
  'Sofia': ['Vary', 'Katsaka', 'Mangahazo', 'Voanjo', 'Sakay'],
  'Boeny': ['Vary', 'Mangahazo', 'Voatabia', 'Sakay', 'Angivy'],
  'Betsiboka': ['Vary', 'Katsaka', 'Voanjo', 'Mangahazo'],
  'Melaky': ['Mangahazo', 'Katsaka', 'Voanjo'],
  'Alaotra-Mangoro': ['Vary', 'Katsaka', 'Voatabia', 'Tsaramaso'],
  'Atsinanana': ['Vary', 'Mangahazo', 'Sakay', 'Voasary'],
  'Analanjirofo': ['Vary', 'Mangahazo', 'Sakay', 'Voasary'],
  'Amoron\\'i Mania': ['Vary', 'Katsaka', 'Ovy', 'Tsaramaso'],
  'Haute Matsiatra': ['Vary', 'Ovy', 'Karoty', 'Tsaramaso', 'Blé'],
  'Vatovavy-Fitovinany': ['Vary', 'Mangahazo', 'Sakay'],
  'Atsimo-Atsinanana': ['Vary', 'Mangahazo', 'Sakay', 'Katsaka'],
  'Ihorombe': ['Vary', 'Katsaka', 'Voanjo'],
  'Menabe': ['Katsaka', 'Mangahazo', 'Voanjo', 'Sakay'],
  'Atsimo-Andrefana': ['Katsaka', 'Mangahazo', 'Voanjo', 'Voatavo'],
  'Androy': ['Katsaka', 'Mangahazo', 'Voanjo'],
  'Anosy': ['Vary', 'Mangahazo', 'Voanjo'],
  'Diana': ['Vary', 'Mangahazo', 'Sakay', 'Voasary'],
  'Sava': ['Vary', 'Mangahazo', 'Sakay', 'Voasary'],
};

/// Helper to get the image path for a crop, with fallback
String getCropImagePath(String cropKey) {
  final crop = cropsData[cropKey];
  if (crop != null && crop.imagePath.isNotEmpty) {
    return crop.imagePath;
  }
  return '';
}
`;

fs.writeFileSync(
  path.resolve(__dirname, '../flutter_project/lib/data/crops_data.dart'),
  dart
);

console.log('Generated crops_data.dart successfully!');
console.log('Crops with images:');
for (const crop of cropEntries) {
  const status = crop.imagePath ? '✅' : '❌';
  console.log(`  ${status} ${crop.key} → ${crop.imagePath || 'no image'}`);
}
