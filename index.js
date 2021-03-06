const DATA_TO_EXTRAPOLATE = {
    names_full_count_unique: null,
    names_last_common: null,
    names_first_common: null,
    names_modified: null
}

const ERRORS = {
    INPUT: new Error(`Expected input .txt file e.g. *.txt`)
}

const DEFAULTS = {
    TOP_N_NAMES: 10,
    MODIFY_N_NAMES: 25
}

const fs = require('fs')

const processArgs = () => {
    let fileToRead = 'coding-test-data.txt'
    let indexArgs = process.argv.slice(2)
    if (indexArgs.length >=1) {
        const txtFileInput = indexArgs.find(arg => arg.indexOf('.txt') >= 1)
        if (txtFileInput) {
            fileToRead = txtFileInput
        }
        else throw ERRORS.INPUT

        return fileToRead
    } else {
        throw ERRORS.INPUT
    }
}

const writeJSONDataToFile = (fileToWrite, jsonData) => {
    const jsonToWriteString = JSON.stringify(jsonData, null, 5)
    const fileWritePath = `results-people-data-${fileToWrite}.json`
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
    // console.log(lineTokensToParse)
    let nameTokens = []
    if (lineTokensToParse) {
        lineTokensToParse.forEach((tokens, i) => {
            if (tokens.length >= 2 && tokens[0][0] !== ' ') {
                let firstNameSplit = tokens[1].trim().split(" ")
                nameTokens.push({last: tokens[0], first: firstNameSplit[0]})
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
        console.log(`lines count ${lineTokensFromFile.length}`)
        const nameTokensFromLines = parseNameTokenFromLineTokens(lineTokensFromFile)
        // console.log(nameTokensFromLines)
        console.log(`{first, last} objects count ${nameTokensFromLines.length}`)
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
    console.log(`lastNames unique count ${Object.keys(lastNamesTable).length}`)
    return lastNamesTable;
}

const countUniqueFullNames = (lastNameBins) => {
    if (lastNameBins && lastNameBins.length > 0)
        return lastNameBins
            .map(firstNamesList => Object.keys(firstNamesList).length)
            .reduce((accumulator, currentValue) => accumulator + currentValue)
    else 
        return null

}

const calculateNameOccurenceRank = (nameBins, nameKey) => {
    switch (nameKey) {
        case 'first': 
            let firstNameOccurences = {}
            Object.entries(nameBins)
                .forEach(lastNameBin => {
                    Object.entries(lastNameBin[1]).forEach((firstNameEntry) => {
                        if (firstNameOccurences[firstNameEntry[0]])
                            firstNameOccurences[firstNameEntry[0]] += firstNameEntry[1]
                        else
                            firstNameOccurences[firstNameEntry[0]] = firstNameEntry[1]
                    })
                })

            return Object.entries(firstNameOccurences).map(entry => ({name: entry[0], occurences: entry[1]}))
        case 'last':
            return Object.entries(nameBins)
                .map(lastNameBin => {
                    let nameStats = {}
                    nameStats.last = lastNameBin[0]
                    nameStats.occurences = Object.values(lastNameBin[1]).reduce((accumulator, currentValue) => accumulator + currentValue)
                    return nameStats
                })
            break;
    }
}

const occurencesComparator = (a, b) => {
    return b.occurences - a.occurences
}

const filterNames = (lastNameBins) => {
    let uniqueFirstNames = []
    let namesSubset = Object.entries(lastNameBins)
        .map(lastNameBin => {
            let nameUnique = {}
            nameUnique.last = lastNameBin[0]

            let lastNameFirstNameEntries = Object.entries(lastNameBin[1])
            let lastNameFirstNameUnique = lastNameFirstNameEntries.find(entry => {
                return !uniqueFirstNames.includes(entry[0])
            })
            if (lastNameFirstNameUnique) {
                nameUnique.first = lastNameFirstNameUnique[0]
                uniqueFirstNames.push(nameUnique.first)
                return nameUnique
            } else {
                return null
            }
        })
    namesSubset.length = DEFAULTS.MODIFY_N_NAMES
    return namesSubset.filter(name => name)
}

const remixNames = (namesList) => {
    //init remix set array to build recursively
    let remixedSet = []
    //init set for first names
    let firstNamesSet = namesList.map(n => n.first)

    //loop over last names
    let namesListPointer = 0
    let namesInitialSet = namesList.map(name => `${name.last}, ${name.first}`)
    while (remixedSet.length < namesList.length) {
    let name = namesList[namesListPointer]
        let lastNamePart = name.last
        //get one from set of first names
        let firstNamePart = firstNamesSet.pop()
        //init first, last name combination
        const nameRemix = `${lastNamePart}, ${firstNamePart}`
        //find index of last, first name combination
        let remixValid = 
            !remixedSet.includes(nameRemix) && !namesInitialSet.includes(nameRemix)
        if (remixValid) {
            //push to remixedSet if combination is not present in existing remix and initial set
            remixedSet.push(nameRemix)
            namesListPointer++
        } else {
            //shift back into firstNamesSet if combination is present
            firstNamesSet = Array(1).fill(firstNamePart).concat(firstNamesSet)
        }
    }

    return remixedSet.filter(r => r)
}

const modifyNames = (lastNameBins) => {
    let filteredNamesSet = filterNames(lastNameBins)
    let remixedNamesSet = remixNames(filteredNamesSet)

    return remixedNamesSet
}

const main = async() => {
    try {
        const fileName = processArgs()
        const parsedNames = await readFileAndParseNames(fileName)
        const lastNamesTable = groupByLastName(parsedNames)
        const lastNameBins = Object.values(lastNamesTable)

        const namesFullCountUnique = countUniqueFullNames(lastNameBins)

        const namesLastCommon = calculateNameOccurenceRank(lastNamesTable, 'last')
            .sort(occurencesComparator)
        namesLastCommon.length = DEFAULTS.TOP_N_NAMES

        const namesFirstCommon = calculateNameOccurenceRank(lastNamesTable, 'first')
           .sort(occurencesComparator)
        namesFirstCommon.length = DEFAULTS.TOP_N_NAMES

        const namesModified = modifyNames(lastNamesTable)

        writeJSONDataToFile(fileName, {...DATA_TO_EXTRAPOLATE, 
            ...{
                names_full_count_unique: namesFullCountUnique,
                names_last_common: namesLastCommon.filter(common => common),
                names_first_common: namesFirstCommon.filter(common => common),
                names_modified: namesModified
            }
        })
    } catch (e) {
        console.error('Stopped processing due to')
        console.error(e)
        return
    }

}

main()
