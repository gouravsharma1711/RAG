const { ChatGroq } = require("@langchain/groq");

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
  temperature: 0,
});

const { SystemMessage, HumanMessage } = require("@langchain/core/messages");

async function generateResponse(prompt) {
  try {
    if ((!prompt && prompt.length === 0) || prompt.trim() === "") {
      const e = new Error("No Prompt provide from the User");
      e.statusCode = 400;
      throw e;
    }

    const SystemPrompt = new SystemMessage(`
        You are a PDF question-answering assistant(RAG System). Answer using only information explicitly stated in the provided document context. Do not use outside knowledge or make assumptions.

        If the context does not contain enough information to answer the question, reply exactly:
        "I don't know. That information is not present in the document."

        Examples:

        Context: "The company was founded in 2012."
        Question: "When was the company founded?"
        Answer: The company was founded in 2012.

        Context: "The company was founded in 2012."
        Question: "Who founded the company?"
        Answer: I don't know. That information is not present in the document.

        Return only the answer in detail which is required as a plain string. Do not include JSON, Markdown, labels, explanations, or any other formatting.
    `);

    const humanMsg = new HumanMessage(prompt);
    const response = await llm.invoke([SystemPrompt, humanMsg]);

    return response.content;
  } catch (error) {
    throw error;
  }
}

module.exports = generateResponse;
