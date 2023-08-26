const bard = require("./Bard");

bard.prompt({
    "message": "Who is chris evans",
    "cookie": "YOUR-COOKIE-HERE",
    "snlm0e": "YOUR-SNLME0-TOKEN-HERE"
}).then(data => console.log(data.message.answer))
