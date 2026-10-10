const { Pinecone } = require("@pinecone-database/pinecone");
const { PineconeStore } = require("@langchain/pinecone");
const {
  embeddingModel,
  generateEmbeddingFromQuery,
} = require("./embeddingLLM.service");

let index;

function getIndex() {
  if (!process.env.PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not set.");
  }
  if (!process.env.PINECONE_INDEX_NAME) {
    throw new Error("PINECONE_INDEX_NAME is not set.");
  }

  if (!index) {
    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
  }

  return index;
}

async function uploadChunks(chunks, embeddings) {
  if (!Array.isArray(chunks) || !Array.isArray(embeddings)) {
    throw new Error("Chunks and embeddings must both be arrays.");
  }

  if (chunks.length !== embeddings.length) {
    throw new Error(
      `Mismatch: ${chunks.length} chunks but ${embeddings.length} embeddings`,
    );
  }

  try {
    const vectorStore = new PineconeStore(embeddingModel, {
      pineconeIndex: getIndex(),
      namespace: "",
    });

    await vectorStore.addVectors(embeddings, chunks, {
      ids: chunks.map((_, i) => `chunk-${i}`),
    });
    console.log("Vector upload completed.");
  } catch (error) {
    throw new Error(`Pinecone upload failed: ${error.message || String(error)}`, { cause: error });
  }
}

async function getRelevantData(query, topK = 3) {
  try {
    const queryVector = await generateEmbeddingFromQuery(query);

    const result = await getIndex().query({
      vector: queryVector,
      topK,
      includeMetadata: true,
    });

    const relevantChunks = (result.matches || [])
      .filter((match) => match.metadata?.text)
      .map((match) => ({
        text: match.metadata.text,
        score: match.score,
        metadata: match.metadata,
      }));

    return relevantChunks;
  } catch (error) {
    throw new Error(`Pinecone search failed: ${error.message || String(error)}`, { cause: error });
  }
}

module.exports = {
  uploadChunks,
  getRelevantData,
};
