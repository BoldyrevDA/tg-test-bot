import 'dotenv/config'
import express from 'express'
import bodyParser from "body-parser";
import axios from "axios";
import { ocrSpace } from 'ocr-space-api-wrapper';

const { TOKEN, WEBHOOK_HOST, DEFAULT_IMAGE_ID } = process.env;

console.log("=>(windows-service.js:13) token: ", TOKEN?.slice(-4));

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${TOKEN}`;

const URI = `/webhook/${TOKEN}`; // TODO use X-Telegram-Bot-Api-Secret-Token
let updatesOffset = 0;

const app = express()
app.use(bodyParser.json())

async function polling() {
    const INTERVAL = 1000;
    const TIMEOUT = 100;

    try {
        let response = await axios.post(
            `${TELEGRAM_API}/getUpdates`,
            {
                'allowed_updates': ['message'],
                timeout: TIMEOUT,
                offset: updatesOffset,
            },
        )
        const updates =  response.data?.result || [];
        for (let update of updates) {
            handleMessage(update.message)
            updatesOffset = update.update_id + 1;
        }
    } catch (e) {
        console.error('polling error')
        console.error(e);
    } finally {
        // await new Promise(resolve => setTimeout(resolve, INTERVAL));
        // await polling();
        setTimeout(polling, INTERVAL);
    }
}

async function setWebhook() {
    const WEBHOOK_URL = WEBHOOK_HOST + URI;
    try {
        const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
        console.log(res.data);
    } catch (e) {
        console.error('setWebhook error')
        console.error(e);
    }
}

async function deleteWebhook() {
    try {
        const res = await axios.post(`${TELEGRAM_API}/deleteWebhook`);
        console.log(res.data);
    } catch (e) {
        console.error('deleteWebhook error')
    }
}

const init = async () => {
    if (WEBHOOK_HOST) {
        await setWebhook();
    } else {
        await deleteWebhook();
        polling();
    }
}

async function noPhotoResponse(chatId) {
    if (DEFAULT_IMAGE_ID) {
        await axios.post(`${TELEGRAM_API}/sendPhoto`, {
            chat_id: chatId,
            photo: DEFAULT_IMAGE_ID
        })
    } else {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: "photo required for OCR"
        })
    }
}

async function handleMessage(message) {
    const chatId = message.chat.id
    const photos = message?.photo;
    const fileId = photos?.[photos.length - 1]?.file_id;

    console.log("fileId", fileId);
    if (fileId) {
        try {
            const response = await axios.post(
                `${TELEGRAM_API}/getFile`,
                { file_id: fileId }
            );
            const file = response.data?.result;
            const filePath = file?.file_path;
            const fileUrl = `${TELEGRAM_FILE_API}/${filePath}`;

            const ocrResponse = await ocrSpace(fileUrl, { filetype: filePath.slice(-3) });
            const imgText = ocrResponse?.ParsedResults?.[0]?.ParsedText;

            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: imgText || "I don't see text on picture"
            })

            console.log("file.file_path", `${TELEGRAM_FILE_API}/${file?.file_path}`);
        } catch (e) {
            console.log(e);
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: "server error"
            })
        }
    } else {
        await noPhotoResponse(chatId)
    }
}

app.post(URI, async (req, res) => {
    const { message } = req.body;
    await handleMessage(message);
    return res.send();
})

// fallback
app.get('/', (req, res) => {
    res.send('ok')
});


app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000);
    await init();
})
