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


 function checkContainSubstite()
{
    let captionID='#ytp-caption-window-container';
    var caption=document.querySelector(captionID);
    var count=1;
    var composeObserver = new MutationObserver(async function (mutations)
    {
       console.log('observer',count++);
    });

    var config = {
        subtree: true,
        childList: true,
    };

    if(!caption)
    {
        waitForElement(captionID).then((element)=>{
            currentElement=element;
            console.log("add event");
            composeObserver.observe(element, config);
        });
    }
    else{
        if(currentElement!=caption)
        {
            console.log("add new event");
            composeObserver.observe(caption, config);
            currentElement=caption;
        }
    }
}
var oldLocation=window.location.href;
var currentElement="";
let intervalID = setInterval(checkContainSubstite, 1000);
