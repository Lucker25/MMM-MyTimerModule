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
var timer = new timerModule(); 


Module.register("MMM-MyTimerModule",{
  
	// Default module config.
	defaults: {
    alarmSound: "http://soundbible.com/grab.php?id=529&type=mp3", 
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
    wrapper.id = "MyKitchenTimerWrapper";
    //wrapper.appendChild(generateSpan("", "MyTimer", ""));

    var buttonDiv = document.createElement("div");
    buttonDiv.className="buttonDiv";
    buttonDiv.appendChild(timer.graphics.addStartButton("startButton", "start Timer", "btnClass"));
    buttonDiv.appendChild(timer.graphics.addStopButton("stopButton", "stop Timer", "btnClass"));
    buttonDiv.appendChild(timer.graphics.addMuteButton("muteButton", "btnClass")); 
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
    timer.graphics.addTouchMove(hoursDiv, "hours"); 
    timeDiv.appendChild(hoursDiv);

    var minutesDiv = document.createElement("div");
    minutesDiv.className="horizontalDiv";
    minutesDiv.id = minutesDiv.className;
    minutesDiv.appendChild(timer.graphics.addButtonIntervalUpDown("minutesUp","btnClass", "minutes", "up")); 
    minutesDiv.appendChild(timer.graphics.addTimeSpan("minutes",timer.interval.minutes, "timeDisplay", true));
    minutesDiv.appendChild(timer.graphics.addButtonIntervalUpDown("minutesDown","btnClass", "minutes", "down")); 
    timer.graphics.addTouchMove(minutesDiv, "minutes"); 
    timeDiv.appendChild(minutesDiv);


    var secondsDiv = document.createElement("div");
    secondsDiv.className="horizontalDiv";
    secondsDiv.id = secondsDiv.className;
    secondsDiv.appendChild(timer.graphics.addButtonIntervalUpDown("secondsUp","btnClass", "seconds", "up")); 
    secondsDiv.appendChild(timer.graphics.addTimeIndicator("seconds",timer.interval.seconds, "timeDisplay", true));
    secondsDiv.appendChild(timer.graphics.addButtonIntervalUpDown("secondsDown","btnClass", "seconds", "down")); 
    timer.graphics.addTouchMove(secondsDiv, "seconds"); 
    timeDiv.appendChild(secondsDiv);
    


    wrapper.appendChild(timeDiv); 
    
    console.log(wrapper);
    intTimer.graphics.update();
		return wrapper;
  },
  start: function() {
    Log.info("Starting module: " + this.name);
    timer.audio.alarmSound = this.config.alarmSound;   
    
    
  },
    
    
});

 function timerModule(){
  intTimer = this,
  this.id = "",
  this.interval = {
    hours: 0, 
    minutes: 0,
    seconds: 3
  },
  this.duration = 0, 
  intTimer.timeIndicator = {},
  this.start = function () {
    intTimer.duration = (intTimer.interval.hours * 3600) + (intTimer.interval.minutes*60)+intTimer.interval.seconds;
    if (intTimer.duration == 0 || intTimer.id != "") return; 
    intTimer.graphics.setTimerRunning(); 
    intTimer.id = setInterval(function(){
      intTimer.tick(); 
      if (intTimer.duration <= 0){
        intTimer._end(); 
        
      }
    }, 1000); 
    console.log("start timer", intTimer.id, intTimer.interval); 
  },
  this.tick = function(){
      intTimer.duration--; 
      intTimer.interval.hours = parseInt(intTimer.duration /(60*60), 10);
      intTimer.interval.minutes = parseInt((intTimer.duration/60)%60, 10);
      intTimer.interval.seconds = parseInt(intTimer.duration % 60, 10);
      intTimer.graphics.update(); 

  },
  this._end = function(){
    console.log("timer ended");
    intTimer.graphics.setTimerEnded();
    var tempID = intTimer.id; 
    intTimer.id = ""; 
    intTimer.audio.play(); 
    
    clearInterval(tempID); 

  },
  this.pause= function () {
    
  },
  this.stop = function () { 
    console.log("stop timer", intTimer.id);
    clearInterval(intTimer.id);
    intTimer.id = ""; 
    intTimer.graphics.setTimerStopped(); 
  },
  this.setTimer = function(hours, minutes, seconds){
    intTimer.interval.hours = hours; 
    intTimer.interval.minutes = minutes; 
    intTimer.interval.seconds = seconds; 
    intTimer.graphics.update();
  },
  this.changeInterval = function(unit, dir){
    console.log(unit, dir); 
    if (dir == "up"){
      if (intTimer.interval[unit]<59)
        intTimer.interval[unit] += 1; 
      else
        intTimer.interval[unit] = 0;
    }
    else if(dir =="down"){
      if (intTimer.interval[unit]>0)
        intTimer.interval[unit] -= 1; 
      else
        intTimer.interval[unit] = 59; 
    }
    else 
      console.log(dir +" is wrong"); 
    
  //  intTimer.correctInterval(); 
    intTimer.graphics.update(); 
  },
  this.correctInterval = function(){
    if (intTimer.interval.seconds >59){
      intTimer.interval.seconds = 0; 
      intTimer.interval.minutes++; 
    }
    if (intTimer.interval.minutes >59){
      intTimer.interval.minutes = 0; 
      intTimer.interval.hours++; 
    }
    

  },
  this.setInterval = function(value, unit){
    console.log(value, unit); 
    if (value >= 0 && value <= 59)
    intTimer.interval[unit] = value; 
    intTimer.graphics.update(); 
  },
  //---------------------------------------------- Graphic Functions
  this.graphics = {
    update: function(){
      for(var span in intTimer.timeIndicator) 
        intTimer.timeIndicator[span].innerHTML = addZero(intTimer.interval[span]); 
      
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
      var button =intTimer.graphics._addButton(id, content, className); 
      button.addEventListener("click", intTimer.start);
      var image = document.createElement("i");    
      button.innerHTML = ""; 
      image.className = "fas fa-play-circle";
      button.appendChild(image); 
      return button; 
    },
    addStopButton: function(id, content, className){
      var button =intTimer.graphics._addButton(id, content, className); 
      button.addEventListener("click", intTimer.stop);
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
      intTimer.timeIndicator[id] = span; 
      return span; 
    }, 
    addDoublePoint: function(className){
      var span = document.createElement("span"); 
      span.className = className;  
      span.innerHTML = ":"; 
      return span; 
    }, 
    addButtonIntervalUpDown: function(id, className, unit, dir){
      var button =intTimer.graphics._addButton(id, dir, className); 
      button.addEventListener("click", function(){
        intTimer.changeInterval(unit, dir);
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
      var button=intTimer.graphics._addButton(id, "mute", className);
      button.addEventListener("click", intTimer.audio.stop); 
      var image = document.createElement("i");    
      button.innerHTML = ""; 
      image.className = "fas fa-volume-mute";
      button.appendChild(image); 
      button.disabled =true; 
      return button; 
    }, 
    addTouchMove: function(element, unit){
      element.addEventListener("touchmove", function(e){
        
        if (intTimer.id == ""){
          var actRatio = e.changedTouches[0].clientY/window.innerHeight;
          var value = Math.floor((actRatio) *59); 
          console.log(actRatio, value); 
          intTimer.setInterval(value, unit);
        }
      });
    }
  }, 
  this.audio = {
    active: false,
    alarmSound: "",
    play: function(){
      var wrapper = document.getElementById('MyKitchenTimerWrapper');
      var audio = document.createElement("audio");

      var srcAudio = this.alarmSound; //"http://soundbible.com/grab.php?id=529&type=mp3"; //"http://soundbible.com/grab.php?id=2061&type=mp3"; //"modules/MMM-KitchenTimer/TimerAlarm.mp3";
      audio.src = srcAudio;
      audio.volume = 1;
      audio.setAttribute('id', 'MyKitchenTimerSound');
      audio.setAttribute('autoplay', true);
      audio.setAttribute('loop', true);
      intTimer.audio.active = true; 
      wrapper.appendChild(audio);
    },
    stop: function(){
      if(intTimer.audio.active){
        document.getElementById('MyKitchenTimerSound').remove();
        intTimer.graphics.setTimerStopped();  
        intTimer.audio.active = false; 
      }
    }
  };
} 
