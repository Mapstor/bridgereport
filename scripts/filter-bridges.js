const fs = require('fs');
const path = require('path');

const MIN_LENGTH_FT = 50;
const bridgesDir = 'data/bridges';
const outputDir = 'data/bridges-filtered';

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const states = fs.readdirSync(bridgesDir).filter(f =>
  fs.statSync(path.join(bridgesDir, f)).isDirectory()
);

let totalBridges = 0;
let keptBridges = 0;
let removedBridges = 0;
let totalSizeBefore = 0;
let totalSizeAfter = 0;
const stateCounts = {};

console.log('Filtering bridges >= ' + MIN_LENGTH_FT + 'ft');
console.log('');

for (const state of states) {
  const stateDir = path.join(bridgesDir, state);
  const outputStateDir = path.join(outputDir, state);
  const files = fs.readdirSync(stateDir).filter(f => f.endsWith('.json'));

  // Create state output directory
  if (!fs.existsSync(outputStateDir)) {
    fs.mkdirSync(outputStateDir, { recursive: true });
  }

  let stateTotal = 0;
  let stateKept = 0;
  let stateSizeBefore = 0;
  let stateSizeAfter = 0;

  for (const file of files) {
    const filePath = path.join(stateDir, file);
    const fileSize = fs.statSync(filePath).size;

    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      totalBridges++;
      stateTotal++;
      totalSizeBefore += fileSize;
      stateSizeBefore += fileSize;

      if (data.lengthFt >= MIN_LENGTH_FT) {
        // Copy to filtered directory
        fs.writeFileSync(path.join(outputStateDir, file), content);
        keptBridges++;
        stateKept++;
        totalSizeAfter += fileSize;
        stateSizeAfter += fileSize;
      } else {
        removedBridges++;
      }
    } catch (e) {
      console.error('Error processing', filePath, e.message);
    }
  }

  stateCounts[state] = {
    total: stateTotal,
    kept: stateKept,
    removed: stateTotal - stateKept,
    sizeBefore: stateSizeBefore,
    sizeAfter: stateSizeAfter
  };

  process.stdout.write(state + ': ' + stateKept + '/' + stateTotal + ' kept\n');
}

console.log('');
console.log('=== FILTER RESULTS ===');
console.log('Threshold: >=' + MIN_LENGTH_FT + 'ft');
console.log('');
console.log('Total bridges: ' + totalBridges.toLocaleString());
console.log('Kept bridges:  ' + keptBridges.toLocaleString() + ' (' + ((keptBridges/totalBridges)*100).toFixed(1) + '%)');
console.log('Removed:       ' + removedBridges.toLocaleString() + ' (' + ((removedBridges/totalBridges)*100).toFixed(1) + '%)');
console.log('');
console.log('Size before: ' + (totalSizeBefore / 1024 / 1024).toFixed(1) + ' MB');
console.log('Size after:  ' + (totalSizeAfter / 1024 / 1024).toFixed(1) + ' MB');
console.log('Reduction:   ' + ((1 - totalSizeAfter/totalSizeBefore) * 100).toFixed(1) + '%');
console.log('');
console.log('Output directory: ' + outputDir);
