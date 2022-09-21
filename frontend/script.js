mode="ROOM";
dragObj=undefined;
oldObj=undefined;
balise=undefined;
player = {name:"test"};
const url = "http://localhost:3000/";
player_list =[];
timer=null;
vote_for=undefined;

if (window.matchMedia('(min-width: 1000px)')) {
	size = ["1.2vw","1.3vw","2vw","2.1vw"];
} else if (window.matchMedia('(max-width: 1000px)')) {
	console.log("ouais");
	size = ["1.7vh","1.8vh","2.5vh","2.6vh"];
}
playerName="herroP";
for (var obj of document.querySelectorAll(".carte:not(.joue)")) {
	obj.addEventListener('mousedown', initDnD);
}

document.addEventListener('mousemove', DnDMove);
document.addEventListener("touchend", endDnD);


function initQuestion(question) {
	plateau=document.getElementById("bottom_plateau");
	while (plateau.children.length > 1) {
		plateau.removeChild(plateau.lastChild);
	}
	count=0;
	while (question.search(/(?!>)□(?!<)/) > -1 ) {
		question = question.replace(/(?!>)□(?!<)/,"<span class='balise' id='balise_"+count.toString()+"'>□</span>");
		newCarte=document.getElementById("carte_question").cloneNode(true);
		newCarte.id="carte_"+count.toString();
		newCarte.style.visibility="visible";
		newCarte.querySelector("h1").innerHTML="Carte "+(count+1).toString();
		document.getElementById("bottom_plateau").appendChild(newCarte);
		count+=1;
	}
	document.getElementById("question").children[1].innerHTML = question;
}

function getText(obj) {
	if (obj.textContent) { // « textContent » existe ? Alors on s'en sert !
			txt = obj.textContent;
	} else if (obj.innerText) { // « innerText » existe ? Alors on doit être sous IE.
		txt = obj.innerText + ' [via Internet Explorer]';
	} else { // Si aucun des deux n'existe, cela est sûrement dû au fait qu'il n'y a pas de texte
		txt = ''; // On met une chaîne de caractères vide
	}
	return txt;
}

function initDnD(e) {
	if (mode=="PLAY") {
		var x = e.currentTarget.offsetLeft;
		var y = e.currentTarget.offsetTop;
		dragObj=e.currentTarget.cloneNode(true);
		e.currentTarget.style.visibility = "hidden"; 
		oldObj=e.currentTarget;
		dragObj.style.position="absolute";
		dragObj.style.left=String(x)+"px";
		dragObj.style.top=String(y)+"px";
		document.body.addEventListener('mouseup', endDnD);
		document.body.appendChild(dragObj);
		
	}
}



function DnDMove(e) {
	if (dragObj != undefined) {
		dragObj.style.left=String(e.clientX)+"px";
		dragObj.style.top=String(e.clientY)+"px";
	}
	var x = e.clientX, y = e.clientY;
	var width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
	var height = window.innerHeight|| document.documentElement.clientHeight|| document.body.clientHeight;
	if (!(x>width || y>height || x<0 || y<0)) { //si on est toujours dans la fenêtre
		var el=document.elementFromPoint(x,y);
		baliseHover(el); //si on entre sur la balise, 
	}
	else { //cas où on sort de la fenêtre 
		endDnD(e);
	}
	
}


function baliseHover(el, force = false) {
	if (el.innerText=="□" || (balise && balise.innerText=="□")) { //On gère le hover lorsque les balises sont vides
		if (balise && el.id != balise.id){ //cas où on sort de la balise 
			if (balise.innerText != "□") { balise.style.fontSize = size[0]; } else {balise.style.fontSize = size[2];} //cas particulier où l'on vient d'une balise non vide
			if (el.className=="balise") { //si on réentre dans l'autre balise. 
				balise = el;
				baliseHover(el);
				return
			 }
			 else {
				balise = undefined;
			 }
		}
		else if (!balise && el.className=="balise") { //cas où on entre dans une balise 
			balise = el;
			balise.style.fontSize = size[3];	
		}
		
		
	}
	else if (balise && el.className=="balise" && balise.id  != el.id){ //cas où on sort d'une balise pour entrer dans une autre
		balise.style.color="white";
		balise.style.fontSize = size[0];
		balise = undefined;
		baliseHover(el);
		}
	else if (el.className=="balise" && force == false) { //si l'élémnt parcouru est une balise et que force est faux
		balise = el;
		if (getComputedStyle(balise).color != "rgb(255, 255, 0)") { //si on est pas déjà entré sur l'objet
			balise.style.color="rgb(255, 255, 0)";
			balise.style.fontSize = size[1];
		}
	}
	else if (balise && getComputedStyle(balise).color == "rgb(255, 255, 0)") { //deux cas : fin du DnD & la balise identifiée est jaune 																							//OU sortie de la balise
		balise.style.color="white";
		if (force == false) {balise.style.fontSize = size[0];} //cas où on termine le DnD
		balise = undefined;
	}
}

