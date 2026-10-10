const { generateEmbeddingsFromChunks } = require("../services/embeddingLLM.service");
const { uploadChunks } = require("../services/pinecone.service");
const { pdfLoader, splitDocumentsIntoChunks } = require("./document_processor");

async function injectDataFromPdfToPinecone() {
    let stage = "PDF loading";

    try {
        const docs = await pdfLoader("./public/files/sampleDoc.pdf");

        stage = "Document splitting";
        const chunks = await splitDocumentsIntoChunks(docs);

        stage = "Embedding generation";
        const embeddings = await generateEmbeddingsFromChunks(chunks);

        

        stage = "Pinecone upload";
        await uploadChunks(chunks, embeddings);

        console.log(`Successfully uploaded ${chunks.length} chunk(s) to Pinecone.`);
    } catch (error) {
        console.error(`${stage} failed:`, error);
        process.exitCode = 1;
    }
}

injectDataFromPdfToPinecone();