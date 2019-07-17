let fileToParse = 'coding-test-data.txt'
let indexArgs = process.argv.slice(2)
if (indexArgs.length >=1) {
    const txtFileInput = indexArgs.find(arg => arg.indexOf('.txt') >= 1)
    if (txtFileInput) fileToParse = txtFileInput
    else throw new Error(`Expected input .txt file e.g. *.txt`)
}

let dataToWrite;
const fs = require('fs')

let jsonToWrite = {
    names_full_count_unique: null,
    names_last_common: null,
    names_first_common: null,
    names_modified: null
}

const jsonToWriteString = JSON.stringify(jsonToWrite, null, 5)
fs.writeFile(`output/people-data-${fileToParse}.json`, jsonToWriteString, 'utf8', function (err) {
  if (err) {
    throw err
  } else{
    console.log(`Wrote data for ${fileToParse}`)
    console.log(`${jsonToWriteString}`)
  }
})
