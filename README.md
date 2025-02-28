# D&D Beyond Monster Scraper

This Firefox / Chrome extension scrapes the stat block for a monster on DnD Beyond and creates a `.json` file for further use. Specifically formatted for the Monstrous Initiative Tracker which you can find [here](#). TODO: Add link to github repo for Monstrous Initiative Tracker.

## Contents

- [Installation](#installation)
    - [Local Firefox Instructions](#local-firefox-instructions)
    - [Local Chrome Instructions](#local-chrome-instructions)
- [Usage](#usage)
    - [Using the Extension for Single Monsters](#using-the-extension-for-single-monsters)
    - [Using the Extension for Multiple Monsters](#using-the-extension-for-multiple-monsters)
- [Limitations](#limitations)
- [Disclaimers](#disclaimers)
- [Acknowledgements](#acknowledgements)
- [Contributing](#contributing)

## Installation

### Local Firefox Instructions

Clone this repo and navigate to `about:debugging` in the browser. Choose 'This Firefox' from the sidebar and select 'Load Temporary Add-on...'

Navigate to the repo and choose `manifest.json`. The extension should now be loaded for this session of firefox.

Alternately, go to `about:config` in the browser and set `xpinstall.signatures.required` to `false`. Then navigate to `about:addons` and drag and drop the most recent `.zip` file version in `web-ext-artifacts` into that tab. This will permanently add the extension until you remove it.

### Local Chrome Instructions

Clone this repo and navigate to `/chrome://extensions` in the browser. In the upper right turn on `Developer mode`.

Click `Load unpacked` and navigate to the repo, choosing the entire folder. The extension should now be loaded for this session of chrome.

## Usage

### Using the Extension for Single Monsters

Navigate to the monster page of your choice on [D&D Beyond](https://www.dndbeyond.com/) and press the `z` button. This should automatically prompt you to download a `.json` file for the monster you've chosen.

TODO: Gif to show download of a single page

### Using the Extension for Multiple Monsters

Use the search tool on [D&D Beyond](https://www.dndbeyond.com/) to find a group of monsters that you would like to add (for example try Beholder).

You may open all monster stat blocks with the `x` key. Afterwards you may mass download monster stat blocks with the `z` key. If you have multiple pages then you may navigate forwards with the `n` key and backwards with the `b` key.

TODO: Gif to show download of a multiple page

## Limitations

This scraper has been tested on most monster stat blocks however it will not work perfectly with more complex blocks and specifically certain legendary monsters or monsters with difficult to parse spell usage. Expect the occasional incomplete or inaccurate information.

This scraper has been designed for monsters from the 2014 Monster Manual and has not been updated for the 2024 Monster Manual.

## Disclaimers

D&D Beyond has been built in such a way to discourage scraping. In fact the reason this tool was built was because their protection against other scraping tools required a workaround. Mass scraping large numbers of monsters can cause you to be blocked from the website for a time.

In order to scrape monsters, you will still require a D&D Beyond account and access to the monster stat blocks you desire to scrape. The maker of this tool does not condone stealing proprietary information you should not have access to.

## Acknowledgements

Shout out to the hard working people who put so much time and energy into the D&D Beyond website and the Dungeons and Dragons team at WotC who has spent years expanding and improving the game.

## Contributing

Check out our `CONTRIBUTING.md`. For issues please remember to be kind and follow what you'd expect from general community guidelines.