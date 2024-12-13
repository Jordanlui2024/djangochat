const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    sender: {
        username: {
            type: String,
            required: true
        },
        avatar: {
            type: String,
            default: '/images/default-avatar.png'
        }
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema); 