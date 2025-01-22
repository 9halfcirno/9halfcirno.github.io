const sendButton = document.getElementById('chatsend');
const inputMsg = document.getElementById('chatinput');
const chatbox = document.getElementById('chatbox');
let userMsg = null;
let chatID = null;
let reply = null;

sendButton.addEventListener('click', () => {
    // 获取chatID的函数
    async function getChatID(times = 0) {
        if (chatID) {
            await fetch('https://api.ecylt.top/v1/free_gpt/chat_json.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "action": "delete",
                        "conversation_id": chatID
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('delete conversation_id failed');
                    }
                })
                .catch(error => console.error(error));
        }

        await fetch('https://api.ecylt.top/v1/free_gpt/chat_json.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "action": "new"
                })
            })
            .then(response => {
                if (!response) {
                    console.warn("cannot get ID r:" + response);
                    if (times > 5) {
                        console.error('error to get ID');
                    } else {
                        setTimeout(() => getChatID(times + 1), 500);
                    }
                } else {
                    // 正确解析JSON数据
                    return response.json();
                }
            })
            .then(data => {
                if (data) {
                    chatID = data.conversation_id;
                }
            })
            .catch((e) => console.error("fail to get id:" + e));
    }

    // 发送消息的函数
    async function sendMsg(msg, id) {
        if (chatID) {
            await fetch('https://api.ecylt.top/v1/free_gpt/chat_json.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        "action": "continue",
                        "message": msg.toString(),
                        "conversation_id": id
                    })
                })
                .then(response => {
                    if (response) {
                        return response.json();
                    } else {
                        console.warn("cannot get reply r:" + response);
                        // 这里原代码逻辑有些混乱，下面的times没有定义，暂时按照合理逻辑修改为直接报错
                        console.error('error to get reply');
                    }
                })
                .then(data => {
                    if (data) {
                        reply = data;
                    }
                })
                .catch((e) => console.error("fail to get reply:" + e));
        } else {
            await getChatID().then(() => sendMsg(msg, chatID));
        }
    };

    userMsg = inputMsg.value;
    chatbox.innerHTML = '<span>'+sendMsg(userMsg, chatID)+'</span>'
});