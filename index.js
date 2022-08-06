import 'dotenv/config'
import express from 'express'
import bodyParser from "body-parser";
import axios from "axios";

const { TOKEN, SERVER_URL } = process.env;
console.log("=>(index.js:7) process.env", process.env);

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
    const fileId = message.photo[2].file_id;

    const file = await axios.post(`${TELEGRAM_API}/getFile`, { file_id: fileId });
    console.log("file.file_path", file.file_path);



    await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: text
    })

    return res.send()
})

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000);
    await init();
})
