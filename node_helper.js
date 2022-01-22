/* Magic Mirror
 * Node Helper: MyTimerModule
 *
 * By Nico Arbter
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const Log = require("../../js/logger");
const request = require("request");
const player = require('play-sound')(opts = {})


module.exports = NodeHelper.create({
  // Override start method.
  start: function () {
    Log.log("Starting node helper for: " + this.name);
    this.sendSocketNotification("Started", this.name);
  },

  // Override socketNotificationReceived received.
  socketNotificationReceived: function (notification, payload) {
    //this.sendSocketNotification("LOG", {notification: notification, payload: payload});
    if (notification === "getState") {
      this.sendSocketNotification("sendState", this.state);
    } else if (notification === "setState") {
      Log.log(notification, payload);
      this.setState(payload);
    } else if (notification === "setText") {
      this.say.text = payload;
    } else if (notification === "setDefaults") {
      //this.muteTimer.duration = payload.muteTimer.duration;
    }
  },
  // Timer state
  say: {
    text: "Du%20solltest%20feierabend%20machen",
    lang: "de",
    volume: "100",
    zone: "Küche"
  },
  state: {
    value: "STOPPED",
    hours: 0,
    minutes: 10,
    seconds: 0
  },
  timer: {
    duration: 0,
    id: ""
  },
  muteTimer: {
    ID: "",
    duration: 20000
  },
  tick: function () {
    this.timer.duration--;
    this.state.hours = parseInt(this.timer.duration / (60 * 60), 10);
    this.state.minutes = parseInt((this.timer.duration / 60) % 60, 10);
    this.state.seconds = parseInt(this.timer.duration % 60, 10);
    this.sendState();
  },
  // timer functionality
  setState: function (state) {
    if (state.value == "START") {
      //start && set RUNNUNG
      this.startTimer(state);
    } else if (state.value == "STOP") {
      this.stopTimer(state);
    } else if (state.value == "MUTE") {
      this.stopTimer(); 
      //clearInterval(that.muteTimer.ID);
      this.sendSocketNotification("MUTEALL", ""); 
    } else {
      Log.error("STATE is not KNOWN");
    }
  },
  sendState: function () {
    let that = this;
    this.sendSocketNotification("sendState", that.state);
  },
  startTimer: function (newState) {
    this.state = newState;
    this.state.value = "RUNNING";
    this.timer.duration =
      this.state.hours * 3600 + this.state.minutes * 60 + this.state.seconds;
    this.runningTimer();
    this.sendState();
  },
  stopTimer: function () {
    let that = this;
    this.state.value = "STOPPED";
    clearInterval(that.timer.id);
    clearInterval(that.muteTimer.ID);
    that.timer.id = "";
    that.muteTimer.ID = "";
    //that.state.minutes = 10;
    this.sendState();
  },
  endTimer: function () {
    let that = this;
    this.state.value = "ENDED";
    clearInterval(that.timer.id);
    that.timer.id = "";
    sendTextToSonos();
    that.muteTimer.ID = setInterval(function () {
      sendTextToSonos();
    }, that.muteTimer.duration);
    this.sendState();

    function sendTextToSonos(){
      //let that = this; 
      /*request(
        "http://192.168.0.70:5005/" +
          that.say.zone +
          "/say/" +
          that.say.text +
          "/" +
          that.say.lang +
          "/" +
          that.say.volume, function(error, response, body){
            that.sendSocketNotification("LOG", {error: error, response: response, body:body}); 
            if (error){
              that.sendSocketNotification("PLAYALARMSOUND", true); 
            }
          }
      );*/
      that.sendSocketNotification("PLAYALARMSOUND", true); 
    }
  },
  runningTimer: function () {
    let that = this;
    if (that.timer.duration <= 0) {
      that.stopTimer();
      return;
    }
    that.timer.id = setInterval(function () {
      that.tick();
      if (that.timer.duration <= 0) {
        that.endTimer();
      }
    }, 1000);
  },
  resetTimer: function (){

  }
});
