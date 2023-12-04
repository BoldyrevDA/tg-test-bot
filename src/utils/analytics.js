import {AMPLITUDE_TOKEN} from "../constants/configs.js";
import axios from "axios";

// API params: https://www.docs.developers.amplitude.com/analytics/apis/http-v2-api
function sendAnalytics({
    user_id,
    event_type,
    event_properties,
    user_properties,
    ...restProps
}) {
    if (!AMPLITUDE_TOKEN) {
        return;
    }

    axios.post('https://api2.amplitude.com/2/httpapi', {
            "api_key": AMPLITUDE_TOKEN,
            "events": [{
                user_id,
                event_type,
                event_properties,
                user_properties,
                ...restProps
            }]
    })
        .catch(error => console.error(error));
}

export function _analyzeSendMessage({
    id,
    username,
    first_name,
    language_code,
} = {}) {
    sendAnalytics({
        user_id: username || id,
        event_type: "Send message",
        language: language_code,
        user_properties: {
            username,
            first_name,
            id,
        },
    });
}

export function _analyzeChangeLanguage(
    userId,
    language
) {
    sendAnalytics({
        user_id: userId,
        event_type: "Change language",
        event_properties: {
            language,
        },
    });
}