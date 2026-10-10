const express = require('express');
const cors = require('cors');
const app = express();

// middlewares
app.use(express.json());
app.use(cors({
    credentials:true,
    origin:process.env.FRONTEND_URL
}));


// for testing 
app.get('/test',(req,res)=>{
    res.json({
        success:true,
        message:"Testing successful"
    })
})



const chatRouter = require('./routers/chats.router.js')

app.use('/api/v1/',chatRouter);

module.exports = app;