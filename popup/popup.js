// popup.js
// Get the elements from the popup
let lblDomain = document.getElementById('lblDomain');
let chkDisable= document.getElementById('disable');
let cmbLangFrom = document.getElementById('lang-from');
let cmbLangTo= document.getElementById('lang-to');
let domain;
var clientLang = (navigator.language || navigator.userLanguage).substring(0,2); //no ?s necessary


//Todo cần sửa on off theo domain còn thông tin language theo user
cmbLangFrom.addEventListener("change", ()=>{
  if(cmbLangFrom.value)
  chrome.storage.sync.set({sourceLang:cmbLangFrom.value});
});
cmbLangTo.addEventListener("change", ()=>{
  if(cmbLangTo.value)
  chrome.storage.sync.set({targetLang:cmbLangTo.value});
});

chkDisable.addEventListener("change",()=> disableChange());

function disableChange()
{
  let chkkey=`${domain}`;
    var key = chkkey,
    testPrefs = //JSON.stringify(
      {
         disable: chkDisable.checked
      }
    //);
    var jsonfile = {};
    jsonfile[key] = testPrefs;

    if (chkDisable.checked)
    { 
      chrome.storage.sync.set(jsonfile);
    }
    else
    {
      chrome.storage.sync.remove(key);
    }

}

async function getStorage(tab)
{
   let chkkey=`${domain}`;
   var result=await chrome.storage.sync.get(chkkey);
   if(result[chkkey])
   {
     console.log('getStorage ',result[chkkey]);
     let value=result[chkkey];
     chkDisable.checked=value.disable??false;
   }
   let sourceLang=await chrome.storage.sync.get(['sourceLang']);
   let targetLang=await chrome.storage.sync.get(['targetLang']);

   sourceLang=sourceLang.sourceLang;
   targetLang=targetLang.targetLang;
   cmbLangFrom.value=sourceLang??'en';
   cmbLangTo.value=targetLang??clientLang;

}



// Load the options from the local storage
function loadOptions() {

chrome.tabs.query({ //This method output active URL 
    "active": true,
    "currentWindow": true,
    "status": "complete",
    "windowType": "normal"
}, async function (tabs) {
    for (tab in tabs) {
        domain=getDomain(tabs[tab].url,true);
        lblDomain.innerHTML=`<b>${domain}<b/>`;
       await initControl(tabs[tab]);
    }
});

}

async function initControl(tab)
{
   await  getStorage(tab);
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
