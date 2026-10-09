
const {GoogleGenerativeAIEmbeddings } = require('@langchain/google-genai')

const embeddings = new GoogleGenerativeAIEmbeddings({
    apiKey:process.env.GIMINI_API_KEY,
    model:"gemini-embedding-2"
})


async function generateEmbeddings(chunks) {

    try {
        const texts = chunks.map((chunk)=>chunk.pageContent);
        console.log("Texts : ",texts[0]);
        
        const batchSize = 5;
        const vectors =[];

        for(let i=0;i<texts.length;i+=batchSize){
            const batch = texts.slice(i,i+batchSize);
            const batchVectors = await embeddings.embedDocuments(batch)
            vectors.push(...batchVectors);
        }
        
    
        console.log("Chunks:", chunks.length);
        console.log("Vectors:", vectors.length);
        console.log("last vector:", vectors[71]);
        console.log("Dimensions:", vectors[0]?.length);
        
        return vectors;
    } catch (error) {
        console.log("Error : ",error.message);
        
    }
}


module.exports = generateEmbeddings;