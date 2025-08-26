# Deeplink Copy Extension

##### A small Chrome extension that turns .popover-hoverable elements into clickable links and copies the value of their popover-text or uib-popover attribute to the clipboard.

### Download the ZIP

Click this project deeplink-copy-extension-master.zip

### Install as an unpacked extension (development mode)

	1.	Open chrome://extensions/ in Chrome.
	2.	Turn on Developer mode (top-right toggle).
	3.	Click Load unpacked and select the unzipped folder (the one containing manifest.json).
	4.	The extension will appear in the list. Optionally pin it to the toolbar.

| This extension is intended to run in development mode. It does not auto-update when the folder changes—after edits, click Reload on chrome://extensions/.

### Enable on a site (opt-in per origin)

The extension is disabled everywhere by default. To enable it on a specific site/origin:
1.	Navigate to the target page (e.g., your staging site).
2.	Click the extension icon in the toolbar to open the popup.
3.	Click Enable on this site.
    •	Chrome will ask for permission to run on this origin only; approve it.
    •	The content script will be injected immediately and registered for future visits to this origin.

To turn it off on the current origin, open the popup again and click Disable on this site.

### How it works

	•	The content script looks for elements matching `div.popover-hoverable[popover-text] or div.popover-hoverable[uib-popover]`.
•	It styles them like links (underline, pointer cursor) without changing the DOM structure.
•	Clicking such an element copies the URL from popover-text (fallback: uib-popover) to the clipboard.
•	A small “Copied” toast confirms the action.
•	Dynamic content is supported via a MutationObserver (elements added later are enhanced automatically).
•	Keyboard: Enter or Space on a focused element also triggers copy.

### File structure

deeplink-copy-extension/
├─ manifest.json
├─ background.js
├─ content.js
├─ popup.html
└─ popup.js

##### Permissions, briefly:
•	scripting, activeTab, tabs — injection/registration of content scripts.
•	storage — save the per-origin allow-list.
•	clipboardWrite — copy to clipboard.
•	optional_host_permissions: <all_urls> — requested only when you enable a site in the popup.

No network requests are made; no data is collected or sent.

### Update / Reload

	•	If you change files locally, go to chrome://extensions/ and click Reload on the extension card.
	•	If you downloaded a new ZIP, remove the old unpacked extension and Load unpacked again with the new folder.

### Uninstall / Disable

	•	To stop it on a single origin: use the popup → Disable on this site.
	•	To remove the extension entirely: chrome://extensions/ → Remove.

### Troubleshooting

	•	The icon is not visible. Pin it: click the puzzle icon in the toolbar → pin the extension.
	•	“Enable on this site” doesn’t appear or is disabled. Chrome extensions cannot run on special pages (e.g., chrome://, chromewebstore.google.com) or some internal views. Open a regular HTTP/HTTPS page.
	•	Copy doesn’t work. Ensure the page has a popover-text or uib-popover attribute with a value. The extension shows a toast only after a successful copy. If the site blocks clipboard access, the extension uses a fallback mechanism (execCommand('copy')).
	•	Dynamic table rows aren’t clickable. The script listens for DOM changes. If elements still don’t react, try reloading the page after enabling the site.

### Run in your Chrome profile

All steps above apply to your current Chrome profile. If you use multiple profiles, repeat the Load unpacked step for each profile where you want the extension available.