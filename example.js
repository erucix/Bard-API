const Bard = require("./Bard")
const bard = new Bard()

bard.GenerateTokens("YOUR_TOKEN_HERE") //__Secure-1PSID

bard.on("generated", (token) => {
    bard.Prompt("write random student name and age in tabular form", token.psid, token.snlm0e)
    bard.on("response", (responseObject) => {
        console.log(responseObject) // Object
    })
})