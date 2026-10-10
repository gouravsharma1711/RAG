
const {GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai')

const embeddingModel = new GoogleGenerativeAIEmbeddings({
    apiKey:process.env.GIMINI_API_KEY,
    model:"gemini-embedding-001"
})


async function generateEmbeddingsFromChunks(chunks) {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        throw new TypeError("At least one document chunk is required to generate embeddings.");
    }

    try {

        const texts = chunks.map((chunk, index) => {
            if (typeof chunk?.pageContent !== "string" || chunk.pageContent.trim() === "") {
                throw new Error(`Chunk at position ${index} has no text content.`);
            }
            return chunk.pageContent;
        });
        
        const batchSize = 5;
        const vectors =[];

        for(let i=0;i<texts.length;i+=batchSize){
            const batch = texts.slice(i,i+batchSize);
            const batchVectors = await embeddingModel.embedDocuments(batch)
            vectors.push(...batchVectors);
        }
        
        if(chunks.length !== vectors.length){
            throw new Error(`Mismatch: ${chunks.length} chunks but ${vectors.length} vectors`);
        }

        return vectors;
    } catch (error) {
        throw new Error(`Error generating chunk embeddings: ${error.message || String(error)}`, { cause: error });
    }
}

async function generateEmbeddingFromQuery(query) {
    if (typeof query !== "string" || query.trim() === "") {
        throw new TypeError("A non-empty query is required to generate an embedding.");
    }

    try {
        const embedding = await embeddingModel.embedQuery(query);
        return embedding

    } catch (error) {
        throw new Error(`Error generating query embedding: ${error.message || String(error)}`, { cause: error });
    }
}

module.exports = {
    embeddingModel,
    generateEmbeddingsFromChunks,
    generateEmbeddingFromQuery
};