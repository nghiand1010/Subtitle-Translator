var articles = document.querySelectorAll(".ytp-caption-segment");
var captionText=document.querySelector('.captions-text');

var target = document.querySelector('.ytp-caption-window-container')

// Create an observer instance.
var observer = new MutationObserver(function(mutations) {
    console.log(target.innerText);   
});

// Pass in the target node, as well as the observer options.
observer.observe(target, {
    attributes:    true,
    childList:     true,
    characterData: true
});