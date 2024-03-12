var articles = document.querySelectorAll(".ytp-caption-segment");
var captionText = document.querySelector('.captions-text');
var clientLang = (navigator.language || navigator.userLanguage).substring(0, 2);

var _sourceLang = 'en';
var _targetLang = clientLang;

var storage;


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Nhận dữ liệu từ background.js
    console.log("Value is " + message.data);
  });
//var target = document.querySelector('#ytp-caption-window-container');
var captionWindowText = `<div class="caption-window ytp-caption-window-bottom ytp-caption-window-rollup" id="translate-caption-window" dir="ltr" tabindex="0" lang="en" draggable="true" style="touch-action: none; text-align: left; overflow: hidden; left: 21.2%; width: 454px; height: 40px; bottom: 15%;"></div>`;
var spantext = `<span id="translate-subtile"  style="overflow-wrap: normal; display: block;"></span>`
var oldtext = "";

async function getStorage() {
    if (chrome.runtime?.id) {
        response = await chrome.runtime.sendMessage({
            method: "getStorage", key: window.location.hostname
        });
        console.log(response);
        chrome.runtime.sendMessage({
            method: "getStorage", key: window.location.hostname
        },function(res){
            console.log('res',res);

        });
    }
}

getStorage();

var composeObserver = new MutationObserver(async function (mutations) {
    let response = true;
    if (chrome.runtime?.id) {
        response = await chrome.runtime.sendMessage({
            method: "getStorage", key: window.location.hostname
        });
        console.log(response);
    }

    if (response) {
        var translateCaptionWindow = document.getElementById('translate-caption-window');
        if (translateCaptionWindow) {
            translateCaptionWindow.remove();
        }
    }
    else {
        var captionText = document.querySelector('.ytp-caption-window-bottom .captions-text');
        if (!captionText) {
            var translateCaptionWindow = document.getElementById('translate-caption-window');
            if (translateCaptionWindow) {
                translateCaptionWindow.innerHTML = '';
            }
            return;
        }

        //console.log(captionText.innerText);

        //  console.log(oldtext);
        if (captionText.innerText == oldtext) {
            return;
        }

        oldtext = captionText.innerText;
        var translateCaptionWindow = document.getElementById('translate-caption-window');
        if (!translateCaptionWindow) {
            const node = new DOMParser().parseFromString(captionWindowText, "text/html").body
                .firstElementChild;

            let target = document.querySelector('#ytp-caption-window-container');

            target.insertAdjacentElement('afterbegin', node);
        }

        var trancaptionText = document.querySelector('#captionWindow');
        if (!trancaptionText) {
            var translateCaptionWindow = document.getElementById('translate-caption-window');
            const node = new DOMParser().parseFromString(spantext, "text/html").body
                .firstElementChild;

            translateCaptionWindow.insertAdjacentElement('afterbegin', node);
        }

        trancaptionText = document.querySelector('#translate-subtile');
        trancaptionText.innerHTML = '';

        // captionText.childNodes.forEach(async element => {
        //     let subtext = element.innerText;
        //     let spantextLine = `<span class="caption-visual-line" style="display: block;"><span class="ytp-caption-segment" style="display: inline-block; white-space: pre-wrap; background: rgba(8, 8, 8, 0.75); font-size: 16px; color: rgb(255, 255, 255); fill: rgb(255, 255, 255); font-family: &quot;YouTube Noto&quot;, Roboto, &quot;Arial Unicode Ms&quot;, Arial, Helvetica, Verdana, &quot;PT Sans Caption&quot;, sans-serif;">${subtext}</span></span>`
        //     var trancaptionText = document.querySelector('#translate-subtile');
        //     if (trancaptionText) {
        //         const node = new DOMParser().parseFromString(spantextLine, "text/html").body
        //             .firstElementChild;
        //         trancaptionText.appendChild(node)
        //     }

        // });

        captionText.childNodes.forEach(async element => {
            let subtext = element.innerText;
            let transText = await translate(subtext);
            let spantextLine = `<span class="caption-visual-line" style="display: block;"><span class="ytp-caption-segment" style="display: inline-block; white-space: pre-wrap; background: rgba(8, 8, 8, 0.75); font-size: 16px; color: rgb(245, 229, 10); fill: rgb(255, 255, 255); font-family: &quot;YouTube Noto&quot;, Roboto, &quot;Arial Unicode Ms&quot;, Arial, Helvetica, Verdana, &quot;PT Sans Caption&quot;, sans-serif;">${transText}</span></span>`
            var trancaptionText = document.querySelector('#translate-subtile');
            if (trancaptionText) {
                const node = new DOMParser().parseFromString(spantextLine, "text/html").body
                    .firstElementChild;
                trancaptionText.appendChild(node)
            }

        });

    }
});


function addObserverIfDesiredNodeAvailable() {
    var composeBox = document.querySelector('#ytp-caption-window-container');
    if (!composeBox) {
        //The node we need does not exist yet.
        //Wait 500ms and try again
        console.log("timeout")
        window.setTimeout(addObserverIfDesiredNodeAvailable, 500);
        return;
    }
    var config = {
        subtree: true,
        childList: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true
    };

    composeObserver.observe(composeBox, config);
}

//addObserverIfDesiredNodeAvailable();

// async function getStorage() {
//     response = await chrome.runtime.sendMessage({
//         method: "getStorage", key: window.location.hostname
//     });
// }

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

