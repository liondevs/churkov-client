const { app } = require('electron');
const path = require('path');
const fs = require('fs');

const logPath = path.join(app.getPath('userData'), 'updater.log');

function write(level, ...args) {
  const line = `[${new Date().toISOString()}] [${level}] ${args.join(' ')}\n`;
  fs.appendFileSync(logPath, line);
  if (level === 'error') console.error(line);
  else console.log(line);
}

module.exports = {
  info: (...args) => write('INFO', ...args),
  warn: (...args) => write('WARN', ...args),
  error: (...args) => write('ERROR', ...args),
  debug: (...args) => write('DEBUG', ...args),
  transports: { file: { level: 'info' } },
};
