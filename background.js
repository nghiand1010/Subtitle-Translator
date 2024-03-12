

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
          disable=value.disable??false;
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

    if( key=='targetLang'||key=='sourceLang')
    {
        //Todo check thay đổi
        _storage[key]=newValue;
        return;
    }
    
   // delete storage[key];
   _storage[key]=newValue;

   
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
              let disable=newValue?.disable;
              const nextState = disable === true ? 'OFF' : 'ON';
              await chrome.action.setBadgeText({
                tabId:tabs[t].id,
                text: nextState
              });

            
              // chrome.scripting
              // .executeScript({
              //   target : {tabId : tabs[t].id},
              //   func :()=> location.reload(),
              // })
              // .then(() => console.log("injected a function"));

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
  chrome.storage.sync.get(null).then( (result) => {_storage=result})
});