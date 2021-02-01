/* Magic Mirror
 * Node Helper: MyTimerModule
 *
 * By Nico Arbter
 * MIT Licensed.
 */

const NodeHelper = require("node_helper");
const Log = require("../../js/logger");

module.exports = NodeHelper.create({
	// Override start method.
	start: function () {
    Log.log("Starting node helper for: " + this.name);
    this.sendSocketNotification("Started", this.name);
	},

	// Override socketNotificationReceived received.
	socketNotificationReceived: function (notification, payload) {
    this.sendSocketNotification("LOG", {notification: notification, payload: payload});
      if (notification === "getState"){
        this.sendSocketNotification("sendState", this.state);
      }
      else if(notification === "setState"){
        Log.log(notification, payload); 
        this.setState(payload); 


      }
	},
  // Timer state 
  state: {
    value: "STOPPED", 
    hours: 59,
    minutes: 59,
    seconds: 59
  }, 
  // timer functionality
  setState: function(state){
    if (state.value == "START"){
      //start && set RUNNUNG
      this.timer.start(state); 
    }
    else if (state.value == "STOP"){
      //stop && set STOPPED
    }
    else if (state.value == "MUTE"){

    }
    else{
      Log.error("STATE is not KNOWN"); 
    }
  }, 
  sendState: function (){
    let that = this; 
    this.sendSocketNotification("sendState", that.state); 
  },
  timer:{
    start: function(){

    }, 
    stop: function(){

    },
    mute: function(){

    }

  }
  
  


		
});
