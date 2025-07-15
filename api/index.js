const { execSync } = require('child_process');
execSync('cd ..&&npm run dev', { stdio: 'inherit' });
