

var _disable=false;
var _storage;
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

  chrome.tabs.onActivated.addListener( function(activeInfo){
    chrome.storage.sync.get(null).then( (result) => {_storage=result})
    setBadgeTextByStatus();
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
  chrome.storage.sync.get(null).then( (result) => {_storage=result})

  setBadgeTextByStatus();
});

function setBadgeTextByStatus()
{
  chrome.tabs.query({  
  "active": true,
  "currentWindow": true,
  "status": "complete",
  "windowType": "normal"}, async function(tabs)
    {
      for(t in tabs)
      {
        let tab=tabs[t];
        var chkkey=getDomain(tab.url);
        chrome.storage.sync.get(chkkey).then(async (result) => {
        let disable=false;
         if(result[chkkey])
        {
          let value=result[chkkey];
          _storage=value;
          disable=value.disable??false;
         // cmbLangFrom.value=value.sourceLang??'en';
        //  cmbLangTo.value=value.targetLang??clientLang;
        }
          _disable=disable;
          const nextState = disable === true ? 'OFF' : 'ON';
          await chrome.action.setBadgeText({
            tabId:tabs[t].id,
            text: nextState
          });
        })
    } });
  
}

chrome.storage.onChanged.addListener((changes, namespace) =>
{
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    chrome.tabs.query({  
      "status": "complete",
      "windowType": "normal"}, async function(tabs)
        {
          for(t in tabs)
          {
            let tab=tabs[t];
            var chkkey=getDomain(tab.url);
            if(chkkey==key)
            {
              _storage[chkkey]=newValue;
              let disable=newValue.disable;
              _disable=disable;
              const nextState = disable === true ? 'OFF' : 'ON';
              await chrome.action.setBadgeText({
                tabId:tabs[t].id,
                text: nextState
              });
            }
          }
           
        } );
      }


 });


 chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {

  if (request.method == "getStorage")
  {
    sendResponse(_storage);
  }
  else
    sendResponse({}); // snub them.
});

chrome.runtime.onInstalled.addListener(() => {
  setBadgeTextByStatus();
  chrome.storage.sync.get(null, function(items) {
    var allKeys = Object.keys(items);
    console.log(allKeys);
});
  chrome.storage.sync.get(null).then( (result) => {_storage=result})
});