function insertCard(balise,card,vote) {
	if (balise.innerHTML!="□") {
		addCard(balise.innerText);
	}
	else {
		balise.style.backgroundColor="#6a9fab";
	}
	contenu=card.querySelector("p").innerHTML;
	balise.innerHTML=contenu.toLowerCase();
	balise.style.fontSize=getComputedStyle(balise.parentNode).fontSize;
	id="carte_"+balise.id.split("_").at(-1);
	document.getElementById(id).className="carte";
	document.getElementById(id).querySelector("p").innerHTML=contenu;
	player.cards_played[parseInt(id.split("_").at(-1))]=contenu.toLowerCase();
	balise.addEventListener("mousedown",removeCard);
}
function addCard(text) {
	new_card=document.getElementById("main").children[0].cloneNode(true);
	text=text.charAt(0).toUpperCase() + text.slice(1);
	new_card.querySelector("p").innerHTML=text;
	new_card.querySelector("h1").innerHTML=playerName;
	new_card.style.visibility="visible";
	document.getElementById("main").appendChild(new_card);
	new_card.addEventListener('mousedown', initDnD);
}
function removeCard(e) {
	if (balise && balise.innerText!="□" && mode == "PLAY") { 
		carte=document.getElementById("carte_"+balise.id.at(-1));
		carte.querySelector("p").innerText="Placez une carte dans un trou.";
		carte.className="carte joue vide";
		addCard(balise.innerText);
		balise.innerText="□";
		balise.style.fontSize=size[2];
		balise.style.backgroundColor="transparent";
		player.cards_played[parseInt(balise.id.split("_").at(-1))]=undefined;

	}				
}

function deleteCards() {
	let main =  document.getElementById("main");
	while (main.children.length > 1) {
		main.removeChild(main.lastChild);
	}
}

function endDnD(e) {
	
	if (mode== "PLAY" && dragObj != undefined) {
		oldObj.style.visibility = "visible";
		if (balise) {
			insertCard(balise,oldObj);
			oldObj.parentNode.removeChild(oldObj);
			document.body.removeChild(dragObj);
			document.body.removeEventListener('mouseup', endDnD);
			dragObj=undefined;
			baliseHover(balise,true);
			return;
		}
			
		

		document.body.removeChild(dragObj);
		document.body.removeEventListener('mouseup', endDnD);
		dragObj=undefined;
	}
	
}

function touchHandler(event) {
	var touch = event.changedTouches[0];
	var simulatedEvent = document.createEvent("MouseEvent");
		simulatedEvent.initMouseEvent({
		touchstart: "mousedown",
		touchmove: "mousemove",
		touchend: "mouseup"
	}[event.type], true, true, window, 1,
		touch.screenX, touch.screenY,
		touch.clientX, touch.clientY, false,
		false, false, false, 0, null);
	touch.target.dispatchEvent(simulatedEvent);
}

function updateScores() {
	content = document.querySelector("#score > #content");
	for (joueur of player_list) {
		if (content.querySelector("#player_"+joueur.id)) {
			content.querySelector("#points_"+joueur.id).innerText=joueur.score;
			content.querySelector("#nbr_votes_"+joueur.id).innerText=joueur.nbr_votes;
		} else {
			newDiv = document.createElement("div");
			newDiv.id="player_"+joueur.id;
			newDiv.className="div_player";
			newDiv.innerHTML=`
				<p><strong>`+joueur.name+`</strong> : <span id="points_`+joueur.id+`">`+joueur.score+`</span> points</p>
				<p class="vote" id="vote_`+joueur.id+`"><span id="nbr_votes_`+joueur.id+`">`+joueur.nbr_votes+`</span> vote(s)</p>
			`
			newDiv.addEventListener("mouseover", overPlayer);
			newDiv.addEventListener("mousedown", selectPlayer);
			content.appendChild(newDiv);
		}
	}
}

function overPlayer (e) {
	if (mode=="VOTE") {
		let i=e.target.id.split("_").at(-1)-1;
		let n=0;
		for (bal of document.querySelectorAll(".balise")) {
			let card = player_list[i].cards_played[n];
			if (!card) {
				card="□";
				bal.style.fontSize=size[2];
				bal.style.color="rgb(255, 255, 0)";
				bal.style.backgroundColor="transparent";
			} else {
				bal.style.fontSize=size[0];
				bal.style.color="rgb(255, 255, 0)";
				bal.style.backgroundColor="#6a9fab";
			}
			
			bal.innerText=card;
			n++;
		}
	}
}

