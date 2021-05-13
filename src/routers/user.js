const express = require('express');
const User = require('../models/users');
const auth = require('../middleware/auth');
const router = new express.Router();
const multer = require('multer')


//avatar middleware upload
const avatar = multer({
    limits:{
        fileSize:10000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            return cb(new Error('Please upload a valid image'))
        }
        cb(undefined, true)
    }
})


//POST create new user
router.post('/',  avatar.single('avatar'), async (req, res)=>{
    const avatar = req.file ? req.file.buffer : undefined
    const taken = await User.findOne({email: req.body.email})
    
    if(taken){
        return res.status(401).send({message: "Email already used"})
    }
    
    try {
        const user = new User({
            ...req.body,
            avatar: avatar
        })
        const token = await user.generateAuthToken()
        await user.save()
        res.status(201).send({user, token})
    } catch (e) {
        res.status(400).send({message: e.message})
    }
})


//DELETE delete avatar

router.delete('/me/avatar', auth, async(req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.status(200).send({message: "Avatar successfuly deleted"})
})

//POST login user
router.post('/login', async(req,res)=>{

    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({user, token})
    }catch (e) {
        res.status(400).send({message: "Unable to login"})
    }
})

//GET get username by ID
router.get('/:id', async(req, res)=>{
    const _id = req.params.id
    try {
        const user = await User.findOne({_id:_id})
        if(!user){
            return res.send({message: "User not found"})
        }
        res.status(200).send(user.name)
    } catch (e) {
        res.status(500).send({message: e.message})
    }
})

//POST logout
router.post('/logout', auth, async (req, res)=>{
    try {
        req.user.tokens = req.user.tokens.filter(item=>item.token !== req.token)
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send({message: e.message})        
    }
})

//POST logout all
router.post('/logout/all', auth, async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send(res.user)
    } catch (e) {
        res.status(500).send()
    }
})

//GET get logged user
router.get('/me/current', auth, (req, res)=>{
    try {
        res.send(req.user)
    } catch (e) {
        res.status(500).send({message: e.message})
    }
})


//GET  get user avatar
router.get('/:id/avatar', async(req,res)=>{
    try{
        const user = await User.findOne({_id:req.params.id})
        if(!user || !user.avatar){
            throw new Error()
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    }catch (e){
        res.status(400).send({message: e.message})
    }
})
//PATCH update logged in user

router.patch('/me', auth,  avatar.single('avatar'), async(req, res)=>{
    const avatar = req.file ? req.file.buffer : undefined
    const field = ['name', 'email', 'password', 'avatar']
    const updates = Object.keys(req.body)
    const allowed = updates.every(item=>field.includes(item))
    if(!allowed){
        return res.status(400).send({message: "Invalid update input"})
    }
    try{
        if(req.body.email){
            const taken = await User.findOne({email:req.body.email})
            if(taken && req.body.email !== req.user.email){
                return res.status(400).send({message: "Email already in use"})
            }
        }
        const user = req.user
        updates.forEach(item=> user[item] = req.body[item])
        if(req.file){
            user.avatar = avatar
        }
        
        await user.save()
        res.send({user, message:'Successfully updated'})
    } catch (e){
        res.status(400).send({message: e.message})
    }
})

//DELETE delete logged in user

router.delete('/me', auth, async (req,res)=>{
    try {
        await req.user.remove()
        res.send({message: "User succeffully deleted"})
    } catch (e) {
        res.status(500).send({message: "Unable to delete user"})
    }
})



module.exports = router