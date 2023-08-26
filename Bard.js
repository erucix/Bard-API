// Provided by @erucix (github)
// Bard v3.0
// Change-logs:
//  v3.0: 
//      - Modified for efficiency
//      - Improved to work with latest Bard Version
//      - Added support for recent chat history.
//      - Added support for recent conversation history.


const https = require("https");
const fs = require("fs");

const constants = {
    "filename": {
        "dataFileName": "accounts.json"
    },
    "errors": {
        "failedToCreateFile": "Failed to create file to save content."
    },
    "uri": {
        "bardHomePage": "https://bard.google.com",
        "chatTitleHistory": "https://bard.google.com/u/1/_/BardChatUi/data/batchexecute",
        "chatHistory": "https://bard.google.com/u/1/_/BardChatUi/data/batchexecute?rpcids=hNvQHb",
        "chatUri": "https://bard.google.com/u/1/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl="
    }
}

var cookie = "";

function handleErrorReturn(content) {
    let formattedTextObject = {
        "status": "fail",
        "message": content
    };

    return formattedTextObject;
}

function handleSuccessReturn(content) {
    let formattedTextObject = {
        "status": "success",
        "message": content
    };

    return formattedTextObject;
}

function getSavedPreference() {
    try {

        let savedFileContent =
            fs.readFileSync(constants.filename.dataFileName, "utf-8");

        savedFileContent = JSON.parse(savedFileContent); // We are storing the content in JSON format

        return handleSuccessReturn(savedFileContent);

    } catch {

        try {
            fs.writeFileSync(constants.filename.dataFileName, "{}");

            return getSavedPreference();
        } catch {

            return handleErrorReturn(constants.errors.failedToCreateFile + ": " + constants.filename.dataFileName); // Giving-Up since we can't even write on file.

        }

    }
}

function addToSavedPreference(propertyName, propertyValue) {
    let savedPreference = getSavedPreference();

    if (savedPreference.status == "success") {
        let newModifiedData = savedPreference.message;
        newModifiedData[propertyName] = propertyValue;

        try {
            fs.writeFileSync(constants.filename.dataFileName, JSON.stringify(newModifiedData))
            return handleSuccessReturn(null);
        } catch {
            return handleErrorReturn(constants.errors.failedToCreateFile + ": " + constants.filename.dataFileName);
        }
    } else {
        return savedPreference;
    }
}

function searchInText(textContent, regex) {
    let match = textContent.match(regex);

    if (match && match.length > 0) {
        return handleSuccessReturn(match[1]);
    } else {
        return handleErrorReturn("Can't find " + regex + " in the provided text content.")
    }
}

async function getBardApiTokens() {
    let dataFromFile = getSavedPreference();

    if (dataFromFile.status == "success") {
        dataFromFile = dataFromFile.message;
        if (dataFromFile.snlm0e)
            return handleSuccessReturn(dataFromFile);
    }

    return new Promise(function (resolve) {
        APICall({
            "uri": constants.uri.bardHomePage,
            "cookie": cookie,
            "accept": "*/*",
            "method": "GET",
        }).then(data => {
            if (data.status == "success") {
                data = data.message;

                let SNlM0e = searchInText(data, /"SNlM0e":"([^"]*)"/);
                let cfb2h = searchInText(data, /"cfb2h":"([^"]*)"/);

                if (SNlM0e.status == "fail") {
                    resolve(SNlM0e);
                }
                if (cfb2h.status == "fail") {
                    resolve(cfb2h);
                }

                SNlM0e.message = "THIS_IS_UNDER_DEVELOPMENT";

                addToSavedPreference("snlm0e", SNlM0e.message);
                addToSavedPreference("cfb2h", cfb2h.message);

                resolve(handleSuccessReturn({
                    "snlm0e": SNlM0e.message,
                    "cfb2h": cfb2h.message
                }));
            } else {
                resolve(data);
            }
        })
    });
}

async function APICall(options) {
    return new Promise(function (resolve) {
        if (options.method == "POST") {

            const optionss = {
                "headers": {
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded;",
                    "cookie": cookie
                },
                "method": "POST",
            }

            const request = https.request(options.uri, optionss, (response) => {
                let responseText = "";

                if (response.statusCode != 200)
                    resolve(handleErrorReturn("Server returned status code " + response.statusCode));

                response.on("data", (chunk) => {
                    responseText += chunk;
                });

                response.on("end", () => {
                    resolve(handleSuccessReturn(responseText));
                });
            });

            request.write(options.body);

            request.end();
        } else if (options.method == "GET") {

            const optionsForRequest = {
                "headers": {
                    "accept": options.accept,
                    "accept-language": "en-US,en;q=0.9",
                    "cookie": cookie
                },
                "method": "GET",
                "body": null,
                "referrerPolicy": "origin",
            }

            https.get(options.uri, optionsForRequest, (responseFromServer) => {
                let responseContent = "";

                if (responseFromServer.statusCode != 200)
                    resolve(handleErrorReturn("Server responded with status " + responseFromServer.statusCode));

                responseFromServer.on("data", (chunk) => {
                    responseContent += chunk;
                });

                responseFromServer.on("end", () => {
                    resolve(handleSuccessReturn(responseContent));
                });

            })
        } else {
            resolve(handleErrorReturn(options.method.toUpperCase()) + ": Method not allowed");
        }
    });
}

