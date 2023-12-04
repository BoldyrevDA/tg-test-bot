const {
    TOKEN,
    WEBHOOK_HOST: HOST,
    DEFAULT_IMAGE_ID: IMG,
    AMPLITUDE_TOKEN: AMPLITUDE,
} = process.env;

export const WEBHOOK_HOST = HOST;
export const DEFAULT_IMAGE_ID = IMG;
export const AMPLITUDE_TOKEN = AMPLITUDE;

export const DEFAULT_LANGUAGE = 'eng';
export const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
export const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${TOKEN}`;
export const URI = `/webhook/${TOKEN}`; // TODO use X-Telegram-Bot-Api-Secret-Token