const DarkModeDisable = 0;
const DarkModeEnable  = 1;
const DarkModeToggle  = 2;

function setDarkMode(val) {
    // This functions needs a local copy of these constants, otherwise we
    // can't see them when injected via executeScript() :/
    const DarkModeDisable = 0;
    const DarkModeEnable  = 1;
    const DarkModeToggle  = 2;
    
    // select the element that simulates the dark mode dynamically
    let darkDiv = document.getElementById('darkDiv');
    let darkDiv2 = document.getElementById('darkDiv2');
    
    if ((val===DarkModeEnable || val===DarkModeToggle) && !darkDiv) {
        let div = document.createElement('div');
        div.id = 'darkDiv';
        let css = `position: fixed;
                    pointer-events: none;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: #FFFFFF;
                    mix-blend-mode: difference;
                    z-index: 1;`;
        div.setAttribute('style', css);
        document.body.appendChild(div);
        
        var div2 = document.createElement('div');
        div2.id = 'darkDiv2';
        let css2 = `position: fixed;
                    pointer-events: none;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background-color: #444444;
                    mix-blend-mode: multiply;
                    z-index: 2;`;
        div2.setAttribute('style', css2);
        document.body.appendChild(div2);
    
    } else if ((val===DarkModeDisable || val===DarkModeToggle) && darkDiv) {
        darkDiv.remove();
        darkDiv2.remove();
    }
}

function removeToolbar() {
    if (window.location.hash !== "#toolbar=0") {
        window.location.hash = "#toolbar=0";
        window.location.reload();
    }
}

async function getCurrentTabId() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab.id;
}

function setDarkModeForTabId(tabId, val) {
    chrome.scripting.executeScript({
        target: { tabId },
        func: setDarkMode,
        args: [ val ],
    });
}

function removeToolbarForTabId(tabId) {
    chrome.scripting.executeScript({
        target: { tabId },
        func: removeToolbar,
    });
}

async function keyChordTriggered(cmd) {
    if (cmd === 'run-dark-mode') {
        // Toggle dark mode
        setDarkModeForTabId(await getCurrentTabId(), DarkModeToggle);
    }
};

// function tabActivated(info) {
//     chrome.tabs.get(info.tabId, function (tab) {
//         let url = new URL(tab.url);
//         let extension = url.pathname.split('.').pop();
//         if (extension === 'pdf') {
//             removeToolbarForTabId(info.tabId);
//             setDarkModeForTabId(info.tabId, DarkModeEnable);
//         }
//     });
// };

function tabUpdated(tabId, changeInfo, tab) {
    // Enable dark mode for PDFs
    let url = new URL(tab.url);
    let ext = url.pathname.split('.').pop();
    if (ext === 'pdf') {
        removeToolbarForTabId(tabId);
        setDarkModeForTabId(tabId, DarkModeEnable);
    }
};

function buttonClicked(tab) {
    // Toggle dark mode
    setDarkModeForTabId(tab.id, DarkModeToggle);
};

chrome.commands.onCommand.addListener(keyChordTriggered);
chrome.tabs.onUpdated.addListener(tabUpdated);
// Disabling onActivated handler because it re-enables dark mode when switching back to a tab,
// after the user may have previously disabled dark mode on that tab.
// chrome.tabs.onActivated.addListener(tabActivated);
chrome.action.onClicked.addListener(buttonClicked);
