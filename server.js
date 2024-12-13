const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 導入模型
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// 配置 MongoDB
mongoose.connect('mongodb://localhost/chatapp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// 存儲在線用戶
const onlineUsers = new Map();

// 確保上傳目錄存在
const uploadDir = './public/uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 設置靜態文件路徑
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use('/uploads', express.static('public/uploads'));

// 文件上傳配置
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // 處理中文文件名
        const originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(originalname);
        const basename = path.basename(originalname, ext);
        const filename = `${Date.now()}-${basename.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '')}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ storage: storage });

// 文件上傳路由
app.post('/upload', upload.single('file'), (req, res) => {
    if (req.file) {
        res.json({
            filename: req.file.filename,
            originalname: req.file.originalname,
            path: '/uploads/' + req.file.filename
        });
    } else {
        res.status(400).send('No file uploaded.');
    }
});

// 中間件設置
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost/chatapp' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24小時
}));

// 註冊路由
app.post('/register', upload.single('avatar'), async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 檢查用戶是否已存在
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: '用戶名已存在' });
        }

        // 加密密碼
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 創建新用戶
        const user = new User({
            username,
            password: hashedPassword,
            avatar: req.file ? `/uploads/${req.file.filename}` : '/images/default-avatar.png'
        });

        await user.save();
        res.status(201).json({ message: '註冊成功' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服務器錯誤' });
    }
});

// 登錄路由
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // 查找用戶
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: '用戶名或密碼錯誤' });
        }

        // 驗證密碼
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: '用戶名或密碼錯誤' });
        }

        // 保存用戶會話
        req.session.user = {
            id: user._id,
            username: user.username,
            avatar: user.avatar
        };

        res.json({
            username: user.username,
            avatar: user.avatar
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '服務器錯誤' });
    }
});

// Socket.io 連接處理
io.on('connection', (socket) => {
    console.log('新用戶連接');
    
    socket.on('userJoined', (userData) => {
        onlineUsers.set(socket.id, userData);
        io.emit('updateUsersList', Array.from(onlineUsers.values()));
    });

    socket.on('joinRoom', async (room) => {
        try {
            socket.join(room);
            console.log(`用戶加入房間: ${room}`);

            const messages = await Message.find({ room })
                .sort({ timestamp: -1 })
                .limit(50)
                .lean();

            socket.emit('loadChatHistory', messages.reverse());
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    });

    socket.on('chatMessage', async (data) => {
        try {
            const { room, message, user, fileInfo } = data;
            
            const newMessage = new Message({
                room,
                content: message,
                sender: {
                    username: user.username,
                    avatar: user.avatar
                },
                fileInfo: fileInfo
            });
            await newMessage.save();

            io.to(room).emit('message', {
                user: {
                    username: user.username,
                    avatar: user.avatar
                },
                message,
                fileInfo,
                time: new Date().toLocaleTimeString()
            });
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('disconnect', () => {
        onlineUsers.delete(socket.id);
        io.emit('updateUsersList', Array.from(onlineUsers.values()));
        console.log('用戶斷開連接');
    });
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 