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

Module.register("MMM-MyTimerModule", {
  // Default module config.
  defaults: {
    alarmSound: '/home/pi/MagicMirror/alarmSound.mp3', // '/home/pi/MagicMirror/alarmSound.mp3'
    showButtons: false,
    sayButton1: {
      show: false, 
      text: "Der Timer ist zu Ende",
      icon: "fas fa-hourglass"
    },
    sayButton2: {
      show: false, 
      text: "Das Essen ist fertig",
      icon: "fas fa-cookie-bite"
    },
    sayButton3: {
      show: false, 
      text: "Zeit für Feierabend",
      icon: "fas fa-laptop-house"
    },
    sayServer: {
      url: ""
    }
  },
  state: {
    value: "STOPPED",
    hours: 1,
    minutes: 2,
    seconds: 3
  },

  // Define styles.
  getStyles: function () {
    return ["MMM-MyTimerModule.css"];
  },
  // Override dom generator.
  getDom: function () {
    var wrapper = document.createElement("div");
    wrapper.className = "moduleDiv";
    wrapper.id = "MyKitchenTimerWrapper";
    //wrapper.appendChild(generateSpan("", "MyTimer", ""));
    var timerDiv = document.createElement("div");
    timerDiv.className = "timerDiv";
    var buttonDiv = document.createElement("div");
    buttonDiv.className = "buttonDiv";
    buttonDiv.appendChild(
      this.addStartButton("startButton", "start Timer", "btnClass")
    );
    buttonDiv.appendChild(
      this.addStopButton("stopButton", "stop Timer", "btnClass")
    );
    buttonDiv.appendChild(this.addMuteButton("muteButton", "btnClass"));
    timerDiv.appendChild(buttonDiv);

    var timeDiv = document.createElement("div");
    timeDiv.className = "timeDiv";
    timeDiv.id = timeDiv.className;

    var hoursDiv = document.createElement("div");
    hoursDiv.className = "horizontalDiv";
    hoursDiv.id = hoursDiv.className;
    if (this.config.showButtons)
      hoursDiv.appendChild(
        this.addButtonIntervalUpDown("hoursUp", "btnClass", "hours", "up")
      );
    hoursDiv.appendChild(
      this.addTimeSpan("hours", this.state.hours, "timeDisplay", true)
    );
    if (this.config.showButtons)
      hoursDiv.appendChild(
        this.addButtonIntervalUpDown("hoursDown", "btnClass", "hours", "down")
      );
    this.addTouchMove(hoursDiv, "hours");
    this.addScrollWheel(hoursDiv, "hours");
    timeDiv.appendChild(hoursDiv);

    var minutesDiv = document.createElement("div");
    minutesDiv.className = "horizontalDiv";
    minutesDiv.id = minutesDiv.className;
    if (this.config.showButtons)
      minutesDiv.appendChild(
        this.addButtonIntervalUpDown("minutesUp", "btnClass", "minutes", "up")
      );
    minutesDiv.appendChild(
      this.addTimeSpan("minutes", this.state.minutes, "timeDisplay", true)
    );
    if (this.config.showButtons)
      minutesDiv.appendChild(
        this.addButtonIntervalUpDown(
          "minutesDown",
          "btnClass",
          "minutes",
          "down"
        )
      );
    this.addTouchMove(minutesDiv, "minutes");
    this.addScrollWheel(minutesDiv, "minutes");
    timeDiv.appendChild(minutesDiv);

    var secondsDiv = document.createElement("div");
    secondsDiv.className = "horizontalDiv";
    secondsDiv.id = secondsDiv.className;
    if (this.config.showButtons)
      secondsDiv.appendChild(
        this.addButtonIntervalUpDown("secondsUp", "btnClass", "seconds", "up")
      );
    secondsDiv.appendChild(
      this.addTimeSpan("seconds", this.state.seconds, "timeDisplay", true)
    );
    if (this.config.showButtons)
      secondsDiv.appendChild(
        this.addButtonIntervalUpDown(
          "secondsDown",
          "btnClass",
          "seconds",
          "down"
        )
      );
    this.addTouchMove(secondsDiv, "seconds");
    this.addScrollWheel(secondsDiv, "seconds")
    timeDiv.appendChild(secondsDiv);

    timerDiv.appendChild(timeDiv);
    wrapper.appendChild(timerDiv);
    var sayButtondiv = document.createElement("div");
    sayButtondiv.className = "secondRow";
    if (!(this.config.sayButton1.show && this.config.sayButton2.show && this.config.sayButton3.show)){
      sayButtondiv.className = "secondRow noIcons";
    }
    sayButtondiv.id = sayButtondiv.className;
    if (this.config.sayButton1.show){
      sayButtondiv.appendChild(
        this.addSayButton(
          "sayButton1",
          this.config.sayButton1.text,
          "btnClass",
          this.config.sayButton1.icon
        )
      );
    }
    if (this.config.sayButton2.show){
      sayButtondiv.appendChild(
        this.addSayButton(
          "sayButton2",
          this.config.sayButton2.text,
          "btnClass",
          this.config.sayButton2.icon
        )
      );
    }
    if (this.config.sayButton3.show){
      sayButtondiv.appendChild(
        this.addSayButton(
          "sayButton3",
          this.config.sayButton3.text,
          "btnClass",
          this.config.sayButton3.icon
        )
      );
    }
    wrapper.appendChild(sayButtondiv);
    return wrapper;
  },
  start: function () {
    let that = this;
    Log.info("Starting module: " + this.name);
    setTimeout(function () {
      that.updateGraphics();
      that.sendSocketNotification("getState", "");
    }, 0);
  },
  socketNotificationReceived: function (notification, payload) {
    if (notification == "LOG") {
      console.warn("SERVER LOG", payload);
    }
    if (notification == "sendState") {
      
      var that = this; 
      console.log("sendStateNotifyer", payload, that.state); 
      that.state = payload;
      clearInterval(that.localTimer); 
      that.localCounter = this.state.duration
      if (this.state.value == "RUNNING"){
        console.log("current State:", that)
        
        tick(); 
        this.localTimer = setInterval(function(){   
          that.localCounter--;
          console.log("------------------------------")
          tick();
        }, 1000)
      }
      else{
        tick(); 
        
      }

    this.updateGraphics();
    }
    /*if(notification == "PLAYALARMSOUND"){
      this.playAlarmSound(); 
    }*/
    if(notification == "MUTEALL"){
      console.log("MUTEALL")
      this.muteAll(); 
    }

    function tick(){
      that.state.hours = parseInt(that.localCounter / (60 * 60), 10);
      that.state.minutes = parseInt((that.localCounter / 60) % 60, 10);
      that.state.seconds = parseInt(that.localCounter % 60, 10);
      that.updateGraphics();
      if (that.localCounter <= 0 && that.state.value == "RUNNING") {
        that.playAlarmSound(); 
        that.state.value = "ENDED"; 
        that.updateGraphics();
        clearInterval(that.localTimer); 
      }
    }
    
  },
  timeIndicator: {},
  //---------------------------------------------- set server state
  setServerState(value) {
    let that = this;
    that.state.value = value;
    that.sendSocketNotification("setState", that.state);
  },
  //---------------------------------------------- Graphic Functions
  muteAll: function(){
    let wrapper = document.getElementById('MyKitchenTimerWrapper'); 
    if(wrapper.querySelector("#MyKitchenTimerSound")) 
      wrapper.removeChild(wrapper.querySelector("#MyKitchenTimerSound"));  
  }, 
  updateGraphics: function () {
    for (var span in this.timeIndicator)
      this.timeIndicator[span].innerHTML = addZero(this.state[span]);

    if (this.state.value === "STOPPED") {
      this.setTimerStopped();
    } else if (this.state.value === "ENDED") {
      this.setTimerEnded();
    } else if (this.state.value === "RUNNING") {
      this.setTimerRunning();
    }

    function addZero(value) {
      return value < 10 ? "0" + value : value;
    }
  },
  setTimerRunning: function () {
    var startButton = document.getElementById("startButton");
    var stopButton = document.getElementById("stopButton");
    var muteButton = document.getElementById("muteButton");
    var buttonsArray = document
      .getElementById("timeDiv")
      .getElementsByClassName("btnClass");
    var el;
    for (el in buttonsArray) {
      buttonsArray[el].disabled = true;
    }
    startButton.disabled = true;
    stopButton.disabled = false;
    muteButton.disabled = true;
  },
  setTimerStopped: function () {
    var startButton = document.getElementById("startButton");
    var stopButton = document.getElementById("stopButton");
    var muteButton = document.getElementById("muteButton");
    var buttonsArray = document
      .getElementById("timeDiv")
      .getElementsByClassName("btnClass");
    var el;
    for (el in buttonsArray) {
      buttonsArray[el].disabled = false;
    }
    startButton.disabled = false;
    stopButton.disabled = true;
    muteButton.disabled = true;
  },
  setTimerEnded: function () {
    var startButton = document.getElementById("startButton");
    var stopButton = document.getElementById("stopButton");
    var muteButton = document.getElementById("muteButton");

    startButton.disabled = true;
    stopButton.disabled = true;
    muteButton.disabled = false;
  },
  addStartButton: function (id, content, className) {
    let that = this;
    var button = this._addButton(id, content, className);
    button.addEventListener("click", function (e) {
      that.setServerState("START");
    });
    var image = document.createElement("i");
    button.innerHTML = "";
    image.className = "fas fa-play-circle";
    button.appendChild(image);
    return button;
  },
  addStopButton: function (id, content, className) {
    let that = this;
    var button = this._addButton(id, content, className);
    button.addEventListener("click", function (e) {
      that.setServerState("STOP");
    });
    var image = document.createElement("i");
    button.innerHTML = "";
    image.className = "fas fa-pause-circle";
    button.appendChild(image);
    button.disabled = true;
    return button;
  },
  _addButton: function (id, content, className) {
    var button = document.createElement("button");
    if (id != "") button.id = id;

    if (className != "") button.className = className;

    button.innerHTML = content;
    return button;
  },
  addTimeSpan: function (id, content, className) {
    var div = document.createElement("div");
    div.id = id;
    div.className = className;
    div.appendChild(this.addTimeIndicator(id, content, className));
    if (id != "seconds") div.appendChild(this.addDoublePoint(className));

    return div;
  },
  addTimeIndicator: function (id, content, className) {
    var span = document.createElement("span");
    span.id = id;
    span.className = className;
    span.innerHTML = content;
    this.timeIndicator[id] = span;
    return span;
  },
  addDoublePoint: function (className) {
    var span = document.createElement("span");
    span.className = className;
    span.innerHTML = ":";
    return span;
  },
  addButtonIntervalUpDown: function (id, className, unit, dir) {
    var button = this._addButton(id, dir, className);
    button.addEventListener("click", function () {
      //intTimer.changeInterval(unit, dir);
    });
    var image = document.createElement("i");

    if (dir == "up") {
      button.innerHTML = "";
      image.className = "fas fa-arrow-up";
    } else if (dir == "down") {
      button.innerHTML = "";
      image.className = "fas fa-arrow-down";
    }

    button.appendChild(image);
    return button;
  },
  addSayButton: function (id, content, className, icon) {
    let that = this;
    var button = this._addButton(id, content, className);
    button.addEventListener("click", function (e) {
      that.setSayText(content);
    });
    var image = document.createElement("i");
    button.innerHTML = "";
    image.className = icon;
    button.appendChild(image);
    return button;
  },
  addMuteButton: function (id, className) {
    let that = this;
    var button = this._addButton(id, "mute", className);
    button.addEventListener("click", function (e) {
      that.muteAll(); 
      that.setServerState("MUTE");
    });
    var image = document.createElement("i");
    button.innerHTML = "";
    image.className = "fas fa-volume-mute";
    button.appendChild(image);
    button.disabled = true;
    return button;
  },
  addTouchMove: function (element, unit) {
    let that = this;
    let lastY = 0;
    element.addEventListener("touchmove", function (e) {
      if (that.state.value == "STOPPED") {
        var currentY = e.changedTouches[0].clientY;
        tempState = that.state[unit];
        if (currentY > lastY + 8) {
          tempState--;
          that.state[unit] = that.checkLimits(tempState);
          lastY = currentY;
        } else if (currentY < lastY - 8) {
          tempState++;
          that.state[unit] = that.checkLimits(tempState);
          lastY = currentY;
        }

        that.updateGraphics();
      }
    });
  },
  addScrollWheel: function(element, unit){
    let that = this;
    let lastY = 0;
    element.addEventListener("wheel", function (e) {
      if (that.state.value == "STOPPED") {
        tempState = that.state[unit];
        console.log(e)
        if(e.deltaY > 0){
          tempState--;
          that.state[unit] = that.checkLimits(tempState);

        }
        else{
          tempState++;
          that.state[unit] = that.checkLimits(tempState);

        }
        that.updateGraphics();
      }
    });
  }, 
  checkLimits: function (value) {
    if (value > 59) value = 59;
    if (value < 0) value = 0;
    return value;
  },
  setSayText: function (content) {
    this.sendSocketNotification("setText", content);
  },
  playAlarmSound: function(){
    console.log("ALARMSOUND PLAY")
    var wrapper = document.getElementById('MyKitchenTimerWrapper');
    while (wrapper.querySelector("#MyKitchenTimerSound")) {
      wrapper.removeChild(wrapper.querySelector("#MyKitchenTimerSound"));
    }
    var audio = document.createElement("audio");

    //var srcAudio = //"http://soundbible.com/grab.php?id=2197&type=mp3"; //"/modules/MMM-KitchenTimer/alarmSound.mp3//" //this.config.alarmSound; //"http://soundbible.com/grab.php?id=529&type=mp3"; //"http://soundbible.com/grab.php?id=2061&type=mp3"; //"modules/MMM-KitchenTimer/alarmSound.mp3";
    //Load the sound file (using a source element for expandability)
    var src = document.createElement("source");
    src.src = "./modules/MMM-MyTimerModule/AlarmSounds/alarmSound1.1.mp3"
    audio.appendChild(src);

    //audio.src = srcAudio;
    audio.load();
    audio.volume = 1;
    audio.setAttribute('id', 'MyKitchenTimerSound');
    audio.setAttribute('autoplay', true);
    audio.setAttribute('loop', true);

    wrapper.appendChild(audio);
  }
});
