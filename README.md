# ptv_scraper
This will generate an m3u8 playlist and xmltv file for pluto TV.

## Configuring
edit the config.json file to provide an output directory for the m3u8 and xml file

## Building
npm install

## Running
node ./index.js

## Regional settings
Pluto TV utilises geo location to determine what channels to load. By default, this script will load the UK and US regions. To change (or add other regions), edit the index.js and add an appropriate IP address.
