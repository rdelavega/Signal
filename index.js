var firebase = require('firebase');
var sortBy = require('sort-by');
var moment = require('moment');
var unique = require('array-unique');

// Initialize Firebase
var appConfig = {
  apiKey: "AIzaSyDikBnf9yHLmGY4jIovJnKGJ7XOfaxI4m4",
  authDomain: "bucket1-bc82b.firebaseapp.com",
  databaseURL: "https://bucket1-bc82b.firebaseio.com",
  projectId: "bucket1-bc82b",
  storageBucket: "bucket1-bc82b.appspot.com",
  messagingSenderId: "758565469890"
};

var config = {
  apiKey: "AIzaSyCFHQMtcAn4X7sDgVhENP0rZnf-cWVpHb8",
  authDomain: "backpagination.firebaseapp.com",
  databaseURL: "https://backpagination.firebaseio.com",
  projectId: "backpagination",
  storageBucket: "backpagination.appspot.com",
  messagingSenderId: "1000722220592"
};

var app = firebase.initializeApp(appConfig);
var secondapp = firebase.initializeApp(config, "Secondary");

const positivefs = firebase.firestore(secondapp);
positivefs.settings({
  timestampsInSnapshots: true
});

var positivedb = firebase.database();
var root = positivedb.ref();
var transferdb = positivedb.ref('Transfer');
var positiondb = positivedb.ref('Encuestas');
var accountdb = positivedb.ref('Cuenta');
var persondb = positivedb.ref('Personas');

transferdb.on("child_changed", function(snapshot) {

  positiondb.orderByKey().equalTo(snapshot.val().key_encuesta)
    .limitToLast(1).once("value").then(function(snap) {

      snap.forEach(function(child) {

        if (snapshot.val().signal == null) {

          validateSignal(child, snapshot);

        } else if (snapshot.val().lastResultSet == null) {

          validateResultSet(snapshot);

        }

        return true;

      });

    }).catch(function(err) {

      console.log(err);

    });

});


////////////////////////
// in case of restart //
////////////////////////

// transferdb.on("child_added", function(snapshot) {
//
//   positiondb.orderByKey().equalTo(snapshot.val().key_encuesta)
//     .limitToLast(1).once("value").then(function(snap) {
//
//       snap.forEach(function(child) {
//
//         if (snapshot.val().signal == null) {
//           console.log(snapshot.key);
//           validateSignal(child, snapshot);
//
//         } else if (snapshot.val().lastResultSet == null) {
//
//           validateResultSet(snapshot);
//
//         }
//
//         return true;
//
//       });
//
//     }).catch(function(err) {
//
//       console.log(err);
//
//     });
//
// });

/*******************************************************
 * Validate if reprocessing is needed                  *
 * @method validateResultSet                           *
 * @param  {[object]}          snapshot transferr data *
 * @return {[type]}            null                    *
 *******************************************************/

function validateResultSet(snapshot) {

  var last = 0,
    count = 0,
    risk = 0,
    collect = [],
    info = {
      result: null,
      repeat: false
    };

  if (snapshot.val().resultado != null &&
    snapshot.val().resultado != 0 &&
    snapshot.val().processed == true &&
    snapshot.val().lastResultSet == null &&
    snapshot.val().analyst == null) {

    resultSet = snapshot.val().resultado.split("|");

    for (var i = 0; i < resultSet.length; i++) {

      if (resultSet[i] > 95) {
        resultSet[i] = 95;
      } else if (resultSet[i] < 5) {
        resultSet[i] = 5;
      } else {
        resultSet[i] = parseFloat(resultSet[i]);
      }

      info['result'] = resultSet[i];

      if (resultSet[i] == last) {

        count++;
        info['repeat'] = true;
        collect[(i - 1)]['repeat'] = true;

        if (count == 2) {
          risk++;
        }

      } else {

        count = 0;
        last = resultSet[i];
        info['repeat'] = false;

      }

      collect.push(info);
      info = {
        result: null,
        repeat: false
      };

    }

    if (risk >= 1) {

      setResultSet(snapshot, collect);

    }

  }

}

/**********************************************
 * New result set                             *
 * @method setResultSet                       *
 * @param  {[obj]}     snapshot transfer data *
 * @param  {[obj]}     collect  result set    *
 **********************************************/

