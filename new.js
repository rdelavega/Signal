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

var app = firebase.initializeApp(appConfig);
var secondapp = firebase.initializeApp(appConfig, "Secondary");

var positivedb = firebase.database();
var root = positivedb.ref();
var transferdb = positivedb.ref('Transfer');
var positiondb = positivedb.ref('Encuestas');
var accountdb = positivedb.ref('Cuenta');
var persondb = positivedb.ref('Personas');

var info = {
  transfer: {},
  account: {},
  entity: {},
  person: {}
};

function getObj(snapshot, status) {

  info['transfer'] = snapshot.val();

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

          getPosition(snap);

          info = {
            transfer: {},
            account: {},
            entity: {},
            person: {}
          };

        });

      });

    });

  });

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
  snap.forEach(function(child) {
    if (child == null) {
      return true;
    } else {
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

      console.log(collectArea);
    }
  });
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
  s
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