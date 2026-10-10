const input = document.querySelector("#input");
const container = document.querySelector("#container");
const askButton = document.querySelector("#askButton");
const welcomeDiv = document.querySelector('#welcome-screen');
const askButtonLabel = askButton?.textContent?.trim() || "Ask";
let isSubmitting = false;

input?.addEventListener("keydown", handleEnter);
askButton?.addEventListener("click", handleClickEvent);

function setAskButtonLoading(isLoading) {
  if (!askButton) {
    return;
  }

  askButton.disabled = isLoading;
  if (isLoading) {
    const spinner = document.createElement("span");
    spinner.setAttribute(
      "class",
      "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
    );
    spinner.setAttribute("aria-hidden", "true");

    const loadingLabel = document.createElement("span");
    loadingLabel.setAttribute("class", "sr-only");
    loadingLabel.textContent = "Loading";

    askButton.setAttribute("aria-busy", "true");
    askButton.replaceChildren(spinner, loadingLabel);
    return;
  }

  askButton.removeAttribute("aria-busy");
  askButton.textContent = askButtonLabel;
}

function generateUserMsg(userMsg) {

  const userMsgDiv = document.createElement("div");
  userMsgDiv.setAttribute(
    "class",
    "my-6 bg-neutral-800 p-3 rounded-xl ml-auto w-fit max-w-[min(80%,36rem)] mx-4 overflow-hidden whitespace-pre-wrap break-words",
  );
  userMsgDiv.innerText = `${userMsg}`;
  container?.appendChild(userMsgDiv);
  scrollMessageAboveComposer(userMsgDiv);
}

function scrollMessageAboveComposer(message) {
  const composer = input?.closest(".fixed");
  const composerHeight = composer?.getBoundingClientRect().height ?? 0;
  const gap = 16;
  const visibleBottom = window.innerHeight - composerHeight - gap;
  const messageBottom = message.getBoundingClientRect().bottom;
  const scrollOffset = messageBottom - visibleBottom;

  window.scrollTo({
    top: window.scrollY + scrollOffset,
    behavior: "smooth",
  });
}

function generateAiReply(aiReply = "hello") {
  const aiMsgDiv = document.createElement("div");
  aiMsgDiv.setAttribute(
    "class",
    "mr-auto my-4 mx-4 max-w-3xl rounded-xl  p-4 leading-7 break-words",
  );
  aiMsgDiv.textContent = aiReply;

  container?.appendChild(aiMsgDiv);
  scrollMessageAboveComposer(aiMsgDiv);
}

function generateError(errorMessage) {
  const errorMsgDiv = document.createElement("div");
  errorMsgDiv.setAttribute(
    "class",
    "m-6 mx-4 p-3 max-w-fit  bg-red-950 border border-red-800 rounded-xl leading-normal break-words",
  );
  errorMsgDiv.setAttribute("role", "alert");
  errorMsgDiv.textContent = `Error : ${errorMessage}`;

  container?.appendChild(errorMsgDiv);
}

const Loading = document.createElement("div");
Loading.setAttribute("class", "m-4 animate-pulse");
Loading.textContent = "Thinking... ";

async function handleEnter(e) {
  if (e.key !== "Enter") {
    return;
  }

  e.preventDefault();
  e.stopPropagation();
  await submitMessage();
}

async function handleClickEvent(e) {
  e.preventDefault();
  e.stopPropagation();
  await submitMessage();
}

async function submitMessage() {
  if (isSubmitting) {
    return;
  }

  isSubmitting = true;
  setAskButtonLoading(true);

  try {
    const text = input?.value.trim();
    if (!text) {
      throw new Error("Please Send Some text to LLM");
    }
    welcomeDiv?.remove();
    generateUserMsg(text);
    container?.appendChild(Loading);
    scrollMessageAboveComposer(Loading);

    if (input) {
      input.value = "";
    }

    await apiCaller(text);
  } catch (error) {
    generateError(
      error instanceof Error ? error.message : "An unexpected error occurred.",
    );
  } finally {
    isSubmitting = false;
    setAskButtonLoading(false);
    Loading.remove();
  }
}

async function apiCaller(userMsg) {
  const response = await fetch("http://localhost:3000/api/v1/chats", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userMsg,
    }),
  });

  let apiResponse;
  try {
    apiResponse = await response.json();
  } catch (error) {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(apiResponse?.message || "The request failed.");
  }

  if (typeof apiResponse?.Response !== "string") {
    throw new Error("The server response did not contain a valid AI reply.");
  }

  generateAiReply(apiResponse.Response);
}
