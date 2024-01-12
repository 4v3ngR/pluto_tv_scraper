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
Note: before running `npm install` you need to `cd` to the `pluto_tv_scraper` directory (the directory with this `README.md` file in it.
```
npm install
```

## Installation
Note: before running `npm install -g .` you need to `cd` to the `pluto_tv_scraper` directory (the directory with this `README.md` file in it.
This can be installed globally using the following command:
```
npm install -g .
```
Installing will create a command called `plutotv-scraper` that can be executed on the command line.
Note: take notice of the final `.` (indicating to npm to globall install the current package, and not globally install the dependencies)

## Running
Note: before running `node ./index.js` you need to `cd` to the `pluto_tv_scraper` directory (the directory with this `README.md` file in it.
```
node ./index.js
```

OR running globally
Note: if installed globally, there's no need to `cd` to the `pluto_tv_scraper` directory. As long as your system (npm) is set up correctly, the `plutotv-scraper` command will be found within the `PATH`
```
plutotv-scraper --help
```

## Notes for Windows users
- Download and install nodejs from https://nodejs.org/en/download/ and install it
- Checkout the source code for for the pluto_tv_scraper
- Open cmd.exe
- cd to the pluto_tv_scraper directory
- install the dependencies with `npm install`
- run the script with `node ./index.js`
- to get some help, run `node ./index.js --help`
