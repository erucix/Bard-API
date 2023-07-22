# 💀 GoogleBard API
Small, lightweight and reliable unofficial Google Bard API built on Node-JS only. No external library implemented and or required to download. Only for educational and testing purpose. And I hold no responsibility of its misuse.
# 🫀 How to run?
Open your terminal and paste this command.
```bash
git clone https://github.com/erucix/bard-api.git
cd bard-api
node example.js
```

Now to implement your own Bot logic you can have a look at ```example.js``` or see this. 

Make sure you have  `__Secure-1PSID` token with you. You can copy your token from `https://bard.google.com` -> `Dev Console` -> `Application` -> `Cookies` -> `Value of __Secure-1PSID`

```javascript
const Bard = require("./Bard")
const bard = new Bard()

bard.GenerateTokens("YOUR_TOKEN_HERE") //__Secure-1PSID

bard.on("generated", (token) => {
	bard.Prompt("YOUR_MESSAGE_HERE", token.psid, token.snlm0e)
	bard.on("response", (responseObject) => {
		console.log(responseObject) // Object
	})
})
```

Response will be in `object` and will be of following model:
```javascript
{
	"response": "__CONTAINS_RESPONSE_OF_YOUR_PROMPT__",
	"c_id": "__SOME_RANDOM_ID___",
	"r_id": "__SOME_RANDOM_ID___",
	"rc_id": "__SOME_RANDOM_ID___",
	"questions": ["__ALTERNATIVE_QUESTIONS__"], //Array
    "images": ["__IMAGES__"], //Array
    "image_source": ["__IMAGES_SOURCE__"], // Array
    "message_source": ["__MESSAGE_SOURCE__"] // Array
}

```

To make the chat memorable to bot use the additional ids provided in response to the prompt i:e `c_id`, `r_id` & `rc_id`. For example:
```javascript
const Bard = require("./Bard")
const bard = new Bard()

bard.GenerateTokens("YOUR_TOKEN_HERE") //__Secure-1PSID

bard.on("generated", (token) => {
	let c_id="", r_id="", rc_id;
	bard.Prompt("YOUR_MESSAGE_HERE", token.psid, token.snlm0e, c_id, r_id)
	bard.on("response", (responseObject) => {
		c_id = msg.c_id
		r_id = msg.r_id       // Updating these three ids again and again
		rc_id = msg.rc_id
		console.log(responseObject)
	})
})
```
🎗️ **Note**: The ids must be in order as in their place. 

**Thanks for the time 💝**