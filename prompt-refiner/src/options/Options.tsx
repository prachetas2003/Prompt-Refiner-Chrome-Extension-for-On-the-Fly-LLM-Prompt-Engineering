/// <reference types="react" />
import React, { useEffect, useState } from "react";

export default function Options() {
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    chrome.storage.sync.get("geminiApiKey").then(o => {
      if (o.geminiApiKey) setApiKey(o.geminiApiKey);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await chrome.storage.sync.set({ geminiApiKey: apiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  return (
    <form className="p-4 max-w-md mx-auto" onSubmit={handleSave}>
      <label className="block mb-2 font-semibold">Gemini API Key</label>
      <input
        type="password"
        className="w-full p-2 border rounded mb-2"
        value={apiKey}
        onChange={e => setApiKey(e.target.value)}
        placeholder="Enter your Gemini API key"
      />
      <button
        type="submit"
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Save
      </button>
      {saved && <span className="ml-2 text-green-600">Saved!</span>}
    </form>
  );
} 