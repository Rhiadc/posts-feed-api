const mongoose = require('mongoose');
const validator = require('validator');
const User = require('./users')

const postSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    picture:{
        type: Buffer
    },
    text:{
        type: String,
        trim: true,

    },
    category:{
        type: String,
        lowercase: true,
        trim: true,
        minLength: 30,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    likes:{
        type: Number,
        required: true,
        default: 0

    }
}, {timestamps:true})

const Post = mongoose.model('Post', postSchema);

module.exports = Post