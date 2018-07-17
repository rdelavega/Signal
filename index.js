var firebase = require('firebase');
var sortBy = require('sort-by');
var moment = require('moment');

// Initialize Firebase
var appConfig = {
  apiKey: "AIzaSyAhDYV5B4WnGz1S-ewBWNiow-cWB85T3-I",
  authDomain: "prototipo2-5af1f.firebaseapp.com",
  databaseURL: "https://prototipo2-5af1f.firebaseio.com",
  projectId: "prototipo2-5af1f",
  storageBucket: "prototipo2-5af1f.appspot.com",
  messagingSenderId: "428785972383"
};

var app = firebase.initializeApp(appConfig);
var secondapp = firebase.initializeApp(appConfig, "Secondary");

var positivedb = firebase.database();
var root = positivedb.ref();
var transferdb = positivedb.ref('Transfer');
var positiondb = positivedb.ref('Encuestas');

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

      if (false) {

        meth = "m2";
        collect[i]['result'] = Math.floor((Math.random() * range) + min).toString();

      } else {

        meth = "m1";
        collect[i]['result'] = Math.floor((Math.random() * 63) + 5).toString();

      }

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

      if (inc == "-Kza_9vAnpw9Zv7j4n8e" ||
        inc == "-Kza_uwyA9ad_7wlJwVN" ||
        inc == "-KzaaeaYdyUy0ZWK9WUY" ||
        inc == "-KzabVVwALEM8dZX00t4" ||
        inc == "-KzacOlWAQkAVricUG-d") {

        getSignal(snapshot, child, 1);

      } else {

        getSignal(snapshot, child, 0);

      }

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

function getSignal(transfer, position, type) {
  var questionary = position.val().cuestionario;
  var resultSet = transfer.val().resultado.split("|");
  var j = 0;
  var risk = {
      risk: 0,
      presentRisk: 0,
      pastRisk: 0,
    },
    cmx1 = {
      risk: 0,
      presentRisk: 0,
      pastRisk: 0,
    };

  for (var i = 0; i < questionary.length; i++) {

    if (questionary[i]['tipo'] == "pregunta" &&
      questionary[i]['area'].match("Tutorial Automatico") == null &&
      questionary[i]['area'].match("Tutorial Automático") == null) {

      if (true) {

        risk = getRisk(questionary[i], resultSet[j], risk);

      }

      if ((questionary[i]['topic']).match("Sustracción de Bienes y Valores") ||
        (questionary[i]['topic']).match("Consumo en Trayectos")) {

        cmx1 = getRisk(questionary[i], resultSet[j], cmx1);

      }

      j++;

    }

  }

  if (type == 0) {
    cmx1 = null;
  }

  if (resultSet.length >= j) {

    compareRisk(risk, transfer.key, type, cmx1);

  }

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

  if (result < 60) {
    // Riesgo pasado
    // Regular en adelante
    if (questionary['puntaje'] >= min) {
      risk['pastRisk']++;
    }
  }

  if (result >= 40 && result < 60) {
    // Riesgo pasado
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

function compareRisk(risk, key, type, cmx1) {
  var status = "";

  if (risk['pastRisk'] <= 2) {
    status = "Excelente";
  }

  if (risk['pastRisk'] > 2 && risk['pastRisk'] <= 4) {
    status = "Bien";
  }

  if (risk['pastRisk'] > 4) {
    status = "Regular";
  }

  if (risk['presentRisk'] == 3) {
    status = "Regular";
  }

  if (risk['presentRisk'] > 3 && risk['presentRisk'] <= 6) {
    status = "Carente";
  }

  if (risk['presentRisk'] > 6) {
    status = "Riesgo";
  }

  if (cmx1 != null) {
    if (cmx1['risk'] >= 2) {
      status = "Carente";
    }
    if (cmx1['presentRisk'] >= 1) {
      status = "Riesgo";
    }
  }

  transferdb.child(key).child("signal").set(status);
}