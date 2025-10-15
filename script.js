document.addEventListener('DOMContentLoaded', function () {
    const target = document.getElementById('title');
    const errorEl = document.getElementById('error');
    try {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (chrome.runtime && chrome.runtime.lastError) {
                if (errorEl) errorEl.textContent = chrome.runtime.lastError.message;
                if (target) target.textContent = '(no title)';
                return;
            }

            const activeTab = tabs && tabs.length > 0 ? tabs[0] : null;
            if (!activeTab) {
                if (target) target.textContent = '(no title)';
                return;
            }

            const tabTitle = activeTab.title || '';
            if (tabTitle) {
                if (target) target.textContent = tabTitle;
                return;
            }

            if (chrome.scripting && activeTab.id != null) {
                chrome.scripting.executeScript(
                    {
                        target: { tabId: activeTab.id },
                        func: () => document.title
                    },
                    (results) => {
                        if (chrome.runtime && chrome.runtime.lastError) {
                            if (errorEl) errorEl.textContent = chrome.runtime.lastError.message;
                        }
                        const resultTitle = results && results[0] ? (results[0].result || '') : '';
                        if (target) target.textContent = resultTitle || '(no title)';
                    }
                );
            } else {
                if (target) target.textContent = '(no title)';
            }
        });
    } catch (e) {
        if (errorEl) errorEl.textContent = e && e.message ? e.message : String(e);
        if (target) target.textContent = '(no title)';
    }
});