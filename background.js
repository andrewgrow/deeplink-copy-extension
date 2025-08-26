// ./background.js

// On install/startup, restore registrations for saved origins.
chrome.runtime.onInstalled.addListener(async () => {
    const { origins = [] } = await chrome.storage.sync.get('origins');
    await reregisterAll(origins);
});

chrome.runtime.onStartup.addListener(async () => {
    const { origins = [] } = await chrome.storage.sync.get('origins');
    await reregisterAll(origins);
});

async function reregisterAll(origins) {
    // Unregister any previously registered content scripts with our prefix.
    const existing = await chrome.scripting.getRegisteredContentScripts();
    const stale = existing
        .filter(s => s.id.startsWith('dlc_'))
        .map(s => s.id);
    if (stale.length) {
        try { await chrome.scripting.unregisterContentScripts({ ids: stale }); } catch {}
    }

    for (const origin of origins) {
        const id = idForOrigin(origin);
        try {
            await chrome.scripting.registerContentScripts([{
                id,
                js: ['content.js'],
                matches: [origin + '/*'],
                runAt: 'document_idle',
                persistAcrossSessions: true
            }]);
        } catch (e) {
            // Skip if permission for the origin is missing.
            console.debug('Register failed for', origin, e);
        }
    }
}

function idForOrigin(origin) {
    // "https://example.com" -> "dlc_example_com"
    try { return 'dlc_' + new URL(origin).host.replace(/\./g, '_'); }
    catch { return 'dlc_fallback'; }
}