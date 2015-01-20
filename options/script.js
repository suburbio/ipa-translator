var files = {
  fr: 'french',
  it: 'italian'
};

function readDBFile (file, cb) {
  cb = cb || defaultCallback;
  var reader = new FileReader();
  reader.addEventListener("load", function(event) {
    var data = reader.result.split('\n');
    var array = [];
    for (var i = 0, len = data.length; i < len; i++) {
      if (data[i].indexOf('\t') !== -1) {
        cell = data[i].split('\t');
        array.push({word: cell[0], ipa: cell[1]});
      }
    }
    cb(array);
  });
  reader.readAsText(file);
}

function putBatch (data, lang, nro) {
  nro = nro || 0;
  var nroBatches = Math.ceil(data.length / 200),
      progressNode = document.querySelector('#' + lang + ' .progress'),
      batch;

  function _put () {
    progressNode.innerText = (nro++) + ' / ' + nroBatches;
    batch = data.splice(0, 200);
    if (batch.length) {
      Exception[lang].put(batch, function () {
        setTimeout(_put, 50);
      });
    } else {
      progressNode.innerText = '';
      document.querySelector('#' + lang + ' .download').innerText = 'Instalado';
    }
  }
  _put();
}

function download () {
  var self = this,
      lang = this.dataset.lang;
  var url = 'https://suburbio.github.io/ipa-translator/data/' + files[lang] + '.txt';
  var xhr = new XMLHttpRequest();

  xhr.open("GET", url, true);
  xhr.responseType = "blob";
  xhr.overrideMimeType("text/plain");

  xhr.addEventListener('load', function (e) {
    self.disabled = true;
    self.innerText = 'Instalando...';
    readDBFile(xhr.response, function (res) {
      withDB(lang, function () { putBatch(res, lang); });
    });
  });
  self.disabled = true;
  self.innerText = 'Descargando...';
  xhr.send();
}

function checkDB () {
  var buttons = document.getElementsByClassName('download');

  initDB(function () {
    db._currentBranch = db._currentBranch || 1;
    var req = db._openUserDatabase();
    req.onsuccess = function (e) {
      var stores = req.result.objectStoreNames;
      for (var i = buttons.length - 1; i >= 0; i--) {
        var button = buttons[i];
        var lang = button.dataset.lang;
        if (stores.contains('exceptions_' + lang)) {
          button.innerText = 'Instalado';
          button.disabled = true;
        } else {
          button.addEventListener('click', download);
        }
      }
    };
    req.onerror = function (e) { console.log(e); };
  });
}

document.addEventListener('DOMContentLoaded', checkDB);