function selectPlayer(e) {
	if (mode == "VOTE") {
		let i=e.target.id.split("_").at(-1);
		if (vote_for) {
			for (let child of document.getElementById("player_"+(vote_for)).children) 
			{
				child.style.color="#11323b";
			}	
		}
		vote_for=i;
		for (let child of document.getElementById("player_"+(vote_for)).children) 
		{
			child.style.color="rgb(255, 255, 0)";
		}
	}
}

function getsa(type="",) {
	$.get("http://localhost:3000/"+type, function (data, status){
		console.log(typeof(data));
		});
}


function register(pseudo) {

	$.post(url+"register_player",{name:pseudo}, function (data, status){
				if (status == "success") {
					player = data;
					
					window.parent.document.title = player.name;
				}
				
		});
			
}

function getQuestion() {
	$.post(url+"get_question",{id:player.id,password:player.password}, function (data, status){
		initQuestion(data.question);
		});
}

function quit(e) {
	e.preventDefault();
	$.post(url+"player_left",{id:player.id,password:player.password}, function (data, status){
				
				
		});
}
function deletePlayer() {
	content = document.querySelector("#score > #content");
	liste_id = player_list.map(function (el) {return el.id});
	for (let i = 0; i<content.children.length; i++) {
		if (!liste_id.includes(parseInt(content.children[i].id.split("_").at(-1)))) {
			content.removeChild(content.children[i]);
			i--;
		}
	}
}
function update() {
	$.post(url+"update",{id:player.id,password:player.password,vote_for:vote_for}, function (data, status){
		if (status == "success") {
				player_list=data.player_list;
				if (data.player) {
					for (up of data.player.updates) {
						if (up == "new_player") {
							updateScores();
						} else if (up == "player_left") {
							deletePlayer();
						} else if (up == "new_game") {
							deleteCards();
							player.cards = data.player.cards;
							for (card of player.cards) {
								addCard(card);
							}
						} else if (up == "new_round") {
							initQuestion(data.question);
							mode = "PLAY";
							document.getElementById("btn_launch").disabled=true;
							document.getElementById("btn_launch").innerText="Voter";
						} else if (up == "timer_start") {
							if (timer && timer.online == true) {updateTimer(true);}
							if (mode=="ROOM") {document.getElementById("btn_launch").disabled=true;}
							timer = data.timer;
							timer.id = setInterval(() => {
								updateTimer();
						},1000);
						} else if (up == "end_round") {
							if (timer.online) {updateTimer(true);}
							mode="VOTE"
							sendCards();
							
						} else if (up == "start_vote") {
							mode="VOTE";
							document.getElementById("btn_launch").disabled=false;
						}
						
					}
				}
				if (mode == "VOTE") {
					updateScores();
				}
					
			}		
		});
}
function updateTimer(end) {
	timer.time--;
	document.getElementById("timer").innerText=timer.time+"s";
	if (timer.time == 0 || end == true) {
		clearInterval(timer.id);
		timer.id=null;
		timer.online=false;
		document.getElementById("timer").innerText="";
	}
}
function askLaunch() {
	$.post(url+"ask_launch",{id:player.id,password:player.password}, function (data, status){
			if (status == "success") {
				document.getElementById("btn_launch").disabled=true;
			}		
	});
	
}
function sendCards() {
	console.log(player.cards_played);
	$.post(url+"send_cards",{id:player.id,password:player.password,cards_played:player.cards_played}, function (data, status){
			if (status == "success") {
				mode = "VOTE";
				player = data;
				deleteCards();
				for (card in player.cards) {
						addCard(player.cards[card]);
					}
					
			}		
	});
}


function stop() {
	if (timer_update) {clearInterval(tick);
		timer_update=null;
		document.getElementById("btn").innerText="Allumer";
		console.log("éteint");}
	else {tick = setInterval(function(){update();}, 2000);timer_update=true;console.log("allumé");document.getElementById("btn").innerText="Eteindre";}
}
document.addEventListener("touchstart", touchHandler);
document.addEventListener("touchmove", touchHandler);
window.addEventListener('beforeunload', quit); 

register(prompt("Entrez votre pseudo", ""));


timer_update=true;



tick = setInterval(function(){
    
	update();
	
}, 2000);

setTimeout(function () {
	//more code
},2000);





