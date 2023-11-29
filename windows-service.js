import { Service } from 'node-windows';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptPath = path.join(__dirname, 'index.js');
const { TOKEN, WEBHOOK_HOST, DEFAULT_IMAGE_ID } = process.env;

console.log("=>(windows-service.js:11) scriptPath: ", scriptPath);
console.log("=>(windows-service.js:13) token: ", TOKEN?.slice(-4));

export const winService = new Service({
    name: 'Telegram OCR Bot',
    description: 'Telegram OCR Bot as a Windows service',
    script: scriptPath,
    env: [{
        name: "TOKEN",
        value: TOKEN,
    }, {
        name: "WEBHOOK_HOST",
        value: WEBHOOK_HOST,
    }, {
        name: "DEFAULT_IMAGE_ID",
        value: DEFAULT_IMAGE_ID,
    }],
});