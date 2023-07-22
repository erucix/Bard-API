const EventEmitter = require("events")

const MESSAGES = {
    "emptyToken": "[!] __Secure-1PSID is not supplied in parameter.",
    "findToken": "[+] You can copy your token from https://bard.google.com -> Dev Console -> Application -> Cookies -> Value of __Secure-1PSID.",
    "findCaptcha": "[+] You can copy your captcha token from https://bard.google.com -> Dev Console -> Application -> Cookies -> Value of GOOGLE_ABUSE_EXEMPTION.",
    "findSnl": "[+] You can manually find SNlM0e token from https://bard.google.com -> View Page Source -> Search for 'SNlM0e'",
    "invalidToken": "[!] Invalid __Secure-1PSID supplied."
}

const URI = {
    "baseURI": "https://bard.google.com/?hl=en",
    "bardURI": "https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20230718.13_p2&_reqid=1174904&rt=c"
}

class Bard extends EventEmitter {

    async GenerateTokens(PSID, CAPTCHA) {
        if (!PSID)
            throw `${MESSAGES.emptyToken}\n${MESSAGES.findToken}\n[*] And use it like Eg: GenerateTokens('MY __Secure-1PSID TOKEN HERE')`;
        if (!PSID.endsWith("."))
            throw `${MESSAGES.invalidToken}\n${MESSAGES.findToken}`;

        let headers = {
            "cookie": `__Secure-1PSID=${PSID}; ` + (CAPTCHA ? "GOOGLE_ABUSE_EXEMPTION=" + CAPTCHA : "")
        }

        return fetch(URI.baseURI, {
            "headers": headers
        })
            .then(data => data.text())
            .then(data => {
                if (data.includes("enable javascript")) {
                    if (CAPTCHA == "")
                        throw `[!] You are blocked by captcha.\n${MESSAGES.findCaptcha}\n[*] You can fix it like GenerateTokens('MY __Secure-1PSID TOKEN HERE', 'MY CAPTCHA TOKEN HERE')`
                    throw `[!] Your captcha token is outdated or invalid, regenerate a new one.\n${MESSAGES.findCaptcha}`
                }
                return data.match(/"SNlM0e":"(.*?)"/);
            })
            .then(data => {
                if (!data)
                    throw `[!] Looks like we can't find the SNlM0e token.\n${MESSAGES.findSnl}`
                this.emit("generated", {
                    "psid": PSID,
                    "snlm0e": data[1]
                })
                return;
            })

    }

    async Prompt(message, PSID, SNlM0e, c_id = "", r_id = "", rc_id = "") {
        if (!message)
            throw `[+] Empty message provided`
        if (!PSID)
            throw `${MESSAGES.emptyToken}\n${MESSAGES.findToken}\n[*] And use it like Eg: Prompt('MY MESSAGE', 'MY __Secure-1PSID TOKEN HERE', 'MY SNLM0e TOKEN HERE')`;
        if (!PSID.endsWith("."))
            throw `${MESSAGES.invalidToken}\n[+] ${MESSAGES.findToken}`;
        if (!SNlM0e)
            throw `[!] SNLM0e is not supplied\n${MESSAGES.findSnl}\n[*] And use it like Eg: Prompt('MY MESSAGE', 'MY __Secure-1PSID TOKEN HERE', 'MY SNLM0e TOKEN HERE')`


        let body = encodeURIComponent(`[null, ${JSON.stringify(JSON.stringify([[message], ["en"], [c_id, r_id, rc_id]]))}]`)
        body = "f.req=" + body + "&at=" + encodeURIComponent(SNlM0e);

        fetch(URI.bardURI, {
            "headers": {
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                "cookie": `__Secure-1PSID=${PSID};`
            },
            //"body": "f.req=" + encodeURIComponent(body) + "&at=" + encodeURIComponent(SNlM0e),

            "body": body,//`f.req=%5Bnull%2C%22%5B%5B%5C%22hello%5C%22%5D%2C%5B%5C%22en%5C%22%5D%2C%5B%5C%22c_b82f418ca63f6302%5C%22%2C%5C%22r_834bd8dd965cb930%5C%22%2C%5C%22rc_834bd8dd965cb6fb%5C%22%5D%5D%22%5D${encodeURIComponent(message)}%5C%22%2C0%2Cnull%2C%5B%5D%5D%2C%5B%5C%22en%5C%22%5D%2C%5B%5C%22${c_id}%5C%22%2C%5C%22${r_id}%5C%22%2C%5C%22rc_834bd8dd965cb6fb%5C%22%5D%5D%22%5D&at=${encodeURIComponent(SNlM0e)}&`,
            "method": "POST"
        })
            .then(data => data.text())
            .then(data => data.slice(data.indexOf('[["'), data.lastIndexOf('"]]') + 3))
            .then(data => JSON.parse(JSON.parse(data)[0][2]))
            .then(data => {

                data = {
                    "response": data[4][0][1][0],
                    "c_id": data[1][0],
                    "r_id": data[1][1],
                    "rc_id": data[4][0][0],
                    "questions": data[2] ? data[2].map((elem) => { if (elem) return elem[0] }) : null,
                    "images": data[4][0][4] ? data[4][0][4].map(elem => elem[1][3]) : [],
                    "image_source": data[4][0][4] ? data[4][0][4].map(elem => elem[1][0][0]) : [],
                    "message_source": data[4][0][2].length ? data[4][0][2][0].map(elem => elem[2][0]) : []
                }
                this.emit("response", data)
                return;
            })
    }
}

module.exports = Bard
