const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Buffer.from(file.originalname, 'latin1').toString('utf8'));
    }
});

const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    res.send('File uploaded successfully.');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});