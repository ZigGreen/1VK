# 1vk
**Smart and efficient sdk for vk.com API**
## Behind the scene:
1. It uses [execute](https://vk.com/dev/execute) api method to perform more api calls per permitted time interval.
2. It handles "Too many requests per second" error thus you no more need to concern about it.


## Install
`` npm i 1vk --save ``

## How to use
### With browser (vk.com open api sdk)

```javascript
var ApiQueue = require("1vk");
// initialization and authorisation (VK.init , VK.Auth.login)
// then
var apiQueue = new ApiQueue(3, 1e3, VK.Api.call)
var usersFriends = [];
// gets friends for 1000 users
for (var i=0; i<1e3; i=i+1)
    apiQueue.request('friends.get', {user_id: i}).then(function(friends) {
        usersFriends.push(friends)
    })
console.dir(usersFriends);
```

### With node
You can use any open api like library (`function (methodName, params, callback)`)

### Docs
Please read source code. The code is pretty simple and jsdoc annotated.

