"use strict";

const events = require("sdk/system/events");
const { PageMod } = require("sdk/page-mod");

const { Connection, addConnection } = require('./connection');
const tabEvents = require('./tab/events');
const ui = require('./ui');

var tabs = require("sdk/tabs");
var data = require("sdk/self").data;

events.on("http-on-examine-response", function(subject) {
    var connection = Connection.fromSubject(subject);
    if (connection.valid){
        addConnection(connection);
    }
}, true);

Connection.on('log', function(message){
    ui.emit('log', message);
});


function matchesCurrentTab(connection){
    // this is a tabinfo object
    var tabinfo = this;
    if (!tabinfo) return false;
    if (!tabinfo.uri) return false;
    if (tabinfo.uri.spec === ui.mainPage){ return false; }
    return (connection._sourceTab === tabinfo.tab) && (connection.timestamp > tabinfo.loadTime);
}


PageMod({
    include: ui.mainPage,
    contentScriptWhen: 'ready',
    contentScriptFile: ui.contentScript,
    onAttach: ui.attachToLightbeamPage
});

exports.main = function (options, callbacks) {
  //console.error("options.loadReason:", options.loadReason);
  var loadURL = null;
  switch (options.loadReason) {
    case "install":
      loadURL = "first-run.html";
      break;
    case "upgrade":
      loadURL = "upgrade.html";
      break;
  }
  if (loadURL) {
    tabs.open(data.url(loadURL));
  }
}
