require('dotenv').config();

const { spawn } = require('child_process');

const allowedEmail = process.env.TUNNEL_ALLOWED_EMAIL?.trim();
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

if (!allowedEmail || !emailPattern.test(allowedEmail)) {
  console.error('Set a valid TUNNEL_ALLOWED_EMAIL in .env before starting the tunnel.');
  process.exit(1);
}

const tunnelArgs = [
  'tunnel',
  '--url',
  `http://localhost:${process.env.PORT || 3000}`,
  '--allowed-mail',
  allowedEmail
];

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
