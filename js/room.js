// ---------- Rooms ----------
var rooms = [
  { name: "Room 1: The Dusty Library", bg: "linear-gradient(#4a3320,#2a1c10)", hints: [
      "Plants sometimes hide things in the soil.",
      "Light the candle to read the painting.",
      "The painting tells you the book order. The desk riddle answer is something you type on."] },
  { name: "Room 2: The Clock Room", bg: "linear-gradient(#2b3a4a,#141d27)", hints: [
      "The mirror is not made to be read normally.",
      "The glowing panel needs a color order. Read the mirror text backwards.",
      "The clock is missing a part. Use the gear you earned."] },
  { name: "Room 3: The Dark Cellar", bg: "linear-gradient(#3a2a4a,#170f20)", hints: [
      "It is dark. Move your mouse or finger to shine your light around.",
      "Search the barrel. A tool can open the nailed crate.",
      "Wall riddle: you write with it. Crate riddle: what you leave when you walk."] },
  { name: "Room 4: The Final Vault", bg: "linear-gradient(#1f3a38,#0c1a19)", hints: [
      "Read the note, then look at the statues on the altar.",
      "Terminal: shift every letter back by 3 (D becomes A).",
      "The exit code is your four note digits in room order."] }
];

var objs = [
  //  Room 1 
  [
    { e:"🪴", l:"Plant", x:10, y:70, click:function(){
        if(f.match){ say("Just dry soil now."); return; }
        f.match = 1; give("match"); say("You dig in the pot and find a box of matches!"); } },
    { e:"🕯️", l:function(){ return f.lit ? "Candle (lit)" : "Candle"; }, x:38, y:62, glow:function(){ return f.lit; },
      click:function(){ say(f.lit ? "The candle flickers warmly." : "An unlit candle. You need something to light it."); },
      use:{ item:"match", fn:function(){ f.lit = 1; take("match"); say("You light the candle. Writing glows on the painting!"); drawRoom(); } } },
    { e:"🖼️", l:"Painting", x:28, y:25, click:function(){
        if(f.lit) note("Painting: ‘Read the books like colors of my rainbow: red, blue, green, yellow.’");
        else say("A dusty painting. It is too dark to see any detail."); } },
    { e:"📚", l:"Bookshelf", x:62, y:30, click:function(){
        if(f.books){ say("The secret compartment is empty."); return; }
        orderPuzzle("The Bookshelf", "Four colored books stick out. Press them in the right order.",
          [{id:"red",t:"📕",c:"#8a2b2b",f:300},{id:"blue",t:"📘",c:"#2b4a8a",f:350},{id:"green",t:"📗",c:"#2b7a3b",f:400},{id:"yellow",t:"📙",c:"#b8902b",f:450}],
          ["red","blue","green","yellow"],
          function(){ f.books = 1; give("rusty"); say("A secret compartment opens! Inside is a rusty key."); }); } },

    { e:"🗄️", l:"Desk", x:62, y:72,
      click:function(){
        if(f.deskOpen) deskRiddle(); else say("A locked desk drawer. It needs a key."); },
      use:{ item:"rusty", fn:function(){ f.deskOpen = 1; take("rusty"); deskRiddle(); } } },
      
    { e:"🚪", l:"Door", x:90, y:42, click:function(){
        if(has("brass")){ take("brass"); nextRoom(); } else say("The door is locked. You need a key."); } }
  ],
  //  Room 2 
  [
    { e:"🪞", l:"Mirror", x:18, y:28, click:function(){
        openModal("The Mirror", function(b){
          b.innerHTML = "<p>Writing is scratched on the glass. It looks backwards:</p><div class='mirror'>eulb ,neerg ,wolley ,der</div><p>Maybe it is a color order.</p>";
        }); note("Mirror text (backwards): ‘eulb ,neerg ,wolley ,der’"); } },


    { e:"💡", l:"Light Panel", x:50, y:28, click:function(){
        if(f.panel){ say("The panel is dark now."); return; }
        orderPuzzle("The Light Panel", "Four lights wait to be pressed in order.",
          [{id:"blue",t:"🔵",c:"#2b4a8a",f:300},{id:"red",t:"🔴",c:"#8a2b2b",f:350},{id:"green",t:"🟢",c:"#2b7a3b",f:400},{id:"yellow",t:"🟡",c:"#b8902b",f:450}],
          ["red","yellow","green","blue"],
          function(){ f.panel = 1; give("gear"); say("A floor hatch pops open. You find a brass gear!"); }); } },



    { e:"📜", l:"Scroll", x:14, y:72, click:function(){ say("The scroll says: ‘Time flies when you are trapped.’ Not very helpful."); } },
    { e:"🕰️", l:function(){ return f.clockFixed ? "Clock (open)" : "Clock"; }, x:50, y:68, glow:function(){ return f.clockFixed && !f.silver; },


      click:function(){
        if(f.clockFixed && !f.silver){ f.silver = 1; give("silver"); note("Clock door digit: 1"); say("The clock door swings open. A silver key and the number 1 are inside!"); }
        else if(f.silver) say("The clock ticks happily.");
        else say("The clock is broken. A gear is missing from inside."); },
      use:{ item:"gear", fn:function(){ f.clockFixed = 1; take("gear"); say("The gear fits. The clock chimes and a small door opens in its face!"); drawRoom(); } } },
    { e:"🚪", l:"Door", x:90, y:42, click:function(){
        if(has("silver")){ take("silver"); nextRoom(); } else say("Locked tight. Look for a silver key."); } }
  ],
  //  Room 3
  [
    { e:"🛢️", l:"Barrel", x:14, y:72, click:function(){
        if(f.wrench){ say("Just an empty barrel."); return; }
        f.wrench = 1; give("wrench"); say("You search the barrel and find a heavy wrench!"); } },
    { e:"🧱", l:"Wall Writing", x:22, y:28, click:function(){
        if(f.pencil){ say("The wall writing is solved."); return; }
        riddle("Wall Writing", "Scratched on the stones: ‘I am taken from a mine and shut inside a wooden case. I am never released, yet nearly everyone uses me. What am I?’", ["pencil","a pencil","pencil lead","graphite"],
          function(){ f.pencil = 1; note("Wall writing digit: 8"); say("A stone slides aside and the number 8 is carved behind it."); }); } },
    { e:"📦", l:"Nailed Crate", x:52, y:70,
      click:function(){
        if(f.crate) say("The crate is empty now.");
        else if(f.crateOpen) crateRiddle();
        else say("The crate is nailed shut. You need a tool."); },
      use:{ item:"wrench", fn:function(){ f.crateOpen = 1; take("wrench"); crateRiddle(); } } },
    { e:"💀", l:"Skull", x:78, y:72, click:function(){ say("The skull whispers: ‘Four rooms, four digits. Keep your notes.’"); } },
    { e:"🚪", l:"Door", x:90, y:35, click:function(){
        if(has("iron")){ take("iron"); nextRoom(); } else say("An iron-barred door. You need an iron key."); } }
  ],
  //  Room 4 
  [
    { e:"📜", l:"Note", x:14, y:30, click:function(){ note("Vault note: ‘Follow the journey of the sun, from first light to last.’"); } },
    { e:"💻", l:"Terminal", x:46, y:30, click:function(){
        if(f.cipher){ say("The terminal shows: ACCESS GRANTED."); return; }
        riddle("Secret Terminal", "The screen shows a message where every letter was moved 3 steps forward in the alphabet (A became D): <b>IUHHGRP</b>. Type the real word.", ["freedom"],
          function(){ f.cipher = 1; note("Terminal digit: 6"); say("ACCESS GRANTED. The screen shows the number 6."); }); } },
    { e:"🗿", l:"Statues", x:20, y:70, click:function(){
        if(f.statues){ say("The altar is open and empty."); return; }
        orderPuzzle("The Four Statues", "Four carvings rest on the altar. Press them in the right order.",
          [{id:"night",t:"🌙",c:"#2b3a5a",f:300},{id:"dawn",t:"🌅",c:"#a8582b",f:350},{id:"dusk",t:"🌇",c:"#8a4a6a",f:400},{id:"noon",t:"☀️",c:"#b8902b",f:450}],
          ["dawn","noon","dusk","night"],
          function(){ f.statues = 1; give("gold"); say("The altar slides open. Inside is a golden key!"); }); } },
    { e:"🚪", l:"EXIT", x:88, y:40, click:function(){
        if(!has("gold")){ say("A huge golden lock holds the exit. You need a golden key."); return; }
        dial("The Exit Lock", "Turn the golden key, then enter the 4-digit code from your notes (Room 1, 2, 3, 4).", "4186", win); } }
  ]
];
function crateRiddle(){
  riddle("The Crate", "Inside the crate is a card: ‘The more of me you take, the more you leave behind. What am I?’", ["footsteps","steps","footstep","step"],
    function(){ f.crate = 1; f.crateOpen = 0; give("iron"); say("A hidden compartment opens. You find an iron key!"); });
}