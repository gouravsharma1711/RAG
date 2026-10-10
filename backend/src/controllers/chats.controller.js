const { getRelevantData } = require("../services/pinecone.service");


const chatController = async(req,res)=>{
    const {userMsg }= req.body;


    const releventData = await getRelevantData(userMsg);
    const data = releventData.map((data)=>data.text).join('\n');

    res.status(200).json({
        message:"Hello World",
        data,
        status:200
    })
}


module.exports = {
    chatController
}