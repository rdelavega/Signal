var firebase = require('firebase');
var sortBy = require('sort-by');
var moment = require('moment');

// Initialize Firebase
var appConfig = {
  apiKey: "AIzaSyAT7spVMFGob7q6Q1UJCaMi6RvGoMBgcAc",
  authDomain: "prototipo1-8e37a.firebaseapp.com",
  databaseURL: "https://prototipo1-8e37a.firebaseio.com",
  storageBucket: "prototipo1-8e37a.appspot.com",
  messagingSenderId: "856846236373"
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

        validateResultSet(snapshot);

        validateSignal(child, snapshot);

        return true;

      });

    }).catch(function(err) {

      console.log(err);

    });

});

transferdb.on("child_added", function(snapshot) {

  positiondb.orderByKey().equalTo(snapshot.val().key_encuesta)
    .limitToLast(1).once("value").then(function(snap) {

      snap.forEach(function(child) {

        validateResultSet(snapshot);

        validateSignal(child, snapshot);

        return true;

      });

    }).catch(function(err) {

      console.log(err);

    });

});

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

        if (count == 4) {
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

    if (risk > 1) {

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

      if (min >= 5 && max <= 65 && range >= 30) {

        meth = "m2";
        collect[i]['result'] = Math.floor((Math.random() * range) + min).toString();

      } else {

        meth = "m1";
        collect[i]['result'] = Math.floor((Math.random() * 55) + 5).toString();

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

  transferdb.child(snapshot.key).child("lastResultSet").set(snapshot.val().resultado);
  transferdb.child(snapshot.key).child("resultado").set(temp);
  transferdb.child(snapshot.key).child("signal").set(null);

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
      snapshot.val().signal == null ||
      snapshot.val().lastResultSet != null) {

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
  var result = 0,
    j = 0,
    presentRisk = 0,
    pastRisk = 0,
    min = 0;

  if (type == 0) {
    min = 20;
  } else if (type == 1) {
    min = 30;
  }

  for (var i = 0; i < questionary.length; i++) {

    if (questionary[i]['tipo'] == "pregunta" &&
      questionary[i]['area'].match("Tutorial Automatico") == null &&
      questionary[i]['area'].match("Tutorial Automático") == null) {

      if ((questionary[i]['area']).match("Temas") ||
        (questionary[i]['area']).match("Temas Especiales") ||
        (questionary[i]['area']).match("Integridad") ||
        (questionary[i]['area']).match("Especial")) {

        result = 100 - resultSet[j];

        if (result < 40) {
          // Riesgo presente
          if (questionary[i]['puntaje'] >= min) {
            presentRisk++;
          }
        } else if (result >= 40 && result < 60) {
          // Riesgo pasado
          if (questionary[i]['puntaje'] >= min) {
            pastRisk++;
          }
        }

      }

      j++;

    }

  }

  if (resultSet.length >= j) {

    compareRisk(pastRisk, presentRisk, transfer.key, type);

  }

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

function compareRisk(pastRisk, presentRisk, key, type) {
  var status = "";

  if (pastRisk <= 2) {
    status = "Excelente";
  }

  if (pastRisk > 2 && pastRisk <= 4) {
    status = "Bien";
  }

  if (pastRisk >= 5 || presentRisk == 2) {
    status = "Regular";
  }

  if (type == 0) {

    if (presentRisk >= 3 && presentRisk < 6) {
      status = "Carente";
    }

    if (presentRisk >= 6) {
      status = "Riesgo";
    }

  } else if (type == 1) {

    if (pastRisk >= 2) {
      status = "Carente";
    }

    if (presentRisk >= 1) {
      status = "Riesgo";
    }

  }

  transferdb.child(key).child("signal").set(status);
}