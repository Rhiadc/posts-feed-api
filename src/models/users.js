const mongoose = require('mongoose');
const Post = require('./posts')
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type: String,
        trim: true,
        required: true,
        minLength: 7,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not contain the word "password"')
            }
        }
    },
    avatar:{
        type: Buffer
    },
    likedPosts:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    tokens:[{
        token:{
            type: String,
            required: true
        }
    }]


}, {timestamps:true})

//set posts for user
userSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'owner'
})

//generate auth token for login and update user
userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id:user._id.toString()}, process.env.SECRET)
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

//filtering token and password

userSchema.methods.toJSON = function(){
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    return userObj
}


//find and check credentials passed/stored
userSchema.statics.findByCredentials = async (email, password) =>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('unable do login')
    }

    return user
}

//hashing password with bcrypt on pre

userSchema.pre('save', async function (next){
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

//delete all posts asociated with user
userSchema.pre('remove', async function (next){
    const user = this
    await Post.deleteMany({owner: user._id})
    next()
})



const User = mongoose.model('User', userSchema);
module.exports = User