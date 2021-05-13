const express = require('express');
const multer = require('multer');
const Post = require('../models/posts');
const auth = require('../middleware/auth');
const router = new express.Router();


//image middleware for create/update
const picture = multer({
    limits:{
        fileSize:10000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpeg|jpg|png)$/)){
            req.fileValidationError = 'error'
            return cb(null, false, req.fileValidationError)
        }
        cb(undefined, true)
    }
})


//POST create a new post
router.post('/', auth, picture.single('picture'), async (req, res)=>{
    const picture = req.file ? req.file.buffer : undefined
    if(req.fileValidationError){
        return res.status(400).send({message:'Please upload a valid image' })
    }
    const post = new Post({
        ...req.body,
        owner: req.user._id,
        picture: picture
    })
    try {
        await post.save()
        res.status(201).send({post, message:'success'})
    } catch (e) {
        res.status(400).send({message: e.message})
    }
})




//GET get all posts
router.get('/all', async(req, res)=>{
    try{
        res.header("Access-Control-Allow-Origin", "*");
        const posts = await Post.find({})
        res.status(200).send(posts)
    } catch (e) {
        res.status(400).send({message: e.message})
    }
})

//GET get user posts
router.get('/', auth, async (req, res)=>{
    try{
        await req.user.populate({
            path: 'posts'
        }).execPopulate()
        res.send(req.user.posts)
    } catch (e) {
        res.status(500).send({message: e.message})
    }
})

//GET get all liked posts by logged in user
router.get('/liked', auth, async (req,res)=>{
    try{
            await req.user.populate({
                path: 'likedPosts'
            }).execPopulate() 
        res.send(req.user.likedPosts)
    } catch (e) {
        res.status(500).send({message: e.message})
    }
})



//GET posts by category
router.get('/:category', async(req,res)=>{
    const category = req.params.category.toLowerCase()
    try {
        const posts = await Post.find({category: category})
        if(!posts){
            return res.status(404).send({message: "No posts found"})
        }
        res.status(200).send(posts)
    } catch (e) {
        res.status(400).send(e.message)
    }
})



//PATCH update post
router.patch('/:id', picture.single('picture'), auth, async (req, res)=>{
    const picture = req.file ? req.file.buffer : undefined
    const fields = ['title', 'category', 'text']
    const requiredValues = Object.keys(req.body)
    const allowed = requiredValues.every(item=>fields.includes(item))
    if(!allowed){
        return res.status(400).send({message: "Invalid update"})
    }
    const postId = req.params.id
    try {
        const updatedPost = await Post.findOne({_id:postId, owner:req.user._id})
        if(!updatedPost){
            res.status(404).send({message: "Post not found"})
        }
        requiredValues.forEach(item=>updatedPost[item] = req.body[item])
        if(picture && (req.file !== '')){
            updatedPost.picture = picture
        }
        await updatedPost.save()
        res.send({message:'Post Successfully updated', updatedPost})
    } catch (e) {
        res.status(400).send({message: e.message})
    }
})
//GET get post by ID
router.get('/show/:id/', async(req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    const id = req.params.id
    try{
        const post = await Post.findOne({_id:id})
        if(!post){
            return res.status(404).send({message: "Post not found"})
        }
        res.send(post)
    } catch (e) {
        res.status(500).send({message: "Post not found"})
    }
})

//PATCH like a post
router.patch('/like/:id', auth, async(req, res)=>{
    const postId = req.params.id
    if(req.user.likedPosts.includes(postId)){
        req.user.likedPosts = req.user.likedPosts.filter(item=>item.toString() !== postId)
        await Post.findByIdAndUpdate(postId, { $inc: { likes: -1 } })
        await req.user.save()
        return res.status(201).send(req.user.likedPosts)
    }
    try {
        req.user.likedPosts = req.user.likedPosts.concat(postId)
        await req.user.save()
        await Post.findByIdAndUpdate(postId, { $inc: { likes: 1 } })
        res.status(200).send(req.user.likedPosts)
    } catch (e) {
        res.send({message: e.message})
    } 
})

//GET get post picture
router.get('/:id/picture', async(req,res)=>{
    try{
        const post = await Post.findOne({_id:req.params.id})
        if(!post || !post.picture){
            throw new Error()
        }
        res.header("Access-Control-Allow-Origin", "*");
        res.set('Content-Type', 'image/jpg')
        res.send(post.picture)
    }catch (e){
        res.status(400).send(e.message)
    }
})
//DELETE delete post picture
router.delete('/picture/:id', auth, async (req, res)=>{
    const postId = req.params.id
    try {
        const deletedPicture = await Post.findOne({_id:postId, owner: req.user._id})
        if(!deletedPicture){
            return res.status(404).send({message:"Post not found"})
        }
        deletedPicture.picture = undefined
        await deletedPicture.save()
        res.status(200).send(deletedPicture)
    } catch (e) {
        res.status(400).send(e)
    }
})
//DELETE delete user post
router.delete('/:id', auth, async (req, res)=>{
    const postId = req.params.id
    try{
        const deletedPost = await Post.findOneAndDelete({_id:postId, owner: req.user._id})
        if(!deletedPost){
            res.status(404).send({message: "Post not found"})
        }
        res.send(deletedPost)
    } catch (e){
        res.status(500).send(e.message)
    }
})



module.exports = router