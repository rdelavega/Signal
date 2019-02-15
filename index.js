var firebase = require('firebase');
var sortBy = require('sort-by');
var moment = require('moment');

// Initialize Firebase
var appConfig = {
  apiKey: "AIzaSyDikBnf9yHLmGY4jIovJnKGJ7XOfaxI4m4",
  authDomain: "bucket1-bc82b.firebaseapp.com",
  databaseURL: "https://bucket1-bc82b.firebaseio.com",
  projectId: "bucket1-bc82b",
  storageBucket: "bucket1-bc82b.appspot.com",
  messagingSenderId: "758565469890"
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
      getSignal(snapshot, child);

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

  if (resultSet.length >= j) {

    compareRisk(risk, transfer.key);

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
}