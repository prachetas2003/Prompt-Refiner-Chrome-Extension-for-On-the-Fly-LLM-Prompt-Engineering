(function(){function p(){const e=document.createElement("div");e.id="pr-panel",e.className="pr-panel",e.style.cssText=`
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
  `,e.innerHTML=`
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
  `;const t=document.createElement("style");return t.textContent=`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,document.head.appendChild(t),e}function a(e){return e?!!(e.tagName==="TEXTAREA"||e.tagName==="INPUT"||e.isContentEditable):!1}function u(){const e=window.getSelection();if(!e||e.isCollapsed)return null;const t=e.anchorNode;if(!t)return null;let n=t.nodeType===1?t:t.parentElement;for(;n&&n!==document.body;){if(a(n))return n;n=n.parentElement}return null}function g(){const e=window.getSelection();if(!e||!e.rangeCount)return null;const t=e.getRangeAt(0).cloneRange();return t.collapsed?null:t.getBoundingClientRect()}function r(){const e=document.getElementById("pr-btn");e&&e.remove()}function f(e,t){r();const n=document.createElement("div");n.id="pr-btn",n.className="bg-green-500 text-white rounded-full px-3 py-1 shadow fixed z-50 cursor-pointer select-none transition-opacity duration-200",n.textContent="Modify",n.style.cssText=`
    position: fixed;
    top: ${window.scrollY+t.bottom+6}px;
    left: ${window.scrollX+t.left}px;
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
  `,n.onclick=()=>{x(e),r()},document.body.appendChild(n)}let o=null;function x(e){console.log("Content script: Showing panel with text:",e),o&&o.remove(),o=p(),document.body.appendChild(o),o.style.display="block";const t=o.querySelector("#pr-close"),n=o.querySelector("#pr-close-btn"),i=o.querySelector("#pr-copy"),c=o.querySelector("#pr-loading"),l=o.querySelector("#pr-output"),d=()=>{o&&(o.remove(),o=null)};t.onclick=d,n.onclick=d,i.onclick=()=>{l.value&&(navigator.clipboard.writeText(l.value),i.textContent="Copied!",setTimeout(()=>{i.textContent="Copy"},2e3))},c.style.display="block",l.style.display="none",console.log("Content script: Sending refinePrompt message to background"),chrome.runtime.sendMessage({action:"refinePrompt",text:e})}chrome.runtime.onMessage.addListener(e=>{console.log("Content script: Received message:",e);const t=document.getElementById("pr-panel");if(t&&e&&typeof e.text=="string"){const n=t.querySelector("#pr-loading"),i=t.querySelector("#pr-output");n.style.display="none",i.style.display="block",i.value=e.text.trim()||"No refined prompt received.",console.log("Content script: Panel updated successfully with:",i.value)}else t?console.log("Content script: Message did not contain .text; not updating panel"):console.error("Content script: Panel not found when trying to update")});function s(){setTimeout(()=>{const e=u(),t=window.getSelection();if(!e||!t||t.isCollapsed){r();return}const n=t.toString();if(!n.trim()){r();return}const i=g();if(!i||i.width===0&&i.height===0){r();return}f(n,i)},0)}document.addEventListener("mouseup",s);document.addEventListener("keyup",s);document.addEventListener("mousedown",e=>{const t=document.getElementById("pr-btn");t&&e.target&&!t.contains(e.target)&&r()});document.addEventListener("selectionchange",()=>{const e=window.getSelection();(!e||e.isCollapsed)&&r()});console.log("Content script: Prompt-Refiner content script loaded!");
})()
