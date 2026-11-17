var roomNo = 0, inv = [], sel = null, f = {}, notes = [], seconds = 0, hints = 0, hintNo = [0,0,0,0], clock = null, best = null;
var ITEMS = {
  match: ["🔥","Matches"], rusty: ["🗝️","Rusty Key"], brass: ["🔑","Brass Key"],
  gear: ["⚙️","Gear"], silver: ["🔑","Silver Key"], gold: ["🏆","Golden Key"], wrench: ["🔧","Wrench"], iron: ["🗝️","Iron Key"]
};
function $(id){ return document.getElementById(id); }
function val(x){ return typeof x === "function" ? x() : x; }
function say(t){ $("message").textContent = t; }
function has(i){ return inv.indexOf(i) > -1; }
function give(i){ inv.push(i); sel = null; beep(660); drawBag(); }
function take(i){ inv.splice(inv.indexOf(i), 1); sel = null; drawBag(); }
function note(t){ if(notes.indexOf(t) < 0){ notes.push(t); } drawBag(); say("📓 Noted: " + t); beep(520); }
function showScreen(id){ var s = document.querySelectorAll(".screen"); for(var i=0;i<s.length;i++) s[i].classList.remove("active"); $(id).classList.add("active"); }

// small sound effect
var ac = null;
function beep(freq){
  try{ ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    var o = ac.createOscillator(), g = ac.createGain();
    o.frequency.value = freq; g.gain.value = .06; o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + .12); }catch(e){}
}

function drawBag(){
  var h = "🎒 <b>Bag</b><br>";
  if(!inv.length) h += "<i>empty</i>";
  for(var i=0;i<inv.length;i++){ h += "<span class='chip" + (sel===inv[i]?" sel":"") + "' data-i='" + inv[i] + "'>" + ITEMS[inv[i]][0] + " " + ITEMS[inv[i]][1] + "</span>"; }
  $("inv").innerHTML = h;
  var chips = $("inv").querySelectorAll(".chip");
  for(var j=0;j<chips.length;j++) chips[j].onclick = function(){ sel = (sel===this.dataset.i) ? null : this.dataset.i; drawBag(); say(sel ? "Selected: " + ITEMS[sel][1] + ". Now click an object." : "Item deselected."); };
  var n = "📓 <b>Notes</b><br>";
  if(!notes.length) n += "<i>nothing yet</i>";
  for(var k=0;k<notes.length;k++) n += "• " + notes[k] + "<br>";
  $("notes").innerHTML = n;
}

//  Popup builder 
function openModal(title, build){ $("mTitle").textContent = title; $("mBody").innerHTML = ""; build($("mBody")); $("modal").classList.add("show"); }
function closeModal(){ $("modal").classList.remove("show"); }
function wrong(el){ el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); beep(180); }

// Puzzle type 1: riddle with typed answer
function riddle(title, q, answers, win){
  openModal(title, function(b){
    b.innerHTML = "<p>" + q + "</p><input id='ans' placeholder='Your answer' autocomplete='off'><div class='fb'></div><button id='go'>Submit</button>";
    function check(){
      var t = $("ans").value.trim().toLowerCase();
      if(answers.indexOf(t) > -1){ closeModal(); beep(880); win(); }
      else { b.querySelector(".fb").textContent = "That’s not right. Think again!"; wrong($("ans")); }
    }
    $("go").onclick = check;
    $("ans").onkeydown = function(e){ if(e.key === "Enter") check(); };
  });
}

// Puzzle type 2: press things in the right order
function orderPuzzle(title, text, opts, target, win){
  openModal(title, function(b){
    var pressed = [];
    b.innerHTML = "<p>" + text + "</p><div class='pad'></div><div class='seq'></div><div class='fb'></div>";
    var pad = b.querySelector(".pad"), seq = b.querySelector(".seq");
    opts.forEach(function(o){
      var btn = document.createElement("button");
      btn.textContent = o.t; btn.style.background = o.c;
      btn.onclick = function(){
        pressed.push(o.id); seq.textContent += o.t + " "; beep(o.f);
        var ok = pressed.every(function(p, i){ return p === target[i]; });
        if(!ok){ b.querySelector(".fb").textContent = "Wrong order! Start again."; wrong(pad); pressed = []; seq.textContent = ""; }
        else if(pressed.length === target.length){ closeModal(); beep(880); win(); }
      };
      pad.appendChild(btn);
    });
  });
}

