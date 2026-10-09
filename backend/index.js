const app = require('./src/App.js');




const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`Server is Running on http://localhost:${port}/`);
})