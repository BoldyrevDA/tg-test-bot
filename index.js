import 'dotenv/config'
import express from 'express'
import bodyParser from "body-parser";
import fetch from "node-fetch";

const { TOKEN, SERVER_URL } = process.env;
console.log("=>(index.js:7) process.env", process.env);

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`; // TODO use X-Telegram-Bot-Api-Secret-Token
const WEBHOOK_URL = SERVER_URL + URI;

const app = express()
app.use(bodyParser.json())

const init = async () => {
    const res = await fetch(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
    console.log(res.data);
}

app.post(URI, async (req, res) => {
    console.log(req.body)

    const chatId = req.body.message.chat.id
    const text = req.body.message.text

    const body = JSON.stringify({
        chat_id: chatId,
        text: text
    });

    await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body,
    });

    return res.send()
})

app.listen(process.env.PORT || 5000, async () => {
    console.log('🚀 app running on port', process.env.PORT || 5000);
    await init();
})
