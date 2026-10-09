const {PDFLoader} = require("@langchain/community/document_loaders/fs/pdf");
const {RecursiveCharacterTextSplitter } = require('@langchain/textsplitters')

async function pdfLoader(src){
    const loader = new PDFLoader(src);

    const docs = await loader.load();

    return docs;
}


async function splitDocumentsIntoChunks(docs){
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize:500,
        chunkOverlap:100
    })

    const chunks = await splitter.splitDocuments(docs);
    
    return chunks;
}

module.exports = {
    pdfLoader,
    splitDocumentsIntoChunks
};