// popup.js
// Get the elements from the popup
let lblEnable = document.getElementById('lblEnable');
let chkEnable = document.getElementById('enable');
let cmbLangFrom = document.getElementById('lang-from');
let cmbLangTo= document.getElementById('lang-to');
let domain;

// Define a function to handle the change event
function handleChange(event) {
    let chkkey=`${domain}`;
    var key = chkkey,
    testPrefs = JSON.stringify(
      { status: !event.target.checked}
    );
    var jsonfile = {};
    jsonfile[key] = testPrefs;

    chrome.storage.sync.set(jsonfile).then(() => {
        console.log("Value is set");
      });
    //.setItem(`${domain}_disable`,JSON.stringify(!event.target.checked));
  }

  // Add the event listener to the checkbox
  chkEnable.addEventListener("change", handleChange);

// Load the options from the local storage
function loadOptions() {

chrome.tabs.query({ //This method output active URL 
    "active": true,
    "currentWindow": true,
    "status": "complete",
    "windowType": "normal"
}, function (tabs) {
    for (tab in tabs) {
        domain=getDomain(tabs[tab].url,true);
        lblEnable.innerHTML=`Enable on <b>${domain}<b/>`;
        initControl();
    }
});

}

function initControl()
{
     // localStorage.setItem("lastname", "Smith");
     let chkkey=`${domain}`;
     console.log('init');
     chrome.storage.sync.get(chkkey).then((result) => {
      // console.log("Value is " + result[chkkey]);
      let disable=false;
      if(result[chkkey])
      {
        let value=JSON.parse( result[chkkey]);
        disable=value.status;
      }
   
       setCheckboxEnableValue(!disable);
     });
     
}

function setCheckboxEnableValue(value) {
    chkEnable.checked=value;
    console.log('checkbox',chkEnable.checked);
}

function getDomain(url, subdomain) {
    subdomain = subdomain || true;
    if(!url)
        return url;

    url = url.replace(/(https?:\/\/)?(www.)?/i, '');

    if (!subdomain) {
        url = url.split('.');

        url = url.slice(url.length - 2).join('.');
    }

    if (url.indexOf('/') !== -1) {
        return url.split('/')[0];
    }

    return url;
}

// Call the loadOptions function when the popup is loaded
document.addEventListener("DOMContentLoaded", loadOptions);
//document.addEventListener("Loaded", loadOptions);
