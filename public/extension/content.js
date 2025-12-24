// FocusDock Content Script

let sidebarInjected = false;
let sidebarVisible = false;
let sidebarFrame = null;

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'toggleSidebar') {
    toggleSidebar();
    sendResponse({ success: true });
  }
  return true;
});

function toggleSidebar() {
  if (!sidebarInjected) {
    injectSidebar();
    sidebarInjected = true;
    sidebarVisible = true;
  } else {
    sidebarVisible = !sidebarVisible;
    if (sidebarFrame) {
      sidebarFrame.style.transform = sidebarVisible ? 'translateX(0)' : 'translateX(100%)';
    }
  }
}

function injectSidebar() {
  // Create sidebar container
  const container = document.createElement('div');
  container.id = 'focusdock-container';
  container.innerHTML = `
    <style>
      #focusdock-container {
        position: fixed;
        top: 0;
        right: 0;
        width: 360px;
        height: 100vh;
        z-index: 2147483647;
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;
      }
      #focusdock-frame {
        width: 100%;
        height: 100%;
        border: none;
        background: white;
      }
    </style>
    <iframe id="focusdock-frame" src="${chrome.runtime.getURL('sidebar.html')}"></iframe>
  `;
  
  document.body.appendChild(container);
  sidebarFrame = container;
}

// Extract page content for summarization/keyword extraction
function extractPageContent() {
  const article = document.querySelector('article');
  const main = document.querySelector('main');
  const body = document.body;
  
  let content = '';
  
  if (article) {
    content = article.innerText;
  } else if (main) {
    content = main.innerText;
  } else {
    const elements = body.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    content = Array.from(elements)
      .map(el => el.innerText)
      .join('\n');
  }
  
  return content.replace(/\s+/g, ' ').replace(/\n+/g, '\n').trim();
}

// Listen for requests from sidebar iframe
window.addEventListener('message', (event) => {
  if (event.data.type === 'focusdock-request') {
    switch (event.data.action) {
      case 'getPageContent':
        event.source.postMessage({
          type: 'focusdock-response',
          action: 'pageContent',
          data: extractPageContent()
        }, '*');
        break;
      case 'getPageInfo':
        event.source.postMessage({
          type: 'focusdock-response',
          action: 'pageInfo',
          data: {
            title: document.title,
            url: window.location.href,
            favicon: document.querySelector("link[rel~='icon']")?.href || `${window.location.origin}/favicon.ico`
          }
        }, '*');
        break;
      case 'closeSidebar':
        sidebarVisible = false;
        if (sidebarFrame) {
          sidebarFrame.style.transform = 'translateX(100%)';
        }
        break;
    }
  }
});

console.log('FocusDock content script loaded');
