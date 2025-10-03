// Content script: injects a floating Modify button and panel for selected text in editable fields

// Panel component (simplified React-like structure)
function createPanel() {
  const panel = document.createElement('div');
  panel.id = 'pr-panel';
  panel.className = 'pr-panel';
  panel.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    height: 500px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  panel.innerHTML = `
    <div style="padding: 16px; border-bottom: 1px solid #eee;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Prompt Refiner</h3>
        <button id="pr-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #666;">×</button>
      </div>
    </div>
    <div style="padding: 16px; height: 400px; overflow-y: auto;">
      <div id="pr-loading" style="display: none; text-align: center; padding: 40px;">
        <div style="width: 20px; height: 20px; border: 2px solid #f3f3f3; border-top: 2px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 16px; color: #666;">Refining your prompt...</p>
      </div>
      <textarea id="pr-output" style="width: 100%; height: 350px; border: 1px solid #ddd; border-radius: 4px; padding: 8px; font-family: monospace; font-size: 14px; resize: none;color: #111;" placeholder="Refined prompt will appear here..."></textarea>
    </div>
    <div style="padding: 16px; border-top: 1px solid #eee; display: flex; gap: 8px;">
      <button id="pr-copy" style="flex: 1; padding: 8px 16px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">Copy</button>
      <button id="pr-close-btn" style="flex: 1; padding: 8px 16px; background: #f1f1f1; color: #333; border: none; border-radius: 4px; cursor: pointer;">Close</button>
    </div>
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  return panel;
}

function isEditable(el: Element | null): boolean {
  if (!el) return false;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') return true;
  if ((el as HTMLElement).isContentEditable) return true;
  return false;
}

function getSelectedEditable(): Element | null {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return null;
  const anchorNode = selection.anchorNode;
  if (!anchorNode) return null;
  let el: Element | null = anchorNode.nodeType === 1 ? (anchorNode as Element) : anchorNode.parentElement;
  while (el && el !== document.body) {
    if (isEditable(el)) return el;
    el = el.parentElement;
  }
  return null;
}

function getSelectionRect(): DOMRect | null {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  const range = selection.getRangeAt(0).cloneRange();
  if (range.collapsed) return null;
  const rect = range.getBoundingClientRect();
  return rect;
}

function removeButton(): void {
  const btn = document.getElementById('pr-btn');
  if (btn) btn.remove();
}

function showButton(selectedText: string, rect: DOMRect): void {
  removeButton();
  const btn = document.createElement('div');
  btn.id = 'pr-btn';
  btn.className = 'bg-green-500 text-white rounded-full px-3 py-1 shadow fixed z-50 cursor-pointer select-none transition-opacity duration-200';
  btn.textContent = 'Modify';
  btn.style.cssText = `
    position: fixed;
    top: ${window.scrollY + rect.bottom + 6}px;
    left: ${window.scrollX + rect.left}px;
    background: #10b981;
    color: white;
    border-radius: 9999px;
    padding: 4px 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    z-index: 10000;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    font-weight: 500;
  `;
  btn.onclick = () => {
    showPanel(selectedText);
    removeButton();
  };
  document.body.appendChild(btn);
}

let currentPanel: HTMLElement | null = null;

function showPanel(selectedText: string): void {
  console.log("Content script: Showing panel with text:", selectedText);
  
  // Remove existing panel
  if (currentPanel) {
    currentPanel.remove();
  }
  
  // Create and show new panel
  currentPanel = createPanel();
  document.body.appendChild(currentPanel);
  currentPanel.style.display = 'block';
  
  // Set up event listeners
  const closeBtn = currentPanel.querySelector('#pr-close') as HTMLElement;
  const closeBtn2 = currentPanel.querySelector('#pr-close-btn') as HTMLElement;
  const copyBtn = currentPanel.querySelector('#pr-copy') as HTMLElement;
  const loading = currentPanel.querySelector('#pr-loading') as HTMLElement;
  const output = currentPanel.querySelector('#pr-output') as HTMLTextAreaElement;
  
  // Close functionality
  const closePanel = () => {
    if (currentPanel) {
      currentPanel.remove();
      currentPanel = null;
    }
  };
  
  closeBtn.onclick = closePanel;
  closeBtn2.onclick = closePanel;
  
  // Copy functionality
  copyBtn.onclick = () => {
    if (output.value) {
      navigator.clipboard.writeText(output.value);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
    }
  };
  
  // Start refining
  loading.style.display = 'block';
  output.style.display = 'none';
  
  console.log("Content script: Sending refinePrompt message to background");
  chrome.runtime.sendMessage({ action: 'refinePrompt', text: selectedText });
}

// Listen for response from background—update for ANY message with .text
chrome.runtime.onMessage.addListener((msg) => {
  console.log("Content script: Received message:", msg);

  const panel = document.getElementById('pr-panel');
  if (panel && msg && typeof msg.text === "string") {
    const loading = panel.querySelector('#pr-loading') as HTMLElement;
    const output = panel.querySelector('#pr-output') as HTMLTextAreaElement;
    loading.style.display = 'none';
    output.style.display = 'block';
    output.value = msg.text.trim() || 'No refined prompt received.';
    console.log("Content script: Panel updated successfully with:", output.value);
  } else if (!panel) {
    console.error("Content script: Panel not found when trying to update");
  } else {
    console.log("Content script: Message did not contain .text; not updating panel");
  }
});

function handleSelection(): void {
  setTimeout(() => {
    const editable = getSelectedEditable();
    const selection = window.getSelection();
    if (!editable || !selection || selection.isCollapsed) {
      removeButton();
      return;
    }
    const selectedText = selection.toString();
    if (!selectedText.trim()) {
      removeButton();
      return;
    }
    const rect = getSelectionRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) {
      removeButton();
      return;
    }
    showButton(selectedText, rect);
  }, 0);
}

document.addEventListener('mouseup', handleSelection);
document.addEventListener('keyup', handleSelection);
document.addEventListener('mousedown', (e: MouseEvent) => {
  const btn = document.getElementById('pr-btn');
  if (btn && e.target && !(btn.contains(e.target as Node))) {
    removeButton();
  }
});
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) {
    removeButton();
  }
});

console.log("Content script: Prompt-Refiner content script loaded!");
