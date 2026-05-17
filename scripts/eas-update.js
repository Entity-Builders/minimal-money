const fs = require('fs');
const { spawnSync } = require('child_process');

const profile = process.argv[2];
if (!profile) {
  console.error("Please specify a profile (e.g. preview or production)");
  process.exit(1);
}

const branch = process.argv[3] || profile;

const easJsonPath = './eas.json';
if (!fs.existsSync(easJsonPath)) {
  console.error("eas.json not found in the current directory.");
  process.exit(1);
}

const easJson = JSON.parse(fs.readFileSync(easJsonPath, 'utf8'));
const envConfig = easJson.build[profile]?.env || {};

console.log(`[EAS Update] Injected environment variables from '${profile}' profile in eas.json:`);
for (const [key, value] of Object.entries(envConfig)) {
  console.log(`  - ${key}=${value}`);
}

const env = { ...process.env, ...envConfig };

const result = spawnSync('eas', ['update', '--branch', branch, '--message', `OTA update for ${branch}`, '--environment', profile], {
  stdio: 'inherit',
  env,
});

if (result.error) {
  console.error("Failed to start eas update:", result.error);
  process.exit(1);
}

process.exit(result.status);
