# ptv_scraper
This will generate an m3u8 playlist and xmltv file for pluto TV.

## Configuring
configuration is read from config.json in the current working directory

#### the output directory
edit the config.json file to provide an output directory for the m3u8 and xml file
#### the client ID
edit the config.json file and provide a new (unique) UUID
#### the regional mapping
edit the config.json file and provide a region key and a geo located IP address to automatically generate an m3u8 and xml file for that region

## Building
npm install

## Running
node ./index.js

## Regional settings
(moved to the Configuring section above)
Pluto TV utilises geo location to determine what channels to load. By default, this script will load the UK and US regions. Edit the config.json to provide additional regions
