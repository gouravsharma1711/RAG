const generateEmbeddings = require("../services/embeddingLLM.service");
const { pdfLoader, splitDocumentsIntoChunks } = require("../utils/document_processor")

const chatController = async(req,res)=>{

    const docs = await pdfLoader("./public/files/sampleDoc.pdf");

    const chunks = await splitDocumentsIntoChunks(docs);

    const vectors = await generateEmbeddings(chunks);
    console.log("vectors : ",vectors);
    
    
    res.status(200).json({
        message:"Hello World",
        status:200
    })
}


module.exports = {
    chatController
}