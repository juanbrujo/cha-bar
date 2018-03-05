const { app, Tray, Menu, BrowserWindow } = require("electron");
const axios = require("axios");
const CLP = require("numbertoclpformater").numberToCLPFormater;
const path = require("path");
const JSSHA = require("jssha");

const iconPath = path.join(__dirname, "Icon.png");

const apiKey = "gjfRuotKReXF7AxBNAogj9sAXBa4dANB6k";
const apiSecretKey = "u8Z9je8LXKLai8a46kzM8joR3imPjBxB28";

let tray = null;

function getData() {
  const shaObj = new JSSHA("SHA-512", "TEXT");
  shaObj.setHMACKey(apiSecretKey, "TEXT");
  let timeStamp = new Date().getTime() / 1000;

  let body = JSON.stringify({
    query: `query getMarketStatsHome($marketCode: ID!) {
        market(code: $marketCode) {
          code
          lastTrade {
            price
          }
        }
      }`,
    variables: { marketCode: "CHACLP" },
    operationName: "getMarketStatsHome"
  });
  shaObj.update(timeStamp + body);
  let signature = shaObj.getHMAC("HEX");

  axios({
    method: "POST",
    url: "http://api2.orionx.io/graphql",
    data: body,
    headers: {
      "Content-Type": "application/json",
      "X-ORIONX-TIMESTAMP": timeStamp,
      "X-ORIONX-APIKEY": apiKey,
      "X-ORIONX-SIGNATURE": signature,
      "Content-Length": body.length
    }
  })
    .then(response => response.data)
    .then(json => {
      tray.setTitle(CLP(json.data.market.lastTrade.price, "CLP$", false));
    })
    .catch(error => {
      tray.setTitle("Error, reinicia la app.");
    });
}

app.on("ready", function() {
  tray = new Tray(iconPath);
  tray.setTitle("Cargando...");

  getData();

  setInterval(function() {
    return getData();
  }, 5000);

  var contextMenu = Menu.buildFromTemplate([
    {
      label: `CHA Bar ${app.getVersion()}`,
      type: "normal",
      enabled: false
    },
    {
      label: "Donations",
      type: "normal",
      click() {
        require("electron").shell.openExternal(
          "https://github.com/juanbrujo/cha-bar#donations"
        );
      }
    },
    {
      label: "Quit",
      accelerator: "Command+Q",
      selector: "terminate:"
    }
  ]);

  tray.setContextMenu(contextMenu);
});
