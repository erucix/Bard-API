// Provided by @erucix (github)
// Bard v2.0
// Change-logs:
//  v2.0: 
//      - Made more effiecient
//      - No need to manually give ids. (self handled)
//      - Added database support 

const { writeFileSync, readFileSync, accessSync, constants } = require("fs");
const { join } = require("path");

const MESSAGES = {
    "emptyToken": "__Secure-1PSID is not supplied in parameter.",
    "findToken": "You can copy your token from https://bard.google.com -> Dev Console -> Application -> Cookies -> Value of __Secure-1PSID.",
    "findCaptcha": "You can copy your captcha token from https://bard.google.com -> Dev Console -> Application -> Cookies -> Value of GOOGLE_ABUSE_EXEMPTION.",
    "findSnl": "You can manually find SNLM0e token from https://bard.google.com -> View Page Source -> Search for 'SNLM0e'",
    "invalidToken": "Invalid __Secure-1PSID supplied.",
    "googleCaptchaMessage": "Our systems have detected unusual traffic from your computer network.This page checks to see if it's really you sending the requests, and not a robot."
}

const URI = {
    "baseURI": "https://bard.google.com/?hl=en",
    "bardURI": "https://bard.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20230718.13_p2&_reqid=1174904&rt=c"
}

let DEBUG = false

const userAccountsPath = join(__dirname, "accounts.bard")

function d(functionName, message = "ENTRY") {
    if (DEBUG) {
        console.log(functionName + "(): " + message)
    }
}

function createUserAccountsFile(content = "") {
    d("createUserAccountsFile")
    try {
        d("createUserAccountsFile", "Creating file. Given Content: " + content)
        writeFileSync(userAccountsPath, content ? content : content)
    } catch (err) {
        throw err
    }
}

function readUserAccounts() {
    d("readUserAccounts")
    if (!fileExists(userAccountsPath)) {
        d("readUserAccounts", "File doesn't exist calling file creator function")
        createUserAccountsFile()
    }
    let content = readFileSync(userAccountsPath, { encoding: "utf8" })
    d("readUserAccounts", "Returned data: " + content)
    return JSON.parse(`{${content}}`)
}

function fileExists(filePath) {
    d("fileExists")
    try {
        d("fileExists", "Checking if " + filePath + " exists")
        accessSync(filePath, constants.F_OK)
        d("fileExists", filePath + " exist")
        return true
    } catch {
        d("fileExists", filePath + " doesnt exist")
        return false
    }
}

function addAccount(accountDetails) {
    d("addAccount")
    let accounts = readUserAccounts()
    accounts[accountDetails.PSID] = {
        "SNLM0e": accountDetails.SNLM0e,
        "c_id": accountDetails.c_id,
        "r_id": accountDetails.r_id,
        "rc_id": accountDetails.rc_id,
        "captcha": accountDetails.captcha
    }

    accounts = JSON.stringify(accounts).slice(1, -1)

    d("addAccount", "Caling file creater to write " + accounts)

    createUserAccountsFile(accounts)
}

function accountExists(PSID) {
    d("accountExists")
    !fileExists(userAccountsPath) && createUserAccountsFile()

    const result = readUserAccounts().hasOwnProperty(PSID)

    d("accountExists", `Account ${PSID} existence: ` + result)

    return result
}

function checkToken(token, type = "PSID") {
    d("checkToken")
    d("checkToken", `Token Value: ${token}, Type: ${type}`)
    if (type == "PSID") {
        if (!token) {

            d("checkToken", "Empty token. Token failed.")
            return {
                "status": "fail",
                "message": `${MESSAGES.emptyToken}${MESSAGES.findToken}And use it like Eg: GenerateTokens('MY __Secure-1PSID TOKEN HERE')`
            }
        }
        if (!token.endsWith(".")) {

            d("checkToken", "Invalid Token. Token failed.")
            return {
                "status": "fail",
                "message": `${MESSAGES.invalidToken}${MESSAGES.findToken}`
            }
        }
    }
    d("checkToken", "Token passed")
    return {
        "status": "pass"
    }
}

