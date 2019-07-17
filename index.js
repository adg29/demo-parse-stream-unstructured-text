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

const writeJSONDataToFile = (fileToWrite, jsonData) => {
    const jsonToWriteString = JSON.stringify(jsonData, null, 5)
    const fileWritePath = `output/people-data-${fileToWrite}.json`;
    fs.writeFile(fileWritePath, jsonToWriteString, 'utf8', function (err) {
      if (err) {
        throw err
      } else{
        console.log(`Wrote data for ${fileToWrite} to file ${fileWritePath}`)
        console.log(`${jsonToWriteString}`)
      }
    })
}

const parseNameTokenFromLineTokens = (lineTokensToParse) => {
    // console.log(`lineTokensToParse`)
    console.log(lineTokensToParse)
    let nameTokens = []
    if (lineTokensToParse) {
        lineTokensToParse.forEach((tokens, i) => {
            if (tokens.length >= 2 && tokens[0][0] !== ' ') {
                let lastNameSplit = tokens[1].trim().split(" ")
                nameTokens.push({first: tokens[0], last: lastNameSplit[0]})
            }
        })
    }
    return nameTokens
}

function fileStreamParseLines(fileStream, lineParser) {
    return new Promise((resolve, reject) => {
        let fileTokens = [];
        let remaining = '';

        fileStream.on('data', function(data) {
            remaining += data;
            let index = remaining.indexOf('\n');
            while (index > -1) {
              let line = remaining.substring(0, index);
              remaining = remaining.substring(index + 1);
              fileTokens.push(lineParser(line));
              index = remaining.indexOf('\n');
            }
        });

        fileStream.on('end', function() {
            if (remaining.length > 0) {
              fileTokens.push(lineParser(remaining));
            }

            resolve(fileTokens)
        });
    })
}

const parseTokensByLine = (line) => {
    let tokens = line.split(",")
    // console.log(`parseTokensByLine ${tokens.length}`)
    // console.log(tokens)
    return tokens
}

const parseTokensFromFile = (fileToParse) => {
    let fileStream = fs.createReadStream(fileToParse);
    return fileStreamParseLines(fileStream, parseTokensByLine);
}

const readFileAndParseNames = (file) => {
    return new Promise(async (resolve, reject) => {
        let lineTokensFromFile = await parseTokensFromFile(file)
        console.log(`readAndParseNamesData found n lines: ${lineTokensFromFile.length}`)
        const nameTokensFromLines = parseNameTokenFromLineTokens(lineTokensFromFile)
        console.log(nameTokensFromLines)
        console.log(`parsed ${nameTokensFromLines.length} names`)
        if (nameTokensFromLines.length > 0)
            resolve(nameTokensFromLines)
        else
            reject(new Error(`Zero last names found in ${file}`))
    })
}

const groupByLastName = (allNames) => {
    const lastNamesTable = {}
    allNames.forEach(fullName => {
        if (lastNamesTable[fullName.last]) {
            if(lastNamesTable[fullName.last][fullName.first])
                lastNamesTable[fullName.last][fullName.first]++
            else
                lastNamesTable[fullName.last][fullName.first] = 1
        } else {
            lastNamesTable[fullName.last] = {}
            lastNamesTable[fullName.last][fullName.first] = 1
        }
    }) 
    console.log(`groupByLastName lastNames count ${Object.keys(lastNamesTable).length}`)
    return lastNamesTable;
}

const countUniqueFullNames = (lastNamesTable) => {
    const lastNameValues = Object.values(lastNamesTable)
    if (lastNameValues && lastNameValues.length > 0)
        return lastNameValues.map(firstNamesList => Object.keys(firstNamesList).length).reduce((accumulator, currentValue) => accumulator + currentValue)
    else 
        return null

}

const main = async() => {
    try {
        const parsedNames = await readFileAndParseNames(fileToRead)
        const lastNamesTable = groupByLastName(parsedNames)
        const namesFullCountUnique = countUniqueFullNames(lastNamesTable)
        writeJSONDataToFile(fileToRead, {...DATA_TO_EXTRAPOLATE, 
            names_full_count_unique: namesFullCountUnique
        })
    } catch (e) {
        console.error('Caught error')
        console.log(e)
        return
    }

}

main()
