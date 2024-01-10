# ptv_scraper
This will generate an m3u8 playlist and xmltv file for pluto TV.

## Configuring
configuration is read from config.json in the current working directory

#### the output directory
edit the config.json file to provide an output directory for the m3u8 and xml file
#### the client ID
edit the config.json file and provide a new (unique) UUID

## Building
npm install

## Running
node ./index.js

## Regional settings
Pluto TV utilises geo location to determine what channels to load. By default, this script will load the UK and US regions. To change (or add other regions), edit the index.js and add an appropriate IP address.
