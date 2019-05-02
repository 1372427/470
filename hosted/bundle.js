"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#domoMessage").animate({ width: 'toggle' }, 350);
};

var sendAjax = function sendAjax(action, data) {
  $.ajax({
    cache: false,
    type: "POST",
    url: action,
    data: data,
    dataType: "json",
    success: function success(result, status, xhr) {
      $("#domoMessage").animate({ width: 'hide' }, 350);

      window.location = result.redirect;
    },
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);

      handleError(messageObj.error);
    }
  });
};

var context = new AudioContext();
var frequency = 440.0;
var type = "sine";
var waves = {
  0: "sine",
  1: "triangle",
  2: "sawtooth",
  3: "square"
};
var duration = 1.0; //time in s
var isOn = false,
    prev = false;
var ringing = 0.5; //time in s
var vol = 1;
var o = void 0,
    g = void 0;

//check for newest tweed
var getUpdates = function getUpdates() {
  $.ajax({
    cache: false,
    type: "GET",
    url: '/updates',
    dataType: "json",
    success: function success(result, status, xhr) {
      //console.dir(result);

      //check if tweed has any info
      if (!result.id) {
        return;
      }

      //check if we already are displaying a tweed with this id
      var added = document.getElementById(result.id);

      //if not, add it
      if (!added) {
        console.log(!added);
        //create new div to hold tweed
        var div = document.createElement('div');
        //add id so we can track if we already have this one
        div.id = result.id;
        div.classList.add('domo');

        //add the user's name
        var user = document.createElement('h3');
        user.textContent = result.name;
        user.classList.add('domoName');

        //add the user's tweed message
        var wave = document.createElement('h3');
        wave.textContent = result.wave;
        var freq = document.createElement('h3');
        freq.textContent = result.freq;
        var dur = document.createElement('h3');
        dur.textContent = result.dur;
        var ring = document.createElement('h3');
        ring.textContent = result.ringing;

        //attach to our new tweed div
        div.appendChild(user);
        div.appendChild(wave);
        div.appendChild(freq);
        div.appendChild(dur);
        div.appendChild(ring);

        //grab domo div
        var list = document.querySelector('#domos').children[0];
        //insert at the top so it's the first displayed
        list.insertBefore(div, list.firstChild);

        //MUSIC

        frequency = parseFloat(result.freq);
        type = waves[parseFloat(result.wave)];
        duration = parseFloat(result.dur) > 900;
        ringing = parseFloat(result.ringing) / 1023;
        vol = parseFloat(result.vol) / 1023;

        /*
                //change on DUR
                if(isOn && !duration){
                  g.gain.exponentialRampToValueAtTime(
                    0.00001, context.currentTime + ringing
                  )
                  isOn=false;
                }
                else if(!isOn && duration){
        
                  o = context.createOscillator();
                  g = context.createGain();
                  o.frequency.value = frequency
                  o.type = type;
                  g.gain.setValueAtTime(vol, context.currentTime);
                  o.connect(g)
                  g.connect(context.destination)
                  o.start(0)
                  isOn=true;
                }
        */
        //    /*
        //change on UPDATE
        if (!duration && g) {
          g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + ringing);
        } else if (duration) {
          if (g) {
            g.gain.exponentialRampToValueAtTime(0.00001, context.currentTime);
            setTimeout(function () {
              o = context.createOscillator();
              g = context.createGain();
              o.frequency.value = frequency;
              o.type = type;
              g.gain.setValueAtTime(vol, context.currentTime);
              o.connect(g);
              g.connect(context.destination);
              o.start(0);
            }, 100);
          }

          o = context.createOscillator();
          g = context.createGain();
          o.frequency.value = frequency;
          o.type = type;
          g.gain.setValueAtTime(vol, context.currentTime);
          o.connect(g);
          g.connect(context.destination);
          o.start(0);
        }
        //*/
        /*
                //DUR as ON/OFF
                if(isOn && !prev && duration){
                  g.gain.exponentialRampToValueAtTime(
                    0.00001, context.currentTime + ringing
                  )
                  isOn=false;
                  prev = true;
                }
                else if(!isOn && !prev && duration){
        
                  o = context.createOscillator();
                  g = context.createGain();
                  o.frequency.value = frequency
                  o.type = type;
                  g.gain.setValueAtTime(vol, context.currentTime);
                  o.connect(g)
                  g.connect(context.destination)
                  o.start(0)
                  isOn=true;
                  prev = true;
                }
                prev = duration;
        */
      }
    },
    error: function error(xhr, status, _error2) {
      var messageObj = JSON.parse(xhr.responseText);

      handleError(messageObj.error);
    }
  });
};

$(document).ready(function () {
  $("#signupForm").on("submit", function (e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
      handleError("RAWR! All fields are required");
      return false;
    }

    if ($("#pass").val() !== $("#pass2").val()) {
      handleError("RAWR! Passwords do not match");
      return false;
    }

    sendAjax($("#signupForm").attr("action"), $("#signupForm").serialize());

    return false;
  });

  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    $("#domoMessage").animate({ width: 'hide' }, 350);

    if ($("#user").val() == '' || $("#pass").val() == '') {
      handleError("RAWR! Username or password is empty");
      return false;
    }

    sendAjax($("#loginForm").attr("action"), $("#loginForm").serialize());

    return false;
  });

  //if on app page
  var tweeds = $('#domos');
  if (tweeds) {
    //poll for updates every 5 seconds
    setInterval(getUpdates, 20);
  }
});
