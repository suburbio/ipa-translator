var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
(document.head||document.documentElement).appendChild(s);
s.onload = function() {
  s.parentNode.removeChild(s);
};

// set extensionId
var actualCode = "var ipaExtensionId = '" + chrome.runtime.id + "';";
var script = document.createElement('script');
script.textContent = actualCode;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);

// set css
var css = "#ipa-translation {font-family: monospace}";
var style = document.createElement('style');
style.textContent = css;
(document.head||document.documentElement).appendChild(style);
