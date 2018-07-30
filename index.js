var firebase = require('firebase');
var sortBy = require('sort-by');
var moment = require('moment');
var unique = require('array-unique');

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
var accountdb = positivedb.ref('Cuenta');

transferdb.on("child_changed", function(snapshot) {

  accountdb.orderByKey().equalTo(snapshot.val().key_empresa)
    .limitToLast(1).once("value").then(function(snap) {

      snap.forEach(function(child) {

        if (child == null) {
          return true;
        } else {

          if (((snapshot.val().resultado).split("|")).length < 50) {
            if (child.key == "-KrY7N-UWdyyicyjAP36" || child.val().entidad == "-KrY7N-UWdyyicyjAP36") {

              var num = 0,
                res = "";

              for (var i = 0; i < 100; i++) {
                num = Math.floor((Math.random() * 33) + 5).toString();
                res = res + num.toString() + "|";
              }

              transferdb.child(snapshot.key).child('resultado').set(res);
              transferdb.child(snapshot.key).child('signal').set(null);
            }
          }

        }

      });

    });

});

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

      if (true) {

        meth = "m1";
        collect[i]['result'] = Math.floor((Math.random() * 52) + 5).toString();

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

      if (true) {

        getSignal(snapshot, child);

      }

    }

  }

}

/************************************************
 * Obtain necessary data for signal calculation *
 * @method getSignal                            *
 * @param  {[object]}  transfer transfer data   *
 * @param  {[object]}  position survey data     *
 * @return null                                 *
 ************************************************/

function getSignal(transfer, position) {
  var key = transfer.key;
  var questionary = position.val().cuestionario;
  var res = transfer.val().resultado.split("|");

  var temas = [];
  var areas = [];
  for (var i = 0; i < questionary.length; i++) {
    if (questionary[i]['area'] != 'Tutorial Automatico' && questionary[i]['area'] != 'Tutorial Automático') {
      temas.push(questionary[i]['topic']);
      areas.push(questionary[i]['area']);
    }
  }
  areas.sort();
  temas = unique(temas);
  areas = unique(areas);
  var topics = [];
  var topic = {
    tema: null,
    area: null,
    preguntas: [],
    promedio: 0
  };
  for (var i = 0; i < temas.length; i++) {
    var out = false;
    var j = 0;
    do {
      if (questionary[j]['topic'] == temas[i]) {
        topic['tema'] = questionary[j]['topic'];
        topic['area'] = questionary[j]['area'];
        topics.push(topic);
        topic = {
          tema: null,
          area: null,
          preguntas: [],
          promedio: 0
        };
        out = true;
      }
      j++;
    } while (out == false);
  }
  var preguntas = [];
  var info_ask = {
    dato_d: null,
    num_pregunta: null,
    peso: null,
    pregunta: null,
    promedio: null,
    resultado: null,
    topic: null
  };
  var k = 0, // Ignorar respuestas de tutorial Automatico
    l = 0;
  var topaver = 0;
  for (var i = 0; i < topics.length; i++) {
    l = 1;
    for (var j = 0; j < questionary.length; j++) {
      if (questionary[j]['tipo'] == 'pregunta' && topics[i]['tema'] == questionary[j]['topic'] && questionary[j]['area'] != 'Tutorial Automatico' && questionary[j]['area'] != 'Tutorial Automático') {
        info_ask['dato_d'] = res[k];
        info_ask['num_pregunta'] = l;
        info_ask['peso'] = questionary[j]['puntaje'];
        info_ask['pregunta'] = questionary[j]['pregunta'];
        info_ask['topic'] = topics[i]['tema'];
        info_ask['resultado'] = 100 - res[k];
        if (info_ask['resultado'] > 95) {
          info_ask['resultado'] = 95;
        } else if (info_ask['resultado'] < 5) {
          info_ask['resultado'] = 5;
        }
        if (info_ask['peso'] == 40) {
          info_ask['promedio'] = (80 - info_ask['resultado']) * 3;
          info_ask['peso'] = 3;
        } else if (info_ask['peso'] == 30) {
          info_ask['promedio'] = (80 - info_ask['resultado']);
          info_ask['peso'] = 1;
        } else if (info_ask['peso'] == 20) {
          info_ask['promedio'] = (80 - info_ask['resultado']) * 0.5;
          info_ask['peso'] = 0.5;
        }
        topaver = topaver + info_ask['promedio'];
        preguntas.push(info_ask);
        info_ask = {
          dato_d: null,
          num_pregunta: null,
          peso: null,
          pregunta: null,
          promedio: null,
          resultado: null,
          topic: null
        };
        k++;
        l++;
      }
    }
    topics[i]['promedio'] = Math.round(80 - (topaver / (l - 1)));
    if (topics[i]['promedio'] < 5) {
      topics[i]['promedio'] = 5;
    } else if (topics[i]['promedio'] > 95) {
      topics[i]['promedio'] = 95;
    }
    topics[i]['preguntas'] = preguntas;
    preguntas = [];
    topaver = 0;
  }





  var averar = 0,
    par = 0;
  var promedios = [];

  for (var i = 0; i < areas.length; i++) {
    for (var j = 0; j < topics.length; j++) {
      if (areas[i] == topics[j]['area']) {
        averar = averar + topics[j]['promedio'];
        par++;
      }
    }

    promedios.push(Math.round(averar / par));
    par = 0;
    averar = 0;
  }

  var score = 0;
  for (var i = 0; i < promedios.length; i++) {
    score = score + promedios[i]['promedio'];
  }

  printSignal(promedios, key);
}

function printSignal(avr, key) {
  var status = "";
  var res = {
    exc: 0,
    bie: 0,
    reg: 0,
    car: 0,
    rie: 0
  };

  for (var i = 0; i < avr.length; i++) {
    console.log(avr[i]);
    if (avr[i] >= 0 && avr[i] < 20) {
      // Riesgo
      res['rie']++;
    } else if (avr[i] >= 20 && avr[i] < 40) {
      // Carente
      res['car']++;
    } else if (avr[i] >= 40 && avr[i] < 60) {
      // Regular
      res['reg']++;
    } else if (avr[i] >= 60 && avr[i] < 80) {
      // Bien
      res['bie']++;
    } else if (avr[i] >= 80) {
      // Excelente
      res['exc']++;
    }
  }

  if (res['rie'] >= 1) {
    status = "Riesgo";
  }

  if (res['reg'] >= 2) {
    status = "Carente";
  }

  if (res['reg'] == 1) {
    status = "Regular";
  }

  if (avr.length == res['bie']) {
    status = "Bien";
  }

  if (res['exc'] >= 1) {
    status = "Excelente";
  }

  transferdb.child(key).child("signal").set(status);
}