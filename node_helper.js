/* Magic Mirror
 * Node Helper: MyTimerModule
 *
 * By Nico Arbter
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const Log = require("../../js/logger");
const request = require("request")

module.exports = NodeHelper.create({
	// Override start method.
	start: function () {
    Log.log("Starting node helper for: " + this.name);
    this.sendSocketNotification("Started", this.name);
	},

	// Override socketNotificationReceived received.
	socketNotificationReceived: function (notification, payload) {
    //this.sendSocketNotification("LOG", {notification: notification, payload: payload});
      if (notification === "getState"){
        this.sendSocketNotification("sendState", this.state);
      }
      else if(notification === "setState"){
        Log.log(notification, payload); 
        this.setState(payload); 
      }
      else if(notification ==="setText"){
        this.say.text = payload; 

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
    minutes: 0,
    seconds: 20
  }, 
  timer: {
    duration: 0,
    id: ""
  },
  muteTimerID : "",
  tick: function(){
    this.timer.duration--; 
    this.state.hours = parseInt(this.timer.duration /(60*60), 10);
    this.state.minutes = parseInt((this.timer.duration/60)%60, 10);
    this.state.seconds = parseInt(this.timer.duration % 60, 10);
    this.sendState(); 
    
  },
  // timer functionality
  setState: function(state){
    if (state.value == "START"){
      //start && set RUNNUNG
      this.startTimer(state); 
    }
    else if (state.value == "STOP"){
      this.stopTimer(state);
    }
    else if (state.value == "MUTE"){
      clearInterval(that.muteTimerID); 
    }
    else{
      Log.error("STATE is not KNOWN"); 
    }
  }, 
  sendState: function (){
    let that = this; 
    this.sendSocketNotification("sendState", that.state); 
  },
  startTimer: function(newState){
    this.state = newState; 
    this.state.value = "RUNNING";
    this.timer.duration = (this.state.hours * 3600) + (this.state.minutes*60)+this.state.seconds;
    this.runningTimer(); 
    this.sendState(); 
  }, 
  stopTimer: function(){
    let that = this; 
    this.state.value = "STOPPED";
    clearInterval(that.timer.id); 
    clearInterval(that.muteTimerID);
    that.timer.id = ""; 
    that.muteTimerID = "";
    this.sendState(); 

  },
  muteTimer: function(){

  },
  endTimer: function(){
    let that = this; 
    this.state.value = "ENDED";
    clearInterval(that.timer.id); 
    that.timer.id = ""; 
    request('http://raspberrypi:5005/'+that.say.zone+'/say/'+ that.say.text +'/'+that.say.lang+'/'+that.say.volume);
    that.muteTimerID = setInterval(function(){
      request('http://raspberrypi:5005/'+that.say.zone+'/say/'+ that.say.text +'/'+that.say.lang+'/'+that.say.volume);
    },30000); 
    this.sendState(); 
  },
  runningTimer: function(){
    let that = this; 
    if (that.timer.duration <= 0){
      that.stopTimer(); 
      return; 
    }
    that.timer.id = setInterval(function(){
      that.tick(); 
      if (that.timer.duration <= 0){
        that.endTimer(); 
      }
    }, 1000); 
  }		
});
