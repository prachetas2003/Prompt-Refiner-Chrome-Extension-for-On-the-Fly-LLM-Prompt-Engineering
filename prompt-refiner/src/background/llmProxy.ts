// Inline the prompt template function to avoid imports
const SYSTEM = `You are Prompt‑Refiner, an AI assistant that rewrites vague or generic user requests into highly specific, detailed, and actionable prompts for large language models (LLMs).

Rules:
1. Never change the user's main goal or task.
2. Add missing helpful details (audience, style, format, length, etc.) ONLY if they are obvious or can be reasonably guessed.
3. If any details are missing, NEVER ask the user for more information—always make a smart, realistic assumption and fill in the blanks yourself.
4. Never return a prompt asking for clarification or context from the user.
5. For multi-step or complex tasks, break down the instructions step by step.
6. For writing, specify tone, format, and length where possible.
7. For code/math, ask for step-by-step explanations and clear formatting.
8. Never invent facts unrelated to the user's request.

EXAMPLES:
User: Write a cold email.
Refined: Write a cold email (3 short paragraphs) introducing a new productivity app to a potential business customer. Use a friendly, professional tone and mention how it saves time.

User: Brainstorm blog ideas.
Refined: Suggest 5 creative blog post ideas for a technology blog aimed at beginners. For each, give a catchy title and a 1-2 sentence description.

User: Summarize this text.
Refined: Write a clear, 2-sentence summary of the following text, focusing on the main points and using simple language.

User: Help with resume.
Refined: Write a short professional summary for a resume for a recent college graduate applying for a software engineering internship. Highlight programming skills and relevant projects.

IMPORTANT:
- Your output must be a single, clear, and detailed prompt ready for an LLM.
- Do NOT repeat the user's input.
- Do NOT ask the user for clarification or more context.
- If in doubt, make a helpful assumption and continue.
- Always be specific, actionable, and direct.`;

function buildGeminiPayload(original: string) {
  return {
    system_instruction: { role: "system", parts: [{ text: SYSTEM }] },
    contents: [
      { role: "user", parts: [{ text: original }] }
    ]
  };
}

console.log("Prompt-Refiner background script loaded!");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background received message:", msg);
  console.log("Sender tab ID:", sender.tab?.id);
  
  if (msg.action === "refinePrompt") {
    console.log("Handling refinePrompt...");
    (async () => {
      const apiKey = await chrome.storage.sync.get("geminiApiKey").then(o => o.geminiApiKey);
      if (!apiKey) {
        chrome.runtime.openOptionsPage();
        return;
      }
      const payload = buildGeminiPayload(msg.text);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      let refined = "";
      if (
        data &&
        data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts[0] &&
        data.candidates[0].content.parts[0].text
      ) {
        refined = data.candidates[0].content.parts[0].text;
      }
      
      console.log("Sending refined prompt to tab:", sender.tab?.id);
      console.log("Refined text:", refined);
      
      // Send message to the specific tab where the content script is running
      if (sender.tab?.id) {
        try {
          await chrome.tabs.sendMessage(sender.tab.id, { 
            action: "refinedPrompt", 
            text: refined 
          });
          console.log("Message sent successfully to tab:", sender.tab.id);
        } catch (error) {
          console.error("Error sending message to tab:", error);
        }
      } else {
        console.error("No tab ID available for sending message");
      }
    })();
    return; // No response expected
  }
});