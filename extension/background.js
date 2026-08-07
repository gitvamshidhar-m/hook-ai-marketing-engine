const HOOK_AI = "https://hook-ai-marketing-engine.vercel.app";

function openGenerator(text) {
  const topic = (text || "").trim().slice(0, 120);
  const url = `${HOOK_AI}/?topic=${encodeURIComponent(topic)}`;
  chrome.tabs.create({ url });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "hook-ai-generate",
    title: 'Write a marketing hook for "%s"',
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info) => {
  if (info.menuItemId === "hook-ai-generate") {
    openGenerator(info.selectionText);
  }
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: `${HOOK_AI}/#tool` });
});