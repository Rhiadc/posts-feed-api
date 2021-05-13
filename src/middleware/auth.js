const jwt = require('jsonwebtoken')
const User = require('../models/users')

const auth = async (req, res, next) =>{
    try {
        //pega o token de autorização que vem no request
        const token = req.header('Authorization').replace('Bearer ', '')
        //decodifica o token e vê se o segredo confere com o segredo do token
        const decoded = jwt.verify(token, process.env.SECRET)
        //procura no bd um user com o id decodigicado, e um token armazenado. os dois items
        //precisam ser achados pra retornar o usuario
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        if(!user){
            throw new Error()
        }
        //re-envia o token
        req.token = token
        //re-envia o usuario
        req.user = user
        //prossegue
        next()
    } catch (e) {
        res.status(401).send({error:"Please authenticate."})
    }
}

module.exports = auth