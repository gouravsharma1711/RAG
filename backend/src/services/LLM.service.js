const { ChatGroq } = require("@langchain/groq");
const { z } = require("zod");

const classificationSchema = z.object({
  type: z.enum(["small-talk", "DOCUMENT_QUESTION"]),
  reply: z.string().nullable(),
});

const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "openai/gpt-oss-20b",
  temperature: 0,
});

const { SystemMessage, HumanMessage } = require("@langchain/core/messages");

async function generateResponse(prompt) {
  try {
    if (typeof prompt !== "string" || prompt.trim() === "") {
      const e = new Error("No Prompt provide from the User");
      e.statusCode = 400;
      throw e;
    }

    const SystemPrompt = new SystemMessage(`
        Your Name is Askfolio, You are a PDF question-answering(RAG) assistant.

        For simple social messages such as "hello", "hey", "good morning", "thank you", or "goodbye", respond with a brief, friendly reply. These greetings do not need to be supported by the document context.

        For every other question, answer using only information explicitly stated in the provided document context. Do not use outside knowledge, make assumptions, or answer questions unrelated to the document. If the context is missing or does not contain enough information to answer, reply exactly:
        "I don't know. That information is not present in the document."

        Examples:

        User: "Hey!"
        Answer: Hello! How can I help you with the document?

        Context: "The company was founded in 2012."
        Question: "When was the company founded?"
        Answer: The company was founded in 2012.

        Context: "The company was founded in 2012."
        Question: "Who founded the company?"
        Answer: I don't know. That information is not present in the document.

        Return only the Proper well structred plain string answer(not in single word answer). Do not include JSON, Markdown, labels, or explanations about your process.
    `);

    const humanMsg = new HumanMessage(prompt);
    const response = await llm.invoke([SystemPrompt, humanMsg]);

    return response.content;
  } catch (error) {
    throw error;
  }
}

async function classifyMessage(message) {
  if (typeof message !== "string" || message.trim() === "") {
    throw new TypeError("A non-empty message is required for classification.");
  }

  const systemPrompt = new SystemMessage(`
    You are Askfolio's message classifier.

    Your task is to classify the user's entire message into exactly one
    of these categories:
    1. "small-talk"
    2. "DOCUMENT_QUESTION"

    ## Category 1: small-talk

    Choose "small-talk" when the message contains only casual social
    conversation and does not request substantive information.

    Examples include:
    - Greetings: "Hi", "Hello", "Hey there"
    - Asking how you are: "How are you?"
    - Gratitude: "Thanks", "Thank you so much"
    - Farewells: "Goodbye", "See you later"
    - Asking your identity: "Who are you?", "What's your name?"
    - Casual conversation: "Nice to meet you"

    For this category, provide a brief, friendly reply.

    ## Category 2: DOCUMENT_QUESTION

    Choose "DOCUMENT_QUESTION" if the user asks for substantive
    information, including:
    - Questions about an uploaded document
    - Summaries, explanations, facts, or analysis
    - Requests for advice or instructions
    - Requests to compare, extract, or interpret information
    - Follow-up questions about a previous document answer

    Do not answer the substantive question during classification.
    

    ## Classification rules

    
    - Classify the entire message, not just its first sentence.
    - If a greeting or thanks accompanies a substantive question,
      choose "DOCUMENT_QUESTION".
    - When uncertain, choose "DOCUMENT_QUESTION".
    - For "small-talk", include a short, natural reply.
    - For "DOCUMENT_QUESTION", return only the type. Do not include a reply.
    -If type is "small-talk", provide a brief, friendly reply.
    -If type is "DOCUMENT_QUESTION", set reply to null.
    -Always return both fields.

    ## Examples of expected outputs

    Example 1:
    User message: "Hi!"
    Output:
    {
      "type": "small-talk",
      "reply": "Hey! How can I help you today?"
    }

    Example 2:
    User message: "How are you?"
    Output:
    {
      "type": "small-talk",
      "reply": "I'm doing well, thanks for asking! How can I help you?"
    }

    Example 3:
    User message: "What is this document about?"
    Output:
    {
      "type": "DOCUMENT_QUESTION"
    }

    Example 4:
    User message: "Summarize chapter 2."
    Output:
    {
      "type": "DOCUMENT_QUESTION"
    }

    Example 5:
    User message: "Thanks! What does section 3 mean?"
    Output:
    {
      "type": "DOCUMENT_QUESTION"
    }

    Example 6:
    User message: "Who are you?"
    Output:
    {
      "type": "small-talk",
      "reply": "I'm Askfolio, your document question-answering assistant!"
    }

    Follow the output structure exactly. Never include a reply for
    "DOCUMENT_QUESTION". Never classify a substantive question as
    "small-talk".
    `);

  const structuredLLM = llm.withStructuredOutput(
    classificationSchema,
    {
      method:"jsonSchema",
      strict:true
    }
  );

  const response = await structuredLLM.invoke([
    systemPrompt,
    new HumanMessage(message),
  ]);


  return response;
}

module.exports = {
  generateResponse,
  classifyMessage,
};
