const fs = require('fs');
const path = require('path');

const bridgesDir = 'data/bridges';
const states = fs.readdirSync(bridgesDir).filter(f =>
  fs.statSync(path.join(bridgesDir, f)).isDirectory()
);

const thresholds = [20, 30, 50, 75, 100, 150, 200];
const counts = {};
thresholds.forEach(t => counts[t] = 0);

let total = 0;
let maxLength = 0;
let maxBridge = null;

// Analyze ALL states
console.log('Analyzing all', states.length, 'states...');

for (const state of states) {
  const stateDir = path.join(bridgesDir, state);
  const files = fs.readdirSync(stateDir).filter(f => f.endsWith('.json'));

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf-8'));
      total++;

      const len = data.lengthFt || 0;
      if (len > maxLength) {
        maxLength = len;
        maxBridge = { name: data.facilityCarried, state: data.state, length: len, file };
      }

      thresholds.forEach(t => {
        if (len >= t) counts[t]++;
      });
    } catch (e) {}
  }
  process.stdout.write('.');
}

console.log('\n');
console.log('=== Full Dataset Analysis ===');
console.log('Total bridges:', total.toLocaleString());
console.log('');
console.log('Bridges by length threshold:');
thresholds.forEach(t => {
  const pct = ((counts[t]/total)*100).toFixed(1);
  console.log('  >=' + t + 'ft: ' + counts[t].toLocaleString() + ' (' + pct + '%)');
});
console.log('');
console.log('Longest bridge found:');
console.log('  ' + maxBridge.name + ' (' + maxBridge.state + '): ' + maxBridge.length.toLocaleString() + 'ft');
