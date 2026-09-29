/**
 * dev-clean: ports 5000/5173 ke stale processes band karta hai aur Vite ka
 * dependency cache clear karta hai — fresh `npm run dev` ke liye.
 * Usage: npm run dev-clean
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORTS = [5000, 5173];

function pidsOnPort(port) {
  try {
    const out = execSync('netstat -ano', { encoding: 'utf8' });
    const pids = new Set();
    for (const line of out.split('\n')) {
      if (line.includes(`:${port} `) && /LISTENING/i.test(line)) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      }
    }
    return [...pids];
  } catch {
    return [];
  }
}

let killed = 0;
for (const port of PORTS) {
  for (const pid of pidsOnPort(port)) {
    try {
      execSync(`taskkill /F /T /PID ${pid}`, { stdio: 'ignore' });
      console.log(`  ✓ port ${port} → PID ${pid} band kiya`);
      killed++;
    } catch {
      /* already gone */
    }
  }
}
if (!killed) console.log('  ✓ koi stale process nahi mila');

// Vite dependency cache clear (corrupt HMR cache "destroy is not a function" deta hai)
const viteCache = path.join(__dirname, 'client', 'node_modules', '.vite');
if (fs.existsSync(viteCache)) {
  fs.rmSync(viteCache, { recursive: true, force: true });
  console.log('  ✓ Vite cache clear kiya');
}

console.log('\nAb chalao: npm run dev\n');
