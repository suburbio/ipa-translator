var db, localDB = 'langs', Exception = {};

function defaultCallback () {
  console.log(arguments);
}

function initDB (cb) {
  cb = cb || defaultCallback;
  if (db && db._name == localDB) {
    cb();
  } else {
    db = new MSQTA.ORM({name: localDB, prefered: 'IndexedDB'}, cb); //, devMode: true
  }
}

function withDB (lang, cb) {
  cb = cb || defaultCallback;
  initDB(function () {
    if (Exception[lang]) {
      cb();
    } else {
      Exception[lang] = new db.Schema({
        name: 'exceptions_' + lang,
        fields: {
          id: {type: 'integer'},
          word: {type: 'string', index: true},
          ipa: {type: 'string'}
        },
        primaryKey: 'id'
      }, cb);
    }
  });
}
