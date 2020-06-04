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
 */
var timer = new timerModule(); 
Module.register("MMM-MyTimerModule",{

	// Default module config.
	defaults: {
    text: "Hello World!", 
  },
	getTemplate: function () {
		return "MMM-MyTimerModule.njk";
	},

	getTemplateData: function () {
		return this.config;
  },
  getScripts: function() {
		return ["helperScript.js"];
	},
	// Define styles.
	getStyles: function() {
		return ["MMM-MyTimerModule.css"];
  },
  	// Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "moduleDiv";
    //wrapper.appendChild(generateSpan("", "MyTimer", ""));
    var buttonDiv = document.createElement("div");
    buttonDiv.className="buttonDiv";
    buttonDiv.appendChild(timer.graphics.addStartButton("startButton", "start Timer", "btnClass"));
    buttonDiv.appendChild(timer.graphics.addStopButton("stopButton", "stop Timer", "btnClass"));
    wrapper.appendChild(buttonDiv); 
    
    var timeDiv = document.createElement("div");
    timeDiv.className="timeDiv";
    timeDiv.id = timeDiv.className; 


    var hoursDiv = document.createElement("div");
    hoursDiv.className="horizontalDiv";
    hoursDiv.id = hoursDiv.className;
    hoursDiv.appendChild(timer.graphics.addButtonIntervalUpDown("hoursUp","btnClass", "hours", "up")); 
    hoursDiv.appendChild(timer.graphics.addTimeSpan("hours",timer.interval.hours, "timeDisplay", true));
    hoursDiv.appendChild(timer.graphics.addButtonIntervalUpDown("hoursDown","btnClass", "hours", "down")); 
    timeDiv.appendChild(hoursDiv);

    var minutesDiv = document.createElement("div");
    minutesDiv.className="horizontalDiv";
    minutesDiv.id = minutesDiv.className;
    minutesDiv.appendChild(timer.graphics.addButtonIntervalUpDown("minutesUp","btnClass", "minutes", "up")); 
    minutesDiv.appendChild(timer.graphics.addTimeSpan("minutes",timer.interval.minutes, "timeDisplay", true));
    minutesDiv.appendChild(timer.graphics.addButtonIntervalUpDown("minutesDown","btnClass", "minutes", "down")); 
    timeDiv.appendChild(minutesDiv);


    var secondsDiv = document.createElement("div");
    secondsDiv.className="horizontalDiv";
    secondsDiv.id = secondsDiv.className;
    secondsDiv.appendChild(timer.graphics.addButtonIntervalUpDown("secondsUp","btnClass", "seconds", "up")); 
    secondsDiv.appendChild(timer.graphics.addTimeIndicator("seconds",timer.interval.seconds, "timeDisplay", true));
    secondsDiv.appendChild(timer.graphics.addButtonIntervalUpDown("secondsDown","btnClass", "seconds", "down")); 
    timeDiv.appendChild(secondsDiv);

    


    wrapper.appendChild(timeDiv); 
    
    console.log(wrapper);
    tM.graphics.update();
		return wrapper;
  },
  start: function() {
    Log.info("Starting module: " + this.name);

  },
    
    
});

 function timerModule(){
  this.id = "",
  this.interval = {
    hours: 0, 
    minutes: 5,
    seconds: 0,
  },
  this.duration = 0, 
  tM = this,
  tM.timeIndicator = {},
  this.start = function () {
    tM.duration = (tM.interval.hours * 3600) + (tM.interval.minutes*60)+tM.interval.seconds;
    if (tM.duration == 0 || tM.id != "") return; 
    tM.graphics.setTimerRunning(); 
    tM.id = setInterval(function(){
      tM.duration--; 
      tM.interval.hours = parseInt(tM.duration /(60*60), 10);
      tM.interval.minutes = parseInt((tM.duration/60)%60, 10);
      tM.interval.seconds = parseInt(tM.duration % 60, 10);
      tM.graphics.update(); 
      
      if (tM.duration <= 0){
        console.log("timer ended");
        tM.graphics.setTimerStopped();
        clearInterval(tM.id); 
        
      }
    }, 1000); 
    console.log("start timer", tM.id, tM.interval); 
  },
  this.pause= function () {
    
  },
  this.stop = function () { 
    console.log("stop timer", tM.id);
    clearInterval(tM.id);
    tM.id = ""; 
    tM.graphics.setTimerStopped(); 
  },
  this.setTimer = function(hours, minutes, seconds){
    tM.interval.hours = hours; 
    tM.interval.minutes = minutes; 
    tM.interval.seconds = seconds; 
    tM.graphics.update();
  },
  this.changeInterval = function(unit, dir){
    console.log(unit, dir); 
    if (dir == "up"){
      if (tM.interval[unit]<59)
        tM.interval[unit] += 1; 
      else
        tM.interval[unit] = 0;
    }
    else if(dir =="down"){
      if (tM.interval[unit]>0)
        tM.interval[unit] -= 1; 
      else
        tM.interval[unit] = 59; 
    }
    else 
      console.log(dir +" is wrong"); 
    
  //  tM.correctInterval(); 
    tM.graphics.update(); 
  },
  this.correctInterval = function(){
    if (tM.interval.seconds >59){
      tM.interval.seconds = 0; 
      tM.interval.minutes++; 
    }
    if (tM.interval.minutes >59){
      tM.interval.minutes = 0; 
      tM.interval.hours++; 
    }
    

  };
  //---------------------------------------------- Graphic Functions
  this.graphics = {
    update: function(){
      for(var span in tM.timeIndicator) 
        tM.timeIndicator[span].innerHTML = addZero(tM.interval[span]); 
      
      function addZero(value){
        return value < 10 ? "0" + value : value;
      }

    },
    setTimerRunning: function(){
      var startButton = document.getElementById("startButton");
      var stopButton = document.getElementById("stopButton");
      var buttonsArray = document.getElementById("timeDiv").getElementsByClassName("btnClass"); 
      var el; 
      for (el in buttonsArray){
        buttonsArray[el].disabled = true;
      }
      startButton.disabled = true;
      stopButton.disabled = false; 
    },
    setTimerStopped: function(){
      var startButton = document.getElementById("startButton");
      var stopButton = document.getElementById("stopButton");
      var buttonsArray = document.getElementById("timeDiv").getElementsByClassName("btnClass"); 
      var el; 
      for (el in buttonsArray){
        buttonsArray[el].disabled = false;
      }
      startButton.disabled = false; 
      stopButton.disabled = true; 
    },
    addStartButton: function(id, content, className){
      var button =tM.graphics._addButton(id, content, className); 
      button.addEventListener("click", tM.start);
      var image = document.createElement("i");    
      button.innerHTML = ""; 
      image.className = "fas fa-play-circle";
      button.appendChild(image); 
      return button; 
    },
    addStopButton: function(id, content, className){
      var button =tM.graphics._addButton(id, content, className); 
      button.addEventListener("click", tM.stop);
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
      div.appendChild(timer.graphics.addTimeIndicator(id, content, className)); 
      div.appendChild(timer.graphics.addDoublePoint(className)); 
      return div; 

    },
    addTimeIndicator: function(id, content, className){
      var span = document.createElement("span"); 
      span.id= id; 
      span.className = className;  
      span.innerHTML = content; 
      
      tM.timeIndicator[id] = span; 
      return span; 
    }, 
    addDoublePoint: function(className){
      var span = document.createElement("span"); 
      span.className = className;  
      span.innerHTML = ":"; 
      return span; 
    }, 
    addButtonIntervalUpDown: function(id, className, unit, dir){
      var button =tM.graphics._addButton(id, dir, className); 
      button.addEventListener("click", function(){
        tM.changeInterval(unit, dir);
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
  };
} 