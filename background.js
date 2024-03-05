

var _status=false;
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
    setBadgeTextByStatus();
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
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
          let status=false;
          if(result[chkkey])
          {
            let storage=JSON.parse(result[chkkey]);
            status=storage.status;
            _status=status;
          }
          const nextState = status === true ? 'OFF' : 'ON';
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
              let storage=JSON.parse(newValue);
              let status=storage.status;
              _status=status;
              const nextState = status === true ? 'OFF' : 'ON';
              await chrome.action.setBadgeText({
                tabId:tabs[t].id,
                text: nextState
              });
            }
          }
           
        } );
      }


 });

 chrome.runtime.onMessage.addListener( async function(request, sender, sendResponse) {

  if (request.method == "getStatus")
  {
    sendResponse(_status);
  }
  else
    sendResponse({}); // snub them.
});

chrome.runtime.onInstalled.addListener(() => {
  setBadgeTextByStatus();
});