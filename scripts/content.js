var articles = document.querySelectorAll(".ytp-caption-segment");
var captionText=document.querySelector('.captions-text');

var target = document.querySelector('#ytp-caption-window-container');

var spantext=`<span id="translate-subtile" class="captions-text" style="overflow-wrap: normal; display: block;"></span>`
var oldtext="";
var composeObserver = new MutationObserver(function(mutations){ 
    var captionTexts=document.querySelectorAll('.ytp-caption-window-bottom .captions-text');
    if(captionTexts.length==0)
        return;
    for (var i = 0; i < captionTexts.length; i++) {
        id=captionTexts[i].id;
        if (id=='translate-subtile')
        {
            continue;
        }

        let captionText=captionTexts[i];
        if(captionText)
        {
            var text=captionText.innerText;
            if (text==oldtext)
            {
                return;
            }
            oldtext=text;
    
            var trancaptionText=document.querySelector('#translate-subtile');
            if(!trancaptionText)  
            {
                captionText.insertAdjacentHTML("beforebegin", spantext);
            }
            captionText.childNodes.forEach(async element => {
                let subtext=element.innerText;
                let transText= await translate(subtext);
                let spantextLine=`<span class="caption-visual-line" style="display: block;"><span class="ytp-caption-segment" style="display: inline-block; white-space: pre-wrap; background: rgba(8, 8, 8, 0.75); font-size: 16px; color: rgb(245, 229, 10); fill: rgb(255, 255, 255); font-family: &quot;YouTube Noto&quot;, Roboto, &quot;Arial Unicode Ms&quot;, Arial, Helvetica, Verdana, &quot;PT Sans Caption&quot;, sans-serif;">${transText}</span></span>`
                var trancaptionText=document.querySelector('#translate-subtile');
                if(trancaptionText)
                {
                    const node = new DOMParser().parseFromString(spantextLine, "text/html").body
                    .firstElementChild;
                            trancaptionText.appendChild(node)
                }
               
            });
            
        }
      }
});


function addObserverIfDesiredNodeAvailable() {
    var composeBox = document.querySelector('#ytp-caption-window-container');
    if(!composeBox) {
        //The node we need does not exist yet.
        //Wait 500ms and try again
        console.log("timeout")
        window.setTimeout(addObserverIfDesiredNodeAvailable,500);
        return;
    }
    var config =   {
        subtree: true,
        childList: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true
    };

    composeObserver.observe(composeBox,config);
}

addObserverIfDesiredNodeAvailable();


async function translate(sourceText){
  
    var sourceLang = 'en';
    var targetLang = 'vi';
   

    if (!sourceText)
        return;
    
  //  console.log(sourceText);
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    const response = await fetch(url);
    const result = await response.json();
    var tempTranslate = result[0];
    for (let index = 0; index < tempTranslate?.length; index++) {
        const element = tempTranslate[index];
       // console.log(element[0]);
        return element[0];
    }
}
