var firebase = require('firebase');

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

        return true;

      });

    }).catch(function(err) {

      console.log(err);

    });

});

module.exports = firebase;

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

function compareRisk(pastRisk, presentRisk, key, type) {
  var status = "";

  if (pastRisk <= 2) {
    status = "Excelente";
  }

  if (pastRisk > 2 && pastRisk <= 4) {
    status = "Bien";
  }

  if (pastRisk >= 5 || presentRisk <= 2 && presentRisk > 0) {
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