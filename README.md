# pluto_tv_scraper
This will generate an m3u8 playlist and xmltv file for pluto TV.

## Supported node versions
Only node 16 and above is supported. This script may run with other versions, but it may not.

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

## Installation from npmjs
```
npm install -g plutotv-scraper
```

## Installation from source
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

### Commandline options:
```
  Options:
    --config <configfile>    : Provide the location to the configuration file
    --mapping <region,IP>    : Provide a region and IP address to process instead of the mapping
    --outdir <outdir>        : Provide the destination directory
    --clientid <clientid>    : Provide a client id
    --all                    : Merge all regions into a single playlist and epg
    --group [genre|country]  : Specify the grouping within the playlist (default is "genre")
    --regionalize            : append the country code to the channel id
    --exclude-groups <regex> : exclude the groups that match the regular expression
    --help                   : Display this help
```

### Regular expression exclusions of groups
The `--exclude-groups` option utilizes regular expression matching to determine what groups should be excluded. Some examples of regular expressions:

`Note: do take note of the single quotes, they're required to ensure the shell does not do any expansion of wildcards`

#### Excluding a single group (exact matching)
```
--exclude-groups '^Local News$'
```
This regular expression will remove all the channels that are in the group 'Local News'.

#### Excluding all groups with a word in it (partial matching)
```
--exclude-groups 'Español'
```
This regular expression will remove all the channels that are in groups with 'Español' in the name.

#### Excluding multiple groups (exact matching)
```
--exclude-groups '^(Local News|En Español)$'
```
This regular expression will remove all the channels that are in the groups 'Local News' or 'En Español'.

#### Excluding multiple groups (partital matching)
```
--exclude-groups '(News|Español)'
```
This regular expression will remove all the channels that are in groups with 'News' or 'Español' in the name.

#### Further reading
Mozilla developer documents provide good documentation on regular expressions in javascript. The document can be found here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions

## Notes for Windows users
- Download and install nodejs from https://nodejs.org/en/download/ and install it
- Checkout the source code for for the pluto_tv_scraper
- Open cmd.exe
- cd to the pluto_tv_scraper directory
- install the dependencies with `npm install`
- run the script with `node ./index.js`
- to get some help, run `node ./index.js --help`