function setResultSet(snapshot, collect) {

  var oldResultSet = snapshot.val().resultado.split("|");

  oldResultSet.sort(sortBy('result'));
  var min = oldResultSet[0]['result'];
  var max = oldResultSet[(oldResultSet.length - 1)]['result'];
  var meth = "";

  var range = max - min;

  for (var i = 0; i < collect.length; i++) {

    if (collect[i]['repeat'] == true) {

      meth = "m1";
      collect[i]['result'] = Math.floor((Math.random() * 58) + 5).toString();

    }

  }

  var temp = "";

  for (var i = 0; i < collect.length; i++) {

    temp = temp + collect[i]['result'] + "|";

  }

  positivedb.ref("reprocess").push().set({
    date: moment().unix(),
    item: snapshot.key,
    method: meth,
    oldRS: snapshot.val().resultado,
    newRS: temp
  });

  transferdb.child(snapshot.key).update({
    lastResultSet: snapshot.val().resultado,
    resultado: temp,
    signal: null
  });

}

/********************************************************
 * Validate necessary conditions for signal calculation *
 * @method validateSignal                               *
 * @param  {[object]}       child    survey data        *
 * @param  {[object]}       snapshot transfer data      *
 * @return null                                         *
 ********************************************************/

function validateSignal(child, snapshot) {

  if (snapshot.val().resultado != 0 &&
    snapshot.val().processed == true &&
    snapshot.val().resultado.split("|").length > 0) {

    if (snapshot.val().signal == "" ||
      snapshot.val().signal == null) {

      var inc = snapshot.val().key_empresa;
      status = getSignal(snapshot, child);
      getObj(snapshot, status);

    }

  }

}

/************************************************
 * Obtain necessary data for signal calculation *
 * @method getSignal                            *
 * @param  {[object]}  transfer transfer data   *
 * @param  {[object]}  position survey data     *
 * @param  {[int]}     type     description     *
 * @return null                                 *
 ************************************************/

function getSignal(transfer, position) {
  var questionary = position.val().cuestionario;
  var resultSet = transfer.val().resultado.split("|");
  var j = 0;
  var risk = {
    risk: 0,
    presentRisk: 0,
    pastRisk: 0,
  };

  for (var i = 0; i < questionary.length; i++) {

    if (questionary[i]['tipo'] == "pregunta" &&
      questionary[i]['area'].match("Tutorial Automatico") == null &&
      questionary[i]['area'].match("Tutorial Automático") == null) {

      if (questionary[i]['area'].match("Aptitudes") == null &&
        questionary[i]['area'].match("Socioeconómico") == null &&
        parseInt(questionary[i]['puntaje']) > 20) {

        risk = getRisk(questionary[i], resultSet[j], risk);

      }

      j++;

    }

  }

  let status = "";

  if (resultSet.length >= j) {

    status = compareRisk(risk, transfer.key);

  }

  return status;

}

/*********************************************
 * Get risk by question                      *
 * @method getRisk                           *
 * @param  {[obj]}  questionary survey data  *
 * @param  {[int]}  resultSet   crude result *
 * @param  {[obj]}  risk        risk data    *
 * @return {[obj]}  risk                     *
 *********************************************/

function getRisk(questionary, resultSet, risk) {
  var result = 100 - resultSet;
  var min = 30;

  if (result < 40) {
    // Riesgo presente
    // Riesgo y Carente
    if (questionary['puntaje'] >= min) {
      risk['presentRisk']++;
    }
  }

  if (result >= 40 && result < 60) {
    // Regular Presente
    // Regular en adelante
    if (questionary['puntaje'] >= min) {
      risk['pastRisk']++;
    }
  }

  if (result >= 40 && result < 60) {
    // Regular pasado
    // Regular en adelante
    if (questionary['puntaje'] >= min) {
      risk['risk']++;
    }
  }

  return risk;

}

/**********************************************
 * Compare risk and obtain signal             *
 * @method compareRisk                        *
 * @param  {[object]}  transfer transfer data *
 * @param  {[object]}  position survey data   *
 * @param  {[type]}    key      id            *
 * @param  {[int]}     type     description   *
 * @return {[string]}  signal                 *
 **********************************************/

function compareRisk(risk, key) {
  var status = "";

  if (risk['risk'] <= 3) {
    status = "Excelente";
  }

  if (risk['risk'] == 4) {
    status = "Bien";
  }

  if (risk['risk'] >= 5) {
    status = "Regular";
  }

  if (risk['presentRisk'] == 3) {
    status = "Regular";
  }

  if (risk['risk'] >= 7) {
    status = "Carente";
  }

  if (risk['presentRisk'] >= 4 && risk['presentRisk'] <= 5) {
    status = "Carente";
  }

  if (risk['presentRisk'] >= 6) {
    status = "Riesgo";
  }

  transferdb.child(key).child("signal").set(status);
  return status;
}

