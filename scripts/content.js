var articles = document.querySelectorAll(".ytp-caption-segment");
var captionText=document.querySelector('.captions-text');

var target = document.querySelector('.ytp-caption-window-container')

// Create an observer instance.
var observer = new MutationObserver(function(mutations) {
   // console.log(target.innerText);  
    translate(target.innerText);
});

// Pass in the target node, as well as the observer options.
observer.observe(target, {
    attributes:    true,
    childList:     true,
    characterData: true
});

async function translate(sourceText){
  
    var sourceLang = 'en';
    var targetLang = 'vi';
   

    if (!sourceText)
        return;
    
    console.log(sourceText);
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="+ sourceLang + "&tl=" + targetLang + "&dt=t&q=" + encodeURI(sourceText);

    const response = await fetch(url);
    const result = await response.json();
    var tempTranslate = result[0];
    for (let index = 0; index < tempTranslate?.length; index++) {
        const element = tempTranslate[index];
        console.log(element[0]);
    }
}
