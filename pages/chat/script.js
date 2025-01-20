function sendMessage(event) {
    event.preventDefault();
    var input = document.getElementById('message-input');
    var message = input.value;
    // 这里可以添加将消息发送给AI并获取回复的逻辑
    var chatContainer = document.getElementById('chat-container');
    var userMessageDiv = document.createElement('div');
    userMessageDiv.classList.add('user-message');
    userMessageDiv.innerText = message;
    chatContainer.appendChild(userMessageDiv);
    input.value = '';
    // 模拟AI回复
    var aiMessage = "这是AI的回复";
    // 在实际应用中，这里需要根据与AI的交互获取真实回复
    var aiMessageDiv = document.createElement('div');
    aiMessageDiv.classList.add('ai-message');
    aiMessageDiv.innerText = aiMessage;
    chatContainer.appendChild(aiMessageDiv);
}