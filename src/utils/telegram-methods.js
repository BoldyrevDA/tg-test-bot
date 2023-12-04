import axios from "axios";
import {TELEGRAM_API, URI, WEBHOOK_HOST} from "../constants/configs.js";

let updatesOffset = 0;

export function sendMessage(chatId, text) {
    return axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: 'Markdown'
    })
}

export function sendPhoto(chatId, photo, caption) {
    return axios.post(`${TELEGRAM_API}/sendPhoto`, {
        chat_id: chatId,
        photo,
        caption,
        parse_mode: 'Markdown'
    })
}

export async function polling(onMessage) {
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
        const updates = response.data?.result || [];
        for (let update of updates) {
            onMessage(update.message)
            updatesOffset = update.update_id + 1;
        }
    } catch (e) {
        console.error('polling error')
        console.error(e);
    } finally {
        // await new Promise(resolve => setTimeout(resolve, INTERVAL));
        // await polling();
        setTimeout(() => polling(onMessage), INTERVAL);
    }
}

export async function setWebhook() {
    const WEBHOOK_URL = WEBHOOK_HOST + URI;
    try {
        const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
        console.log(res.data);
    } catch (e) {
        console.error('setWebhook error')
        console.error(e);
    }
}

export async function deleteWebhook() {
    try {
        const res = await axios.post(`${TELEGRAM_API}/deleteWebhook`);
        console.log(res.data);
    } catch (e) {
        console.error('deleteWebhook error')
    }
}