// Puzzle type 4: number dial lock
function dial(title, text, code, win){
  openModal(title, function(b){
    var d = code.split("").map(function(){ return 0; });
    b.innerHTML = "<p>" + text + "</p><div class='dial'></div><div class='fb'></div><button id='try'>Open</button>";
    var box = b.querySelector(".dial");
    function draw(){
      box.innerHTML = "";
      d.forEach(function(v, i){
        var col = document.createElement("div");
        var up = document.createElement("button"), dn = document.createElement("button"), sp = document.createElement("span");
        up.textContent = "▲"; dn.textContent = "▼"; sp.textContent = v;
        up.onclick = function(){ d[i] = (d[i]+1)%10; beep(300); draw(); };
        dn.onclick = function(){ d[i] = (d[i]+9)%10; beep(300); draw(); };
        col.appendChild(up); col.appendChild(sp); col.appendChild(dn); box.appendChild(col);
      });
    }
    draw();
    $("try").onclick = function(){
      if(d.join("") === code){ closeModal(); beep(880); win(); }
      else { b.querySelector(".fb").textContent = "Click… nothing happens."; wrong(box); }
    };
  });
}


// extra stuff for Room 1 digit note
function deskRiddle(){
  riddle("The Desk Drawer", "A card inside reads: ‘I have keys but no locks. I have space but no room. You can enter, but never go outside. What am I?’",
    ["keyboard","a keyboard","the keyboard"],
    function(){ give("brass"); note("Desk drawer digit: 4"); f.deskOpen = 0; f.deskDone = 1; say("The drawer opens. A brass key and the number 4!"); });
}

//  Drawing a room 
function drawRoom(){
  var room = rooms[roomNo], area = $("room");
  var old = area.querySelectorAll(".item");
  for(var i=0;i<old.length;i++) area.removeChild(old[i]);
  area.style.background = room.bg;
  $("roomTitle").textContent = room.name;
  $("dark").style.display = (roomNo === 2) ? "block" : "none";
  objs[roomNo].forEach(function(o){
    var b = document.createElement("button");
    b.className = "item" + (o.glow && o.glow() ? " glow" : "");
    b.innerHTML = o.e + "<small>" + val(o.l) + "</small>";
    b.style.left = o.x + "%"; b.style.top = o.y + "%";
    b.onclick = function(){
      if(sel && o.use && sel === o.use.item){ o.use.fn(); }
      else if(sel){ say("The " + ITEMS[sel][1] + " doesn’t work on that."); beep(180); }
      else o.click();
    };
    area.insertBefore(b, $("dark"));
  });
}

function nextRoom(){
  $("fade").classList.add("on"); beep(440);
  setTimeout(function(){
    roomNo++; sel = null; drawBag(); drawRoom();
    say(roomNo === 1 ? "A ticking fills the air. You are in the Clock Room." : roomNo === 2 ? "Pitch black… move your light around to find your way." : "A cold, bright vault. The exit must be close.");
    $("fade").classList.remove("on");
  }, 550);
}

//  Game flow 
function startGame(){
  roomNo = 0; inv = []; sel = null; f = {}; notes = []; seconds = 0; hints = 0; hintNo = [0,0,0,0];
  showScreen("game"); drawBag(); drawRoom();
  say("You wake in a dusty library. The door is locked and the room is dim. Click things to explore.");
  clearInterval(clock);
  clock = setInterval(function(){ seconds++; $("timer").textContent = "⏱ " + Math.floor(seconds/60) + ":" + ("0"+seconds%60).slice(-2); }, 1000);
}

function win(){
  clearInterval(clock);
  var stars = (seconds < 900 && hints <= 3) ? 3 : (seconds < 1500 ? 2 : 1);
  $("stars").textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
  if(best === null || seconds < best) best = seconds;
  $("stats").textContent = "Time: " + Math.floor(seconds/60) + "m " + seconds%60 + "s · Hints used: " + hints + " · Best this session: " + Math.floor(best/60) + "m " + best%60 + "s";
  showScreen("win");
}

$("hintBtn").onclick = function(){
  var h = rooms[roomNo].hints, n = hintNo[roomNo];
  say("💡 " + h[Math.min(n, h.length-1)]);
  if(n < h.length){ hintNo[roomNo]++; hints++; }
};
$("playBtn").onclick = startGame;
$("navPlay").onclick = startGame;
$("cform").onsubmit = function(e){
  e.preventDefault();
  $("cthanks").textContent = "Thank you, " + $("cname").value + "! This demo form does not send data anywhere, but we appreciate your message.";
  this.reset();
};
$("againBtn").onclick = function(){ showScreen("landing"); if(best !== null) $("best").textContent = "Best time: " + Math.floor(best/60) + "m " + best%60 + "s"; };
$("mClose").onclick = closeModal;
// flashlight for the dark room
$("room").onpointermove = function(e){
  var r = this.getBoundingClientRect();
  $("dark").style.setProperty("--mx", (e.clientX - r.left) + "px");
  $("dark").style.setProperty("--my", (e.clientY - r.top) + "px");
};

