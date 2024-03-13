var clientLang = (navigator.language || navigator.userLanguage).substring(0, 2);

var _sourceLang = 'en';
var _targetLang = clientLang;

function waitForElement(selector) {
    return new Promise((resolve) => {
        if (document.querySelector(selector)) {
            return resolve(element);
        }
        const observer = new MutationObserver(() => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                observer.disconnect();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
}

function getDomain(url, subdomain) {
    subdomain = subdomain || true;
    if (!url)
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

var oldtext = "";

async function translateSubstitle() {
    if (chrome.runtime?.id) {
        response = await chrome.runtime.sendMessage({
            method: "getStorage", key: window.location.hostname
        });
        let domain = getDomain(window.location.href);
      
        if(!response)
        {
            return;
        }

        _sourceLang=response.sourceLang;
        _targetLang=response.targetLang;
        let disable = response[domain] ?? false;
        if (disable) {
            let translateCaptionWindow = document.getElementById('translate-caption-window');
            if (translateCaptionWindow) {
                translateCaptionWindow.remove();
            }
        }
        else {
            let rollup = document.querySelector('.caption-window.ytp-caption-window-bottom.ytp-caption-window-rollup');
            if(rollup)
            {
                return;
            }
            let captionText = document.querySelector('.ytp-caption-window-bottom .captions-text');
            
            let translateCaptionWindow = document.getElementById('translate-caption-window');
            if (!captionText && translateCaptionWindow) {
                translateCaptionWindow.remove();
            }

            if (captionText?.innerText?.trim() == oldtext) {
                return;
            }

            oldtext = captionText?.innerText?.trim();

            if(translateCaptionWindow)
            {
                translateCaptionWindow.remove();
            }
          
             translateCaptionWindow = document.getElementById('translate-caption-window');
            if (!translateCaptionWindow) {
                console.log("change");
                let captionContainer = document.getElementById('ytp-caption-window-container');        
                if (captionContainer) {
                
                    translateCaptionWindow = captionContainer.cloneNode(true);
                    translateCaptionWindow.id = "translate-caption-window";
                    for await (element of translateCaptionWindow.childNodes)
                    {
                        element.style.bottom = '15%';
                        for await (elm of element.childNodes){
                            elm.classList.remove('captions-text');
                            for await (subEl of elm.childNodes){
                                for await (subSubEl of subEl.childNodes)
                                {
                                    let text=subSubEl.innerText;
                                    subSubEl.style.color='yellow';
                                    subSubEl.innerText= await translate(text.trim());
                                }
                            }
                        }
                      
                    }
                
                   // console.log(translateCaptionWindow.innerText);
                    let parent = document.getElementById('ytp-caption-window-container');        
                    parent.parentNode.appendChild(translateCaptionWindow);
                }
            }
            
          
        }

    }
}

async function translate(sourceText) {
    if (!sourceText)
        return;

    // console.log('source',sourceText);
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=" + _sourceLang + "&tl=" + _targetLang + "&dt=t&q=" + encodeURI(sourceText);

    const response = await fetch(url);
    const result = await response.json();
    var tempTranslate = result[0];
    for (let index = 0; index < tempTranslate?.length; index++) {
        const element = tempTranslate[index];
        // console.log('tran',element[0]);
        return element[0];
    }
}


function checkContainSubstite() {
    let captionID = '#ytp-caption-window-container';
    var caption = document.querySelector(captionID);
    var count = 1;
    var composeObserver = new MutationObserver(async function (mutations) {
        await translateSubstitle();
    });

    var config = {
        subtree: true,
        childList: true,
    };

    if (!caption) {
        waitForElement(captionID).then((element) => {
            currentElement = element;
            console.log("add event ", window.location.href);
            composeObserver.observe(element, config);
        });
    }
    else {
        if (currentElement != caption) {
            console.log("add new event ", window.location.href);
            composeObserver.observe(caption, config);
            currentElement = caption;
        }
    }
}
var oldLocation = window.location.href;
var currentElement = "";
let intervalID = setInterval(checkContainSubstite, 1000);
