const {app, Tray, Menu, BrowserWindow} = require('electron')
const axios = require('axios')
const CLP = require('numbertoclpformater').numberToCLPFormater
const path = require('path')

const iconPath = path.join(__dirname, 'Icon.png');
let tray = null;

function getData () {
  axios.get('https://api.fsanllehi.me/chaucha')
  .then(function (res) {
    tray.setTitle(CLP(res.data[0].precio, 'CLP$', false))
  })
  .catch(function (error) {
    tray.setTitle('Error, reinicia la app.')
  })
}

app.on('ready', function () {

  tray = new Tray(iconPath)
  tray.setTitle("Cargando...")

  getData()

  setInterval(function () {
    return getData();
  }, 5000)

  var contextMenu = Menu.buildFromTemplate([
    {
      label: `CHA Bar ${app.getVersion()}`,
      type: 'normal',
      enabled: false
    },
    {
      label: 'Donations',
      type: 'normal',
      click () {
        require('electron').shell.openExternal('https://github.com/juanbrujo/cha-bar#donations')
      }
    },
    { label: 'Quit',
      accelerator: 'Command+Q',
      selector: 'terminate:'
    }
  ])

  tray.setContextMenu(contextMenu)

});
