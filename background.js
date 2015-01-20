function deleteDatabase (dbname, cb) {
  var req = MSQTA._IndexedDB.deleteDatabase(dbname);
  req.onsuccess = cb;
  req.onerror = cb;
}

function getTranscription (sentence, lang, cb) {
  cb = cb || function(res) { console.log(res); };
  // sentence = sentence.toLowerCase().replace(SPE, '').trim().split(/\s+/);
  sentence = sentence.toLowerCase().trim().split(/\s+/);
  getExceptions(sentence, lang, function (exceptions) {
    var ipa = sentence.map(function (mot) {
      if (exceptions[mot]) return exceptions[mot];
      mot = mot.replace(SPE, '');
      var result = '';
      while (mot.length) {
        var first = selectFirst(mot, conversion),
            regla = first[0],
            api = first[1];
        mot = mot.replace(RegExp(regla), '');
        result += api;
      }
      return result;
    });
    cb(getLiaison(sentence, ipa));
  });
}

function getExceptions (sentence, lang, memo, nro, cb) {
  if (typeof memo === 'function'){
    cb = memo;
    memo = {};
    nro = 0;
  }
  var text = sentence[nro];
  if (nro < sentence.length) {
    withDB(lang, function () {
      Exception[lang].getByIndex('word', text, function (res) {
        if (res.length) {
          res = res[0];
          memo[res.word] = res.ipa;
        }
        getExceptions(sentence, lang, memo, ++nro, cb);
      });
    });
  } else {
    cb(memo);
  }
}

function redirectOptions () {
  var version = parseInt(navigator.appVersion.match(/Chrome\/(\d+)\./)[1], 10),
      optionsUrl = 'chrome://extensions/?options=' + chrome.runtime.id;
  if (version < 40) {
    optionsUrl = 'chrome-extension://' + chrome.runtime.id + '/options.html';
  }
  chrome.tabs.create({url: optionsUrl});
}

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason == 'install') {
    redirectOptions();
  } else if (details.reason == 'update') {
    // Until we can use a remote db or fetch updates
    if (details.previousVersion <= "0.2.0") {
      deleteDatabase(localDB, function (res) {
        if (!res.error) {
          deleteDatabase('__msqta__', function (err) {
            if (err.error) console.log(err);
            redirectOptions();
          });
        }
      });
    }
  }
});

chrome.runtime.onConnectExternal.addListener(function (port) {
  if (port.name === 'ipa' && /duolingo/.test(port.sender.url)) {
    port.onMessage.addListener(function (req) {
      if (req.sentence) {
        getTranscription(req.sentence, req.lang, function (res) {
          port.postMessage({sentence: req.sentence, ipa: res.join(' ')});
        });
      }
    });
  }
});
