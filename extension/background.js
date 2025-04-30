console.log("Background script loaded");

chrome.commands.onCommand.addListener(async (command) => {
  console.log(`Command received: ${command}`);
  
  if (command === "_execute_action") {
    console.log('Command received: Trigger screenshot');
    
    chrome.tabs.captureVisibleTab(null, { format: "png" }, async (dataUrl) => {
      console.log('Screenshot captured, sending data...');
      
      const res = await fetch("http://127.0.0.1:8000/process-image", {
        method: "POST",
        body: JSON.stringify({ image: dataUrl }),
        headers: { "Content-Type": "application/json" }
      });
      const result = await res.json();
      console.log("Response received:", result);  // Log the result from the backend
      chrome.windows.create({
        url: `data:text/html,<h1>${encodeURIComponent(result.answer)}</h1>`,
        type: "popup",
        width: 400,
        height: 300
      });
    });
  }
});
