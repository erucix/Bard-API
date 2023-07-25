# 💀 GoogleBard API v2.0
<p align="center">
	<img src="https://chromeunboxed.com/wp-content/uploads/2023/03/Google-Bard-Feature.png" width="376" height="100%" style="max-width: 100%;">
</p>

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
const bard = require("./bard")

bard({
    "PSID": "YOUR_TOKEN_HERE",
    "message": "who is chris evans"
}).then(data => console.log(data.message))
```

Response will be in `object` and will be of following model:
```javascript
{
    "status": "pass or fail"
    "message": "__CONTAINS_RESPONSE_OF_YOUR_PROMPT__",
    "c_id": "__SOME_RANDOM_ID___",
    "r_id": "__SOME_RANDOM_ID___",
    "rc_id": "__SOME_RANDOM_ID___",
    "questions": ["__ALTERNATIVE_QUESTIONS__"], //Array
    "images": ["__IMAGES__"], //Array
    "image_source": ["__IMAGES_SOURCE__"], // Array
    "message_source": ["__MESSAGE_SOURCE__"] // Array
}

```
These property are not always available. For example in case of ```"status":"fail"``` the `status` and `message` only will be available.

All available arguments are here:
```javascript
const bard = require("./bard")

bard({
    "PSID": "YOUR_TOKEN_HERE",
    "message": "images of nepal",
    "SNLM0e":"__MANUALLY_SUPPLIED_SNLM0e__", //optional
    "c_id": "__SOME_RANDOM_ID___", //optional
    "r_id": "__SOME_RANDOM_ID___", //optional
    "rc_id": "__SOME_RANDOM_ID___", //optional
    "captcha": "captcha value" // in case you are blocked by google captcha
	
}).then(data => console.log(data))
```
You can copy your captcha token from `https://bard.google.com` -> `Dev Console` -> `Application` -> `Cookies` -> `Value of GOOGLE_ABUSE_EXEMPTION`.

If you can't find the captcha token from cookies panel then theres something you can try:
- Try opening `bard.google.com` from tor or incognito window

If you encounter a captcha after doing any of these steps solve the captcha and copy the `GOOGLE_ABUSE_EXEMPTION` token.

**NOTE**: BARD API is still not officially released by google so this is a reverse engineered version. Proceed with caution.

**Thanks for the time 💝**
