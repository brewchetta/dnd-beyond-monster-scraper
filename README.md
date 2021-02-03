## Touch of Invisibility

Scrapes the stat block for a monster on DnD Beyond and creates a file for it. Used because doing this by hand is hard work and webpage has protections against ruby scrapers.

### Firefox Instructions

Clone this repo and navigate to `about:debugging` in the browser. Choose 'This Firefox' from the sidebar and select 'Load Temporary Add-on...'

Navigate to the repo and choose `manifest.json`. The extension should now be loaded for this session of firefox.

Alternately, go to `about:config` in the browser and set `xpinstall.signatures.required` to `false`. Then navigate to `about:addons` and drag and drop the most recent `.zip` file version in `web-ext-artifacts` into that tab. This will permanently add the extension until you remove it.

### Chrome Instructions

Clone this repo and navigate to `/chrome://extensions` in the browser. In the upper right turn on `Developer mode`.

Click `Load unpacked` and navigate to the repo, choosing the entire folder. The extension should now be loaded for this session of chrome.

### Using the Extension
