document.getElementById("screenshot").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "triggerScreenshot" });
  });
  