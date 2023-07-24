const bard = require("./bard")

bard({
    "PSID": "YOUR_TOKEN_HERE",
    "message": "images of nepal"
}).then(data => console.log(data))