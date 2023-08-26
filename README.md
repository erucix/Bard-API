# 💀 GoogleBard API v3.0
<p align="center">
	<img src="https://chromeunboxed.com/wp-content/uploads/2023/03/Google-Bard-Feature.png" width="376" height="100%" style="max-width: 100%;">
</p>

Small, lightweight and reliable unofficial Google Bard API built on Node-JS only. No external library implemented and or required to download. Only for educational and testing purpose. And I hold no responsibility of its misuse.

# 🫀 How to run?
Open your terminal and paste this command.
```bash
git clone https://github.com/erucix/bard-api.git
cd Bard-API
node example.js #make sure you have put your tokens in example.js
```

Now to implement your own Bot logic you can have a look at ```example.js``` or see this. 

Make sure you have  `cookie` token with you. You need the full cookie list.

To get your full `cookie` list follow this step:
- Open https://bard.google.com
- Open `Network` tab from `Developer Tools` or press `Ctrl+Shift+I` and go to `Network`
- Now refresh `https://bard.google.com`.
- Under `Name` section click on `bard.gooogle.com` or `/u/1` (You might need to scroll to top first)
- Now under `Request Headers` copy all content from `Cookie`

To get your `snlm0e` token follow this step:
- Open https://bard.google.com
- Open `Console` from `Developer Tools` or press `Ctrl+Shift+I`
- Paste this code in your console<br>
```javascript
prompt("Copy me: ", WIZ_global_data.SNlM0e)
```
Now this is the file where you implement the `cookie` and `snlm0e` tokens
```javascript

const bard = require("./Bard");

bard.prompt({
    "message": "Who is chris evans",
    "cookie": "YOUR-COOKIE-HERE",
    "snlm0e": "YOUR-SNLME0-TOKEN-HERE"
}).then(data => console.log(data.message.answer))
```

Response will be in `object` and will be of following model:
```javascript
{
    "status": "pass or fail"
    "message": "__CONTAINS_RESPONSE_OF_YOUR_PROMPT__",
    "c_id": "__SOME_RANDOM_ID___", //optional
    "r_id": "__SOME_RANDOM_ID___", //optional
    "rc_id": "__SOME_RANDOM_ID___", //optional
}

```
You can also get `Conversation history `and` Conversation List` using the built in api and this is left to be solved by the users themselves.

**NOTE**: BARD API is still not officially released by google so this is a reverse engineered version. Proceed with caution.

**Thanks for the time 💝**
