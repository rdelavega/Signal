var firebase = require('firebase');
var sortBy = require('sort-by');
var moment = require('moment');
var unique = require('array-unique');
const fs = require('fs');

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

// if (!context.global.contador) {
//   context.global.contador = 1;
// } else {
//   context.global.contador += 1;
//
//
//   if (context.global.contador == 5 && !context.global.estatus) {
//     context.global.contador = null;
//     context.global.estatus = 1;
//   } else if (context.global.contador == 3 && context.global.estatus) {
//     context.global.contador = null;
//     context.global.estatus = null;
//   }
//
// }

// msg.payload = {};
// msg.payload = {
//   estatus: context.global.estatus,
//   contador: context.global.contador
//
// }
//
// return msg;

var positivedb = firebase.database();
var root = positivedb.ref();
var transferdb = positivedb.ref('Transfer');
var positiondb = positivedb.ref('Encuestas');
var accountdb = positivedb.ref('Cuenta');
var persondb = positivedb.ref('Personas');
var temptreedb = positivedb.ref('temptree');
var reprocessdb = positivedb.ref('reprocess');
var tokendb = positivedb.ref('token');

var array = [
  'GCP-4X7K7LBKW0I0',
];

for (var i = 0; i < array.length; i++) {
  transferdb.orderByChild('puid').equalTo(array[i]).once('value').then(function(snapshot) {
    snapshot.forEach(function(child) {
      if (child == null) {
        return true;
      } else {
        console.log(child.val().puid + " " + child.key);
        // console.log(child.val());
        // transferdb.child(child.key).set(child.val());
      }
    });
  });
}