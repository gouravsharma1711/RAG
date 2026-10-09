const express = require('express');
const app = express();

app.get('/test',(req,res)=>{
    res.json({
        success:true,
        message:"Testing successful"
    })
})


module.exports = app;