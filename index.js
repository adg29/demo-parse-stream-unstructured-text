const DATA_TO_EXTRAPOLATE = {
    names_full_count_unique: null,
    names_last_common: null,
    names_first_common: null,
    names_modified: null
}

let fileToRead = 'coding-test-data.txt'
let indexArgs = process.argv.slice(2)
if (indexArgs.length >=1) {
    const txtFileInput = indexArgs.find(arg => arg.indexOf('.txt') >= 1)
    if (txtFileInput) {
        fileToRead = txtFileInput
    }
    else throw new Error(`Expected input .txt file e.g. *.txt`)
}

const fs = require('fs')

const tconsole = (tstring) => {
    console.log(`${tstring}`)
}

const writeJSONDataToFile = ({fileToWrite, jsonData}) => {
    const jsonToWriteString = JSON.stringify(jsonData, null, 5)
    fs.writeFile(`output/people-data-${fileToWrite}.json`, jsonToWriteString, 'utf8', function (err) {
      if (err) {
        throw err
      } else{
        console.log(`Wrote data for ${fileToWrite}`)
        console.log(`${jsonToWriteString}`)
      }
    })
}

const getDataFromNameTokens = (nameTokens) => {
    tconsole(nameTokens)
    nameTokens.map(t => t.trim)
    tconsole(nameTokens)
    writeJSONDataToFile(...DATA_TO_EXTRAPOLATE)
}

function fileStreamReadLines(fileStream, parser) {
  var remaining = '';

  fileStream.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      parser(line);
      index = remaining.indexOf('\n');
    }
  });

  fileStream.on('end', function() {
    if (remaining.length > 0) {
      parser(remaining);
    }
  });
}

const parseTokensFromLine = (line) => {
    let tokens = line.split(" ")
    tconsole(`parseTokensFromLine ${tokens}`)
}

const parseTokensFromFile = (fileToParse) => {
    let fileStream = fs.createReadStream(fileToParse);
    fileStreamReadLines(fileStream, parseTokensFromLine);
}

parseTokensFromFile(fileToRead)
