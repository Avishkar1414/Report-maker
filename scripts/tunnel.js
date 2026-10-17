require('dotenv').config();

const { spawn } = require('child_process');

const allowedEmails = (process.env.TUNNEL_ALLOWED_EMAIL || '')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const invalidEmails = allowedEmails.filter((email) => !emailPattern.test(email));

if (allowedEmails.length === 0 || invalidEmails.length > 0) {
  console.error('Set one or more valid, comma-separated emails in TUNNEL_ALLOWED_EMAIL in .env.');
  process.exit(1);
}

const tunnelArgs = [
  'tunnel',
  '--url',
  `http://localhost:${process.env.PORT || 3000}`
];
for (const email of allowedEmails) tunnelArgs.push('--allowed-mail', email);

// The Windows npm shim is a script rather than a native executable. Invoke it
// through PowerShell with quoted arguments instead of child_process shell mode.
const command = process.platform === 'win32' ? 'powershell.exe' : 'cloudflared';
const args = process.platform === 'win32'
  ? ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', `cloudflared ${tunnelArgs.map((arg) => `'${arg}'`).join(' ')}`]
  : tunnelArgs;

const tunnel = spawn(command, args, {
  stdio: 'inherit',
});

tunnel.on('error', (error) => {
  console.error(`Could not start cloudflared: ${error.message}`);
  process.exitCode = 1;
});

tunnel.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