var info = {
  position: {},
  transfer: {},
  account: {},
  entity: {},
  person: {}
};

function getObj(snapshot, status) {

  info['transfer'] = snapshot.val();
  info['transfer']['key'] = snapshot.key;

  accountdb.orderByKey().equalTo(info['transfer']['key_empresa']).once('value').then(function(snap) {

    getAccount(snap);

  }).then(function() {

    accountdb.orderByKey().equalTo(info['account']['entidad']).once('value').then(function(snap) {

      getEntity(snap);

    }).then(function() {

      persondb.orderByKey().equalTo(info['transfer']['key_persona']).once('value').then(function(snap) {

        getPerson(snap);

      }).then(function() {

        positiondb.orderByKey().equalTo(info['transfer']['key_encuesta']).once('value').then(function(snap) {

          finalScore = getPosition(snap);
          saveData(finalScore, status);

        });

      });

    });

  });

}

function saveData(finalScore, status) {
  let transferInfo = {
    "codec": null,
    "date": null,
    "date_final": null,
    "key": null,
    "cuenta": {
      "key": null,
      "NComercial": null
    },
    "entidad": {
      "key": null,
      "NComercial": null
    },
    "encuesta": {
      "key": null,
      "name": null,
      "type": null
    },
    "persona": {
      "key": null,
      "ApMat": null,
      "ApPat": null,
      "Empresa": null,
      "Fotografia": null,
      "Genero": null,
      "Nombre": null,
      "Puesto": null,
      "RFC": null
    },
    "key_usuario": null,
    "processed": null,
    "puid": null,
    "resultado": null,
    "notes": []
  };

  if (info['transfer']['codec']) {
    transferInfo['codec'] = info['transfer']['codec'];
  } else {
    transferInfo['codec'] = "ra7";
  }
  transferInfo['date'] = getDate(info['transfer']['date']);
  transferInfo['date_final'] = getDate(info['transfer']['date_final']);
  transferInfo['key'] = info['transfer']['key'];
  transferInfo['key_usuario'] = info['transfer']['key_usuario'];
  transferInfo['resultado'] = info['transfer']['resultado'];
  transferInfo['processed'] = info['transfer']['processed'];
  transferInfo['puid'] = info['transfer']['puid'];

  transferInfo['cuenta']['key'] = info['account']['key'];
  transferInfo['cuenta']['NComercial'] = info['account']['NComercial'];

  transferInfo['entidad']['key'] = info['entity']['key'];
  transferInfo['entidad']['NComercial'] = info['entity']['NComercial'];

  transferInfo['encuesta']['key'] = info['position']['key'];
  transferInfo['encuesta']['name'] = info['position']['clasificacion'];
  transferInfo['encuesta']['type'] = info['position']['type'];

  transferInfo['persona']['key'] = info['person']['key'];
  transferInfo['persona']['Nombre'] = info['person']['Nombre'];
  transferInfo['persona']['ApMat'] = info['person']['ApMat'];
  transferInfo['persona']['ApPat'] = info['person']['ApPat'];
  transferInfo['persona']['Empresa'] = info['person']['Empresa'];
  transferInfo['persona']['Fotografia'] = info['person']['Fotografia'];
  transferInfo['persona']['Genero'] = info['person']['Genero'];
  transferInfo['persona']['Puesto'] = info['person']['Puesto'];
  transferInfo['persona']['RFC'] = info['person']['RFC'];

  var comInfo = {};

  if (info['transfer']['commentary'] != null) {

    comInfo['time'] = getDate(info['transfer']['commentaryDate']);
    comInfo['id_usuario'] = info['transfer']['analyst'];
    comInfo['comentario'] = info['transfer']['commentary'];
    comInfo['signal'] = status;

    transferInfo['notes'].push(comInfo);
    comInfo = {};
  }

  console.log(info['transfer']['key']);
  // positivefs.collection('transfer').add(transferInfo);
  positivefs.collection('transfer').doc(info['transfer']['key']).set(transferInfo);

}


function getDate(info) {
  var date;

  if ((info.toString()).match('/')) {
    date = moment(info, 'YYYY/MM/DD - HH:mm:ss')
    newDate = moment(date).unix();
  } else {
    date = moment.unix(info);
    newDate = date.unix();
  }

  return newDate;
}


function getAccount(snap) {
  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
      info['account'] = child.val();
      info['account']['key'] = child.key;
    }
  });
}

function getEntity(snap) {
  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
      info['entity'] = child.val();
      info['entity']['key'] = child.key;
    }
  });
}

