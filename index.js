import 'dotenv/config'
import express from 'express'
import bodyParser from "body-parser";
import axios from "axios";
import {ocrSpace} from 'ocr-space-api-wrapper';
import {LANGUAGE_DEFAULT_IMAGE_IDS} from "./src/constants/images-ids.js";
import {getRandomInteger} from "./src/utils/utils.js";
import {
    DEFAULT_IMAGE_ID,
    DEFAULT_LANGUAGE,
    TELEGRAM_API,
    TELEGRAM_FILE_API,
    URI,
    WEBHOOK_HOST
} from "./src/constants/configs.js";
import {
    deleteWebhook,
    polling,
    sendMessage,
    sendPhoto,
    setWebhook
} from "./src/utils/telegram-methods.js";

const chatsLanguages = {};

const app = express();
app.use(bodyParser.json());

const init = async () => {
    if (WEBHOOK_HOST) {
        await setWebhook();
    } else {
        await deleteWebhook();
        polling(handleMessage);
    }
}

async function noPhotoResponse(chatId) {
    if (DEFAULT_IMAGE_ID) {
        await sendPhoto(chatId, DEFAULT_IMAGE_ID);
    } else {
        await sendMessage(chatId, "photo required for OCR");
    }
}

async function handleCommands(chatId, messageText) {
    const languages = [
        'eng',
        'rus',
        'ger',
        'tur',
    ];
    const command = messageText[0] === '/' ? messageText.slice(1) : messageText;

    if (languages.includes(command)) {
        chatsLanguages[chatId] = command;

        const msg = `recognition language: *${command}*`;
        const imgs = LANGUAGE_DEFAULT_IMAGE_IDS[command];
        const img = imgs?.[getRandomInteger(0, imgs.length - 1)];

        if (img) {
            await sendPhoto(chatId, img, msg);
        } else {
            await sendMessage(chatId, msg)
        }
        return true;
    }

    return false;
}

async function handleMessage(message) {
    const chatId = message.chat.id
    const photos = message?.photo;
    const messageText = message.text;
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

            const ocrResponse = await ocrSpace(fileUrl, {
                filetype: filePath.slice(-3),
                language: chatsLanguages[chatId] || DEFAULT_LANGUAGE
            });
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
        const isCommand = await handleCommands(chatId, messageText);
        if (!isCommand) {
            await noPhotoResponse(chatId)
        }
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