async function getBardChatTitleHistory(token) {

    let req = [[["MaZiqc", "[13,null,[0]]", null, "generic"]]];
    req = encodeURIComponent(JSON.stringify(req));

    const at = encodeURIComponent(token.snlm0e);

    const postBody = `f.req=${req}&at=${at}&`;

    return new Promise((resolve) => {
        APICall({
            "uri": constants.uri.chatTitleHistory,
            "accept": "*/*",
            "body": postBody,
            "content-type": "application/x-www-form-urlencoded;",
            "method": "POST",
            "snlm0e": token.snlm0e
        }).then(data => {

            if (data.status == "fail") resolve(data);

            data = data.message;

            let arrayWithChatTitle = [];

            let jsonBody = data.slice(data.indexOf("[["));
            jsonBody = JSON.parse(jsonBody)[0][2];
            jsonBody = JSON.parse(jsonBody);
            jsonBody = jsonBody[0];

            jsonBody.forEach(e => {
                arrayWithChatTitle.push({
                    "id": e[0],
                    "title": e[1]
                });
            })

            resolve(handleSuccessReturn(arrayWithChatTitle));
        })
    })

}

async function getChatHistory(c_id, token) {
    const req = encodeURIComponent(JSON.stringify([[["hNvQHb", JSON.stringify([c_id, 10]), null, "generic"]]]));
    const at = encodeURIComponent(token.snlm0e);

    const postBody = `f.req=${req}&at=${at}`

    return new Promise((resolve) => {
        APICall({
            "uri": constants.uri.chatHistory,
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "cookie": cookie,
            "method": "POST",
            "body": postBody
        }).then(responseChats => {
            if (responseChats.status == "fail")
                resolve(responseChats);

            responseChats = responseChats.message;

            responseChats = responseChats.slice(responseChats.indexOf("wrb.fr") - 3);
            responseChats = JSON.parse(responseChats)[0][2];
            responseChats = JSON.parse(responseChats)[0];

            let newArrayWithChatHistory = [];

            responseChats.forEach(element => {
                newArrayWithChatHistory.push({
                    "you": element[2][0][0],
                    "bard": element[3][0][0][1][0]
                });
            });

            newArrayWithChatHistory.reverse();  // Since the order of chat is last message to first message

            resolve(handleSuccessReturn(newArrayWithChatHistory));
        });
    });
}

async function prompt(data) {
    let dataFromFile = getSavedPreference().message;

    let c_id = data.c_id || dataFromFile.c_id || "";
    let r_id = data.r_id || dataFromFile.r_id || "";
    let rc_id = data.rc_id || dataFromFile.rc_id || "";

    let req = [null, JSON.stringify([[data.message], ["en"], [c_id, r_id, rc_id]])]
    req = encodeURIComponent(JSON.stringify(req));

    let at = encodeURIComponent(data.snlm0e);

    const postBody = `f.req=${req}&at=${at}`

    return new Promise(function (resolve) {

        APICall({
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
            "body": postBody,
            "method": "POST",
            "cookie": cookie,
            "uri": data.uri
        }).then(data => {
            if (data.status == "fail")
                resolve(data);

            let responseMessage = data.message;

            let message = JSON.parse(responseMessage.slice(responseMessage.indexOf("wrb.fr") - 3))[0][2];
            message = JSON.parse(message);

            let alternativeQuestions = [];
            message[2].forEach(elem => {
                alternativeQuestions.push(elem[0]);
            });

            let ids = [message[1][0], message[1][1], message[4][0][0]];

            let answer = message[4][0][1][0];

            let images = [];

            !!(message[4][0][4]) && message[4][0][4].forEach((elem) => {
                images.push({
                    "name": elem[2].replace("[", "").replace("]", ""),
                    "source": elem[1][1],
                    "url": elem[1][0][0],
                    "gstatic_url": elem[1][3]
                });
            })

            addToSavedPreference("c_id", ids[0]);
            addToSavedPreference("r_id", ids[1]);
            addToSavedPreference("rc_id", ids[2]);

            resolve(handleSuccessReturn({
                "id": ids,
                "answer": answer,
                "images": images,
                "altQuestions": alternativeQuestions
            }));

        })
    });
}


exports.prompt = async function (tokenObject) {
    cookie = tokenObject.cookie;

    return new Promise((resolve) => {
        getBardApiTokens()
            .then(data => {
                prompt({
                    "uri": constants.uri.chatUri + data.message.cfb2h,
                    "snlm0e": data.message.snlm0e,
                    "message": tokenObject.message,
                }).then(data => resolve(data))
            });
    })
}
