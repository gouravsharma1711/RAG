const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

async function pdfLoader(src) {
    if (typeof src !== "string" || src.trim() === "") {
        throw new TypeError("A non-empty PDF file path is required.");
    }

    try {
        const loader = new PDFLoader(src);
        const docs = await loader.load();

        if (docs.length === 0) {
            throw new Error("The PDF contains no readable pages.");
        }

        return docs;
    } catch (error) {
        throw new Error(`Could not load PDF "${src}": ${error.message || String(error)}`, { cause: error });
    }
}

async function splitDocumentsIntoChunks(docs) {
    if (!Array.isArray(docs) || docs.length === 0) {
        throw new TypeError("At least one loaded document is required to create chunks.");
    }

    try {
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 100,
        });
        const chunks = await splitter.splitDocuments(docs);

        if (chunks.length === 0) {
            throw new Error("No text chunks were produced from the loaded documents.");
        }

        return chunks;
    } catch (error) {
        throw new Error(`Could not split documents into chunks: ${error.message || String(error)}`, { cause: error });
    }
}

module.exports = {
    pdfLoader,
    splitDocumentsIntoChunks
};