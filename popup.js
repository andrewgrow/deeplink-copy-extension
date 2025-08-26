// ./popup.js

(async () => {
    const toggleBtn = document.getElementById('toggle');
    const statusEl = document.getElementById('status');
    const hintEl = document.getElementById('hint');

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.url) {
        statusEl.textContent = 'No active tab';
        toggleBtn.disabled = true;
        return;
    }

    const url = new URL(tab.url);
    const origin = url.origin; // e.g. https://staging.example.com

    const { origins = [] } = await chrome.storage.sync.get('origins');
    const enabled = origins.includes(origin);

    render(enabled);

    toggleBtn.onclick = async () => {
        if (!enabled) {
            // Request access to this origin.
            const granted = await chrome.permissions.request({ origins: [origin + '/*'] });
            if (!granted) return;

            // Register the content script.
            await chrome.scripting.registerContentScripts([{
                id: idForOrigin(origin),
                js: ['content.js'],
                matches: [origin + '/*'],
                runAt: 'document_idle',
                persistAcrossSessions: true
            }]);

            // Save to the allow-list.
            const updated = [...new Set([...(await getOrigins()), origin])];
            await chrome.storage.sync.set({ origins: updated });

            // Inject content.js now.
            await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });

            render(true);
        } else {
            // Disable for this origin.
            try { await chrome.scripting.unregisterContentScripts({ ids: [idForOrigin(origin)] }); } catch {}
            try { await chrome.permissions.remove({ origins: [origin + '/*'] }); } catch {}
            const updated = (await getOrigins()).filter(o => o !== origin);
            await chrome.storage.sync.set({ origins: updated });
            render(false);
        }
    };

    function render(isEnabled) {
        toggleBtn.textContent = isEnabled ? 'Disable on this site' : 'Enable on this site';
        statusEl.textContent = `${isEnabled ? 'Enabled' : 'Disabled'} for ${origin}`;
        hintEl.textContent = isEnabled
            ? 'Elements with .popover-hoverable become clickable and copy the URL.'
            : 'Click “Enable on this site” to activate here.';
    }


    function idForOrigin(origin) {
        return 'dlc_' + new URL(origin).host.replace(/\./g, '_');
    }

    async function getOrigins() {
        const { origins = [] } = await chrome.storage.sync.get('origins');
        return origins;
    }
})();