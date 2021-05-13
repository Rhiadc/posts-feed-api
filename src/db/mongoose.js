const mongoose = require('mongoose')
const connectionURI = process.env.CONNECTION_URI;

mongoose.connect(connectionURI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})