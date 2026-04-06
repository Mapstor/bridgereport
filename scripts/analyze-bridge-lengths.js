const fs = require('fs');
const path = require('path');

const bridgesDir = 'data/bridges';
const states = fs.readdirSync(bridgesDir).filter(f =>
  fs.statSync(path.join(bridgesDir, f)).isDirectory()
);

let total = 0;
let over100ft = 0;
let over50ft = 0;
let culverts = 0;
const stateCounts = {};

// Sample first 10 states for quick analysis
const sampleStates = states.slice(0, 10);

console.log('Analyzing bridges in:', sampleStates.join(', '));
console.log('');

for (const state of sampleStates) {
  const stateDir = path.join(bridgesDir, state);
  const files = fs.readdirSync(stateDir).filter(f => f.endsWith('.json'));

  let stateTotal = 0;
  let stateOver100 = 0;

  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf-8'));
      total++;
      stateTotal++;

      if (data.designTypeName === 'Culvert') culverts++;
      if (data.lengthFt >= 50) over50ft++;
      if (data.lengthFt >= 100) {
        over100ft++;
        stateOver100++;
      }
    } catch (e) {}
  }

  const pct = stateTotal > 0 ? ((stateOver100/stateTotal)*100).toFixed(1) : '0';
  stateCounts[state] = { total: stateTotal, over100: stateOver100, pct };
}

console.log('=== Sample Analysis (10 states) ===');
console.log('Total bridges sampled:', total);
console.log('Over 100ft:', over100ft, '(' + ((over100ft/total)*100).toFixed(1) + '%)');
console.log('Over 50ft:', over50ft, '(' + ((over50ft/total)*100).toFixed(1) + '%)');
console.log('Culverts:', culverts, '(' + ((culverts/total)*100).toFixed(1) + '%)');
console.log('');
console.log('Per state:');
Object.entries(stateCounts).forEach(([s, c]) => {
  console.log('  ' + s + ': ' + c.over100 + '/' + c.total + ' over 100ft (' + c.pct + '%)');
});

// Extrapolate to full dataset
console.log('');
console.log('=== Extrapolated for 623K bridges ===');
const pct100 = over100ft / total;
console.log('Estimated bridges >= 100ft: ~' + Math.round(623216 * pct100).toLocaleString());
