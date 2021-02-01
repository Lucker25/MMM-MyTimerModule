/* global Module */


/* Magic Mirror
 * Module: MyFirstTimerModule
 *
 * By Nico Arbter
 * MIT Licensed.
 * To-Dos: 
 * - store actual Timer state in a file restore when loaded 
 * - touch move to change the timer interval
 * - sound when finished
 *  - via speakers 
 *  - via sonos 
 * jshint esversion: 6
 */

Module.register("MMM-MyTimerModule",{
  // Default module config.
	defaults: {
    alarmSound: "http://soundbible.com/grab.php?id=529&type=mp3",   
    showButtons: false
  },
  state: {
    value: "STOPPED", 
    hours: 1,
    minutes: 2,
    seconds: 3
  },  

	// Define styles.
	getStyles: function() {
		return ["MMM-MyTimerModule.css"];
  },
  	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
    wrapper.className = "moduleDiv";
    wrapper.id = "MyKitchenTimerWrapper";
    //wrapper.appendChild(generateSpan("", "MyTimer", ""));

    var buttonDiv = document.createElement("div");
    buttonDiv.className="buttonDiv";
    buttonDiv.appendChild(this.addStartButton("startButton", "start Timer", "btnClass"));
    buttonDiv.appendChild(this.addStopButton("stopButton", "stop Timer", "btnClass"));
    buttonDiv.appendChild(this.addMuteButton("muteButton", "btnClass")); 
    wrapper.appendChild(buttonDiv); 
    
    var timeDiv = document.createElement("div");
    timeDiv.className="timeDiv";
    timeDiv.id = timeDiv.className; 


    var hoursDiv = document.createElement("div");
    hoursDiv.className="horizontalDiv";
    hoursDiv.id = hoursDiv.className;
    if (this.config.showButtons) hoursDiv.appendChild(this.addButtonIntervalUpDown("hoursUp","btnClass", "hours", "up")); 
    hoursDiv.appendChild(this.addTimeSpan("hours",this.state.hours, "timeDisplay", true));
    if (this.config.showButtons) hoursDiv.appendChild(this.addButtonIntervalUpDown("hoursDown","btnClass", "hours", "down")); 
    this.addTouchMove(hoursDiv, "hours"); 
    timeDiv.appendChild(hoursDiv);

    var minutesDiv = document.createElement("div");
    minutesDiv.className="horizontalDiv";
    minutesDiv.id = minutesDiv.className;
    if (this.config.showButtons) minutesDiv.appendChild(this.addButtonIntervalUpDown("minutesUp","btnClass", "minutes", "up")); 
    minutesDiv.appendChild(this.addTimeSpan("minutes",this.state.minutes, "timeDisplay", true));
    if (this.config.showButtons) minutesDiv.appendChild(this.addButtonIntervalUpDown("minutesDown","btnClass", "minutes", "down")); 
    this.addTouchMove(minutesDiv, "minutes"); 
    timeDiv.appendChild(minutesDiv);


    var secondsDiv = document.createElement("div");
    secondsDiv.className="horizontalDiv";
    secondsDiv.id = secondsDiv.className;
    if (this.config.showButtons) secondsDiv.appendChild(this.addButtonIntervalUpDown("secondsUp","btnClass", "seconds", "up")); 
    secondsDiv.appendChild(this.addTimeIndicator("seconds",this.state.seconds, "timeDisplay", true));
    if (this.config.showButtons) secondsDiv.appendChild(this.addButtonIntervalUpDown("secondsDown","btnClass", "seconds", "down")); 
    this.addTouchMove(secondsDiv, "seconds"); 
    timeDiv.appendChild(secondsDiv);
    


    wrapper.appendChild(timeDiv); 
    
    console.log(wrapper);
		return wrapper;
  },
  start: function() {
    let that = this; 
    Log.info("Starting module: " + this.name);   
    setTimeout(function(){
      that.updateGraphics();
      that.sendSocketNotification("getState", "")
    },0);
    
  },
  socketNotificationReceived: function (notification, payload) {
    if (notification == "LOG"){
      console.warn("SERVER LOG", payload)
    }
    if (notification == "sendState"){
      this.state = payload; 
      this.updateGraphics(); 
    }
	},

  timeIndicator: {},

  //---------------------------------------------- set server state
  setServerState(value){
    let that = this; 
    that.state.value = value; 
    that.sendSocketNotification("setState", that.state)
  },
  //---------------------------------------------- Graphic Functions
  updateGraphics: function(){
    for(var span in this.timeIndicator) 
      this.timeIndicator[span].innerHTML = addZero(this.state[span]); 

    if(this.state.value === "STOPPED"){
      this.setTimerStopped(); 
    }
    else if(this.state.value === "ENDED"){
      this.setTimerEnded();
    }
    else if (this.state.value === "RUNNING"){
      this.setTimerRunning(); 
    }
    
    function addZero(value){
      return value < 10 ? "0" + value : value;
    }

  },
  setTimerRunning: function(){
    var startButton = document.getElementById("startButton");
    var stopButton = document.getElementById("stopButton");
    var muteButton = document.getElementById("muteButton");
    var buttonsArray = document.getElementById("timeDiv").getElementsByClassName("btnClass"); 
    var el; 
    for (el in buttonsArray){
      buttonsArray[el].disabled = true;
    }
    startButton.disabled = true;
    stopButton.disabled = false; 
    muteButton.disabled = true;
  },
  setTimerStopped: function(){
    var startButton = document.getElementById("startButton");
    var stopButton = document.getElementById("stopButton");
    var muteButton = document.getElementById("muteButton");
    var buttonsArray = document.getElementById("timeDiv").getElementsByClassName("btnClass"); 
    var el; 
    for (el in buttonsArray){
      buttonsArray[el].disabled = false;
    }
    startButton.disabled = false; 
    stopButton.disabled = true;
    muteButton.disabled = true; 
  },
  setTimerEnded: function(){
    var startButton = document.getElementById("startButton");
    var stopButton = document.getElementById("stopButton");
    var muteButton = document.getElementById("muteButton");

    startButton.disabled = true; 
    stopButton.disabled = true;
    muteButton.disabled = false; 

  }, 
  addStartButton: function(id, content, className){
    let that = this; 
    var button =this._addButton(id, content, className); 
    button.addEventListener("click", function(e){
      that.setServerState("START") 
    });
    var image = document.createElement("i");    
    button.innerHTML = ""; 
    image.className = "fas fa-play-circle";
    button.appendChild(image); 
    return button; 
  },
  addStopButton: function(id, content, className){
    var button =this._addButton(id, content, className); 
    button.addEventListener("click", function(e){
      that.setServerState("STOP") 
    });
    var image = document.createElement("i");    
    button.innerHTML = ""; 
    image.className = "fas fa-pause-circle";
    button.appendChild(image); 
    button.disabled = true; 
    return button; 
  },
  _addButton: function(id, content, className){
    var button = document.createElement("button");
    if (id != "")
      button.id = id;
  
    if (className!= "")
      button.className = className; 
    
    button.innerHTML = content; 
    return button; 
  },
  addTimeSpan: function(id, content, className){
    var div = document.createElement("div"); 
    div.id= id; 
    div.className = className; 
    div.appendChild(this.addTimeIndicator(id, content, className)); 
    div.appendChild(this.addDoublePoint(className)); 
    
    return div; 

  },
  addTimeIndicator: function(id, content, className){
    var span = document.createElement("span"); 
    span.id= id; 
    span.className = className;  
    span.innerHTML = content;     
    this.timeIndicator[id] = span; 
    return span; 
  }, 
  addDoublePoint: function(className){
    var span = document.createElement("span"); 
    span.className = className;  
    span.innerHTML = ":"; 
    return span; 
  }, 
  addButtonIntervalUpDown: function(id, className, unit, dir){


    var button =this._addButton(id, dir, className); 
    button.addEventListener("click", function(){
      //intTimer.changeInterval(unit, dir);
    });
    var image = document.createElement("i"); 

    if (dir == "up"){
      button.innerHTML = ""; 
      image.className = "fas fa-arrow-up";
    }
    else if (dir =="down"){
      button.innerHTML = ""; 
      image.className = "fas fa-arrow-down";
    }
    
    
    button.appendChild(image); 
    return button; 

  },
  addMuteButton: function(id, className){
    var button=this._addButton(id, "mute", className);
    //button.addEventListener("click", intTimer.audio.stop); 
    var image = document.createElement("i");    
    button.innerHTML = ""; 
    image.className = "fas fa-volume-mute";
    button.appendChild(image); 
    button.disabled =true; 
    return button; 
  }, 
  addTouchMove: function(element, unit){
    let that = this; 
    element.addEventListener("touchmove", function(e){
      if (that.state.value !== "RUNNING"){
        var actRatio = e.changedTouches[0].clientY/window.innerHeight;
        var value = Math.floor((actRatio) *59); 
        console.log(actRatio, value); 
        that.state[unit] = that.checkLimits(value); 
        that.updateGraphics(); 
        //intTimer.setInterval(value, unit);
      }
    });
  },
  checkLimits: function(value){
    if (value > 59)
      value = 59;
    if (value <0)
      value = 0;
    return value; 
  }
});
 
