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

            getSignal(snapshot, child);

          }

        }

        return true;

      });

    }).catch(function(err) {

      console.log(err);

    });

});

module.exports = firebase;

function getSignal(transfer, position) {
  var questionary = position.val().cuestionario;
  var resultSet = transfer.val().resultado.split("|");
  var result = 0,
    j = 0,
    presentRisk = 0,
    pastRisk = 0;

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
          if (questionary[i]['peso'] >= 30) {
            presentRisk++;
          }
        } else if (result >= 40 && result < 60) {
          // Riesgo pasado
          // if (questionary[i]['peso'] >= 30) {
          pastRisk++;
          // }
        }

      }

      j++;

    }

  }

  if (resultSet.length >= j) {

    compareRisk(pastRisk, presentRisk, transfer.key);

  }

}

function compareRisk(pastRisk, presentRisk, key) {

  var status = "";

  if (pastRisk <= 2) {
    status = "Excelente";
  }

  if (pastRisk > 2 && pastRisk < 7) {
    status = "Bien";
  }

  if (pastRisk >= 7) {
    status = "Regular";
  }

  if (presentRisk >= 5 && presentRisk <= 7) {
    status = "Carente";
  }

  if (presentRisk > 7) {
    status = "Riesgo";
  }

  transferdb.child(key).child("signal").set(status);

}