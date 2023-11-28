import { Service } from 'node-windows';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.join(__dirname, 'index.js');
console.log("=>(windows-service.js:11) scriptPath: ", scriptPath);

export const winService = new Service({
    name: 'Telegram OCR Bot',
    description: 'Telegram OCR Bot as a Windows service',
    script: scriptPath,
});
