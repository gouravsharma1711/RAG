const {
    generateResponse,
    classifyMessage,
} = require("../services/LLM.service.js");
const { getRelevantData } = require("../services/pinecone.service.js");

const chatController = async(req,res)=>{
    try {
        const {userMsg}= req.body;

        if(typeof userMsg !=="string"){
            const e = new Error("Invalid message format. Please provide a string.");
            e.statusCode = 400;
            throw e;
        }

        if(!userMsg || userMsg.trim() ===""){
            const e = new Error("Please provide a message to send to the LLM");
            e.statusCode = 400;
            throw e;
        }
    
        const classification = await classifyMessage(userMsg);
        
        let llmResponse;

        if (classification.type === "small-talk") {
            llmResponse = classification.reply;
        } else {
            const relevantData = await getRelevantData(userMsg);
            const context = relevantData.map((item) => item.text).join("\n");
            const prompt = `
                Context: ${context}
                Question: ${userMsg}
            `;
            llmResponse = await generateResponse(prompt);
        }

        if(!llmResponse || llmResponse.trim() ===""){
            const e = new Error("No response from the LLM");
            e.statusCode = 500;
            throw e;
        }
    
        res.status(200).json({
            message:"Successfully received the LLM response",
            Response:llmResponse,
            statusCode:200
        })

    } catch (error) {
        res.status(error.statusCode || 500).json({
            message:error.message,
            success:false,
            Response:undefined,
            stack: process.env.NODE_ENV === "development"? error.stack : undefined
        })
    }
}


module.exports = {
    chatController
}