const socket = io();
let currentUser = null;

// 添加顯示消息的函數
function displayMessage(data) {
    const messagesDiv = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';

    let contentHtml = '';
    if (data.fileInfo) {
        if (isImageFile(data.fileInfo.originalname)) {
            contentHtml = `
                <div class="image-message">
                    <img src="${data.fileInfo.path}" alt="${data.fileInfo.originalname}" 
                         onclick="window.open(this.src)" style="max-width: 300px; cursor: pointer;">
                    <div class="file-info">
                        <span>${data.fileInfo.originalname}</span>
                    </div>
                </div>
            `;
        } else {
            contentHtml = `
                <div class="file-message">
                    <div class="file-info">
                        <i class="fas fa-file file-icon"></i>
                        <span>${data.fileInfo.originalname}</span>
                        <a href="${data.fileInfo.path}" class="btn btn-sm btn-primary download-btn" 
                           download="${data.fileInfo.originalname}">
                            <i class="fas fa-download"></i> 下載
                        </a>
                    </div>
                </div>
            `;
        }
    }

    messageElement.innerHTML = `
        <img src="${data.user.avatar}" class="message-avatar" alt="${data.user.username}">
        <div class="message-content">
            <div class="message-header">
                <span class="message-username">${data.user.username}</span>
                <span class="message-time">${data.time || new Date(data.timestamp).toLocaleTimeString()}</span>
            </div>
            <div class="message-text">${data.message}</div>
            ${contentHtml}
        </div>
    `;
    
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// 處理歷史消息
socket.on('loadChatHistory', (messages) => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = ''; // 清空現有消息
    
    messages.forEach(msg => {
        displayMessage({
            user: msg.sender,
            message: msg.content,
            timestamp: msg.timestamp
        });
    });
});

// 處理新消息
socket.on('message', (data) => {
    displayMessage(data);
});

// 加入天室
function showChatRoom() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('chatRoom').style.display = 'block';
    
    socket.emit('userJoined', {
        username: currentUser.username,
        avatar: currentUser.avatar
    });
    
    socket.emit('joinRoom', 'general');
}

// 發送消息
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const message = messageInput.value.trim();
    
    if (message && currentUser) {
        socket.emit('chatMessage', {
            room: 'general',
            message: message,
            user: {
                username: currentUser.username,
                avatar: currentUser.avatar || '/images/default-avatar.png'
            }
        });
        messageInput.value = '';
        messageInput.focus();
    }
}

// 切換登入/註冊表單
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

// 處理登入
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            showChatRoom();
        } else {
            alert('登入失敗，請檢查用戶名和密碼');
        }
    } catch (error) {
        console.error('登入錯誤:', error);
        alert('登入時發生錯誤');
    }
}

// 處理註冊
async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const avatarFile = document.getElementById('avatar').files[0];

    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            alert('註冊成功！請登入');
            toggleForms();
        } else {
            alert('註冊失敗，請稍後重試');
        }
    } catch (error) {
        console.error('註冊錯誤:', error);
        alert('註冊時發生錯誤');
    }
}

// 處理文件上傳
document.getElementById('file-upload').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        alert('文件大小不能超過 10MB');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const fileInfo = await response.json();
            sendFileMessage(fileInfo);
        } else {
            throw new Error('上傳失敗');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        alert('文件上傳失敗');
    }
    
    this.value = ''; // 清空文件輸入框
});

// 發送文件消息
function sendFileMessage(fileInfo) {
    if (currentUser) {
        socket.emit('chatMessage', {
            room: 'general',
            message: `分享了一個文件: ${fileInfo.originalname}`,
            user: {
                username: currentUser.username,
                avatar: currentUser.avatar
            },
            fileInfo: fileInfo
        });
    }
}

// 更新在線用戶列表
socket.on('updateUsersList', (users) => {
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = users.map(user => `
        <div class="user-item">
            <img src="${user.avatar}" alt="${user.username}">
            <span>${user.username}</span>
        </div>
    `).join('');
});

// 檢查是否為圖片文件
function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    const ext = filename.toLowerCase().slice(filename.lastIndexOf('.')).toLowerCase();
    return imageExtensions.includes(ext);
}

// 添加回車發送功能
document.getElementById('message-input').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // 阻止默認換行
        sendMessage();
    }
});
  