function getPerson(snap) {
  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
      info['person'] = child.val();
      info['person']['key'] = child.key;
    }
  });
}

function getPosition(snap) {
  var finalScore = 0;

  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
      info['position']['clasificacion'] = child.val().clasificacion;
      info['position']['type'] = child.val().type;
      info['position']['key'] = child.key;

      let questionary = child.val().cuestionario;
      let resultSet = (info['transfer'].resultado).split("|"),
        j = 0,
        area = [];

      for (var i = 0; i < questionary.length; i++) {
        if (questionary[i]['tipo'] == "pregunta" &&
          questionary[i]['area'] != "Tutorial Automático") {
          questionary[i]['resultSet'] = resultSet[j];
          area.push(questionary[i]['area']);
          j++
        }
      }

      unique(area);
      questionary.sort(sortBy('topic'));

      let collectTopic = getCollectTopic(questionary);
      let collectArea = getCollectArea(area, collectTopic);

      for (var i = 0; i < collectArea.length; i++) {
        finalScore += collectArea[i]['average'];
      }
    }
  });

  return finalScore;
}

/**
 * Get info from topics to calculate score GCP
 * @param   questionary FB object
 * @return              array
 */

function getCollectTopic(questionary) {
  let collectTopic = [],
    lastTopic = "",
    infoTopic = {
      name: null,
      area: null,
      questions: [],
      average: 0
    };

  let infoQuestion = {},
    k = 0,
    l = 0;;

  for (var i = 0; i < questionary.length; i++) {

    if (questionary[i]['tipo'] == "pregunta" &&
      questionary[i]['area'] != "Tutorial Automático") {

      l++;

      if (questionary[i]['topic'] == lastTopic || k == 0) {
        infoTopic['name'] = questionary[i]['topic'];
        infoTopic['area'] = questionary[i]['area'];

        infoQuestion['res'] = getResult(questionary[i]['resultSet']);
        infoTopic['average'] += getAverage(infoQuestion['res'], questionary[i]['puntaje']);
        infoTopic['questions'].push(infoQuestion);
        lastTopic = questionary[i]['topic'];
        k++;
      }

      if (questionary[i]['topic'] != lastTopic && k != 0) {
        collectTopic.push(infoTopic);
        infoTopic['average'] = Math.round(80 - (infoTopic['average'] / (l - 1)));
        infoTopic = {
          name: null,
          area: null,
          questions: [],
          average: 0
        };

        lastTopic = questionary[i]['topic'];
        infoQuestion['res'] = getResult(questionary[i]['resultSet']);
        infoTopic['average'] += getAverage(infoQuestion['res'], questionary[i]['puntaje']);
        infoTopic['questions'].push(infoQuestion);
        l = 1;
      }

    }

    infoQuestion = {};

  }

  infoTopic['average'] = Math.round(80 - (infoTopic['average'] / (l)));
  collectTopic.push(infoTopic);

  return collectTopic;
}

/**
 * Get info from areas to calculate score GCP
 * @param   questionary FB object
 * @return              array
 */

function getCollectArea(area, collectTopic) {
  let collectArea = [],
    infoArea = {
      name: null,
      average: 0
    };

  for (i = 0; i < area.length; i++) {
    infoArea['name'] = area[i];

    collectArea.push(infoArea);
    infoArea = {
      name: null,
      average: 0
    };
  }

  let count = 0;

  for (j = 0; j < collectArea.length; j++) {
    for (i = 0; i < collectTopic.length; i++) {
      if (collectArea[j]['name'] == collectTopic[i]['area']) {
        collectArea[j]['average'] += collectTopic[i]['average'];
        count++;
      }
    }
    collectArea[j]['average'] = Math.round(collectArea[j]['average'] / count);
    count = 0;
  }

  return collectArea;
}

/**
 * Get result to user interface
 * @param   res ra7 result
 * @return      report result
 */

function getResult(res) {
  resultSet = 100 - res;

  if (resultSet > 95) {
    resultSet = 95;
  } else if (resultSet < 5) {
    resultSet = 5;
  }

  return resultSet;
}

/**
 * Get the "average" from every resul
 * @param   resultSet result from getResult
 * @param   score     FB puntaje
 * @return            "average"
 */

function getAverage(resultSet, score) {
  let res = 0;

  if (score == 40) {
    res = (80 - resultSet) * 3;
  } else if (score == 30) {
    res = (80 - resultSet);
  } else if (score == 20) {
    res = (80 - resultSet) * 0.5;
  }

  return res;
}