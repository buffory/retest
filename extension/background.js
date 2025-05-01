chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    console.log("Hotkey triggered: Ctrl+Shift+G");
    // Trigger any action you need, e.g., show a message or process something
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "triggerScreenshot") {
    console.log("Received message to trigger screenshot");

    chrome.tabs.captureVisibleTab(null, { format: "png" }, async (dataUrl) => {
      if (!dataUrl) {
        console.error("Screenshot failed");
        return;
      }

      try {
        const res = await fetch("https://ghost-tester-a8265efa9b4b.herokuapp.com/process-image", {
          method: "POST",
          body: JSON.stringify({ image: dataUrl }),
          headers: { "Content-Type": "application/json" }
        });
        
        const result = await res.json();

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const tabId = tabs[0].id;
          
          // Inject the grabAndPrintElements function into the active tab
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            function: injectDiv,
            args: [result.answer] // Function to inject and run
          });
        });
        
      } catch (e) {
        console.error("Error sending image to backend:", e);
      }
    });
  }
});

// Function to inject the answer into the page
function injectDiv(answer) {
  let div = document.getElementById('injected')
  if (!div) {
    // If the div doesn't exist, create it
    div = document.createElement('div');
    div.id = "injected";
    div.style.position = "fixed";
    div.style.top = "0";
    div.style.left = "33%";
    div.style.background = "transparent";
    div.style.color = "#f9f1f1"
    div.style.padding = "20px";
    div.style.border =  "none";
    div.style.zIndex = "9999";
    div.style.maxWidth = "400px";
    div.style.maxHeight = "100px";
    div.style.height = "100px";
    div.style.overflowY = "auto";
    div.innerText = answer
  }

  if (!document.body.contains(div)) {
    document.body.appendChild(div);
  } else {
    document.body.appendChild(div)
  }  
}
