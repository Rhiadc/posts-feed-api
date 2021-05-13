const express = require('express');
const userRouter = require('./routers/user')
const postRouter = require('./routers/post')
const path = require('path')
const port = process.env.PORT 
var cors = require('cors')
require('./db/mongoose');



const app = express()
app.use(cors())
app.use(express.json())
app.use('/api/users', userRouter)
app.use('/api/posts', postRouter)


if(process.env.NODE_ENV === 'production'){
    app.use(express.static('client/build'))
    app.get('*', (req,res)=>{
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}



app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
})