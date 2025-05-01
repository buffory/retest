// content.js
document.addEventListener("keydown", (e) => {
    if (e.key === "]") { // Change this to any key you want
      chrome.runtime.sendMessage({ action: "triggerScreenshot" });
    }
        if (e.key === "`") {
            const current = document.getElementById('injected')
            if (current) {
                current.remove()
            }
        }
  });
  