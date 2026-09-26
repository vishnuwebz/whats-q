document.getElementById('grab-btn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.url && tab.url.includes('web.whatsapp.com')) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        if (typeof window.openWhatsQGrabberOverlay === 'function') {
          window.openWhatsQGrabberOverlay();
        } else {
          alert('Please refresh WhatsApp Web tab once to activate QBS-360 Grabber!');
        }
      }
    });
    window.close();
  } else {
    chrome.tabs.create({ url: 'https://web.whatsapp.com' });
  }
});