function gatherTokens(dataObj) {

    return new Promise(function (resolve) {
        d("gatherTokens")
        d("gatherTokens", "Recieved Object Parameter: " + dataObj)
        if (dataObj && !!dataObj.message) {
            DEBUG = dataObj.DEBUG
            if (checkToken(dataObj.PSID).status == "pass") {

                const c_id = dataObj.c_id ? dataObj.c_id : (accountExists(dataObj.PSID) && readUserAccounts()[dataObj.PSID].c_id) ? readUserAccounts()[dataObj.PSID].c_id : ""

                const r_id = dataObj.r_id ? dataObj.r_id : (accountExists(dataObj.PSID) && readUserAccounts()[dataObj.PSID].r_id) ? readUserAccounts()[dataObj.PSID].r_id : ""

                const rc_id = dataObj.rc_id ? dataObj.rc_id : (accountExists(dataObj.PSID) && readUserAccounts()[dataObj.PSID].rc_id) ? readUserAccounts()[dataObj.PSID].rc_id : ""

                const captcha = dataObj.captcha ? dataObj.captcha : (accountExists(dataObj.PSID) && readUserAccounts()[dataObj.PSID].captcha) ? readUserAccounts()[dataObj.PSID].captcha : ""


                if (dataObj.SNLM0e) {
                    SNLM0e = dataObj.SNLM0e
                    addAccount({
                        "PSID": dataObj.PSID,
                        "SNLM0e": dataObj.SNLM0e,
                        "c_id": c_id,
                        "r_id": r_id,
                        "rc_id": rc_id,
                        "captcha": captcha
                    })
                    resolve({
                        "status": "pass",
                        "message": dataObj.message,
                        "PSID": dataObj.PSID,
                        "SNLM0e": dataObj.SNLM0e,
                        "c_id": c_id,
                        "r_id": r_id,
                        "rc_id": rc_id,
                        "captcha": captcha
                    })
                } else if (accountExists(dataObj.PSID) && readUserAccounts()[dataObj.PSID].SNLM0e) {
                    resolve({
                        "status": "pass",
                        "message": dataObj.message,
                        "PSID": dataObj.PSID,
                        "SNLM0e": readUserAccounts()[dataObj.PSID].SNLM0e,
                        "c_id": c_id,
                        "r_id": r_id,
                        "rc_id": rc_id,
                        "captcha": captcha
                    })
                } else {
                    resolve(fetch(URI.baseURI, {
                        "headers": {
                            "cookie": `__Secure-1PSID=${dataObj.PSID}; ` + (dataObj.CAPTCHA ? "GOOGLE_ABUSE_EXEMPTION=" + dataObj.CAPTCHA : "")
                        }
                    })
                        .then(data => data.text())
                        .then(data => {
                            if (data.includes(MESSAGES.googleCaptchaMessage)) {
                                if (dataObj.CAPTCHA == "")
                                    return {
                                        "status": "fail",
                                        "message": `You are blocked by captcha.${MESSAGES.findCaptcha} Please see the documentation for this issue.`
                                    }
                                return {
                                    "status": "fail",
                                    "message": `Your captcha token is outdated or invalid, regenerate a new one.${MESSAGES.findCaptcha}`
                                }
                            }
                            return data.match(/"SNlM0e":"(.*?)"/);
                        })
                        .then(data => {
                            if (!data)
                                return {
                                    "status": "fail",
                                    "message": `Looks like we can't find the SNLM0e token.${MESSAGES.findSnl}`
                                }
                            addAccount({
                                "PSID": dataObj.PSID,
                                "SNLM0e": data[1],
                                "c_id": c_id,
                                "r_id": r_id,
                                "rc_id": rc_id,
                                "captcha": captcha
                            })
                            return {
                                "status": "pass",
                                "message": dataObj.message,
                                "PSID": dataObj.PSID,
                                "SNLM0e": data[1],
                                "c_id": c_id,
                                "r_id": r_id,
                                "rc_id": rc_id,
                                "captcha": captcha
                            }
                        }))
                }

            }
            resolve(checkToken(dataObj.PSID))
        }
        resolve({
            "status": "fail",
            "message": "Empty message is not allowed"
        })
    })

}

function gatherResponse(dataObj) {
    return new Promise(function (resolve) {
        d("gatherResponse")
        d("gatherResponse", "Recieved Object Parameter: " + JSON.stringify(dataObj))
        let body = "f.req=" + encodeURIComponent(`[null, ${JSON.stringify(JSON.stringify([[dataObj.message], ["en"], [dataObj.c_id, dataObj.r_id, dataObj.rc_id]]))}]`) + "&at=" + encodeURIComponent(dataObj.SNLM0e)

        d("gatherResponse", "Body for fetch: " + body)

        fetch(URI.bardURI, {
            "headers": {
                "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
                "cookie": `__Secure-1PSID=${dataObj.PSID};`
            },
            "body": body,
            "method": "POST"
        })
            .then(data => data.text())
            .then(data => data.slice(data.indexOf('[["'), data.lastIndexOf('"]]') + 3))
            .then(data => {
                d("gatherResponse", "Bard response: " + data)
                try {
                    data = JSON.parse(JSON.parse(data)[0][2])
                    return data
                } catch {
                    return {
                        "status": "fail",
                        "message": "Failed to parse response JSON from bard.google.com."
                    }
                }
            })
            .then(data => {

                data = {
                    "status": "pass",
                    "message": data[4][0][1][0],
                    "c_id": data[1][0],
                    "r_id": data[1][1],
                    "rc_id": data[4][0][0],
                    "questions": data[2] ? data[2].map((elem) => { if (elem) return elem[0] }) : [],
                    "images": data[4][0][4] ? data[4][0][4].map(elem => elem[1][3]) : [],
                    "image_source": data[4][0][4] ? data[4][0][4].map(elem => elem[1][0][0]) : [],
                    "message_source": data[4][0][2] != [] && data[4][0][2] != null && data[4][0][2][0] ? data[4][0][2][0].map(elem => elem[2][0]) : []
                }
                resolve(data);
            })
    })
}

async function prompt(dataObj) {
    const data = await gatherTokens(dataObj);
    if (data.status == "pass") {
        return gatherResponse(data)
            .then(dataObjs => {
                addAccount({
                    "PSID": dataObj.PSID,
                    "SNLM0e": dataObj.SNLM0e,
                    "c_id": dataObjs.c_id,
                    "r_id": dataObjs.r_id,
                    "rc_id": dataObjs.rc_id
                });
                return dataObjs;
            });
    }
    return data;
}

module.exports = prompt