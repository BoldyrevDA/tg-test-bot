import 'dotenv/config'
import express from 'express'
import bodyParser from "body-parser";
import axios from "axios";

const { TOKEN, SERVER_URL } = process.env;

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`; // TODO use X-Telegram-Bot-Api-Secret-Token
const WEBHOOK_URL = SERVER_URL + URI;

const app = express()
app.use(bodyParser.json())

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data);
}

app.post(URI, async (req, res) => {
    console.log(req.body)
    const { message } = req.body;

    const chatId = message.chat.id
    const text = message.text
    const fileId = message?.photo?.[2]?.file_id;
    console.log("fileId", fileId);
    if (fileId) {
        try {
            const response = await axios.post(`${TELEGRAM_API}/getFile`, { file_id: fileId });
            const file = response?.result;
            console.log("file.file_path", `${TELEGRAM_API}/${file?.file_path}`);
        } catch (e) {
            console.log(e);
        }
    }

    if (text) {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: text
        })
    }

    return res.send()
})

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000);
    await init();
})
