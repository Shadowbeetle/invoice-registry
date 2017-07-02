const { dialog, clipboard } = require('electron').remote
const fs = require('fs')
const _ = require('lodash')
const tildePath = require('tilde-path')
const moment = require('moment')
const path = require('path')
const expandTilde = require('expand-home-dir')

const imageSelectorButton = document.querySelector('#select-image')
const imageContainer = document.querySelector('#picture-list')
const destinationSelectorButton = document.querySelector('#select-destination')
const destinationDisplay = document.querySelector('#current-destination')
const nameTemplateInput = document.querySelector('#name-template')
const copyAndRenameButton = document.querySelector('#copy-rename')
const resultsContainer = document.querySelector('#results')

const DEFAULT_DESTINATION = '~/Dropbox/Sharing/Fehérvári úti kincsesláda/Invoices'

destinationDisplay.textContent = DEFAULT_DESTINATION

let sourceFiles
let destination = expandTilde(DEFAULT_DESTINATION)
function selectImages () {
  const filePaths = dialog.showOpenDialog({
    filters: [ { name: 'Images', extensions: [ 'jpg', 'png', 'gif' ] } ],
    properties: [ 'openFile', 'multiSelections' ]
  })

  _.forEach(filePaths, (filePath) => {
    const img = document.createElement('img')
    img.src = filePath
    img.className = 'item-image'
    imageContainer.appendChild(img)
  })
  sourceFiles = filePaths
}

function selectDestination () {
  destination = expandTilde(_.head(dialog.showOpenDialog({
    defaultPath: expandTilde(destination),
    properties: [ 'openDirectory' ]
  })))
  destinationDisplay.textContent = tildePath(destination)
}

function copyAndRename () {
  const nameTemplate = nameTemplateInput.value
  if (!nameTemplate) {
    return alert('Please specify a name template!')
  }
  const targetFileNames = _.map(sourceFiles, (sourceFile, i) => {
    const extName = path.extname(sourceFile)
    const date = moment().format('YYYY-MM-DD')
    return `${nameTemplate}_${date}_${i+1}${extName}`
  })

  _.forEach(sourceFiles, (sourceFile, i) => {
    const destinationPath = `${destination}/${targetFileNames[i]}`
    console.log(destinationPath)
    fs.createReadStream(sourceFile)
      .pipe(fs.createWriteStream(destinationPath))
  })

  const result = targetFileNames.join(', ')
  resultsContainer.textContent = result
  clipboard.writeText(result)
  alert('Result file names are copied to clipboard!')
}

imageSelectorButton.onclick = selectImages
destinationSelectorButton.onclick = selectDestination
copyAndRenameButton.onclick = copyAndRename
