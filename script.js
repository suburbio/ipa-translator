duo.SessionView.prototype.render = _.wrap(duo.SessionView.prototype.render, function (func) {
  var orig = func.call(this);
  var activity = this.element_view;
  if (activity)
    getDuoIPA(activity.model.toJSON());
  return orig;
});

function addDiv (translated) {
  var div = document.getElementById('ipa-translation');

  if (!div) {
    div = document.createElement('div');
    div.id = 'ipa-translation';
  }

  div.innerText = '/' + translated.ipa + '/';

  $('.translation-source').each(function () {
    if (this.innerText == translated.sentence) {
      this.parentNode.appendChild(div);
    }
  });
}

function getDuoIPA (model) {
  if (model.type === 'translate' &&
     model.specific_type === 'translate' &&
     model.source_language == 'fr') {
    port.postMessage({sentence: model.sentence, lang: model.source_language});
  }
}

var port = chrome.runtime.connect(ipaExtensionId, {name: 'ipa'});

port.onMessage.addListener(function (req) {
  if (req.ipa) addDiv(req);
});
