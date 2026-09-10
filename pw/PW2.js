const express = require('express')
const mongoose = require('mongoose')

const app = express()

// Middleware para ler dados JSON
app.use(express.urlencoded({
    extended: true
}))

app.use(express.json())

// Conexão com o MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/apinodejs')
    .then(() => {
        console.log('Banco de dados conectado!')
    })
    .catch((erro) => {
        console.log('Erro ao conectar no banco:', erro)
    })

// Rota inicial
app.get('/', (req, res) => {
    res.json({
        message: 'Oi Express'
    })
})

// Iniciar servidor
app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000')
})