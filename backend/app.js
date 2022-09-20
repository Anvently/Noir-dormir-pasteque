const express = require('express');
const app = express();
const bp = require('body-parser');
const questions = require('./questions.json');

const deck = ["les grands donateurs de la banque de sperme","le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"];
const timer = {id:null,duration:null,time:null,message:null,type:null,online:false,end:null};
const players = [
	//{name: "herroZ", updates: [], password: "bbb", id: 1, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},
];
round=0;
mode = "ROOM";
const options = {game_launch_duration:3,round_launch_duration:10,round_duration:10,vote_duration:300,end_round_duration:10}

const player_list = [
	//{name: "herroZ", id: 1, nbr_votes: 0, score: 0, cards_played: [], hasPlayed: false},
	];

function getRandomInt(max) {
  return Math.floor(Math.random() * max);

}
function generateCards(cards=[]) {
	while (!cards || cards.length < 7) {
		cards.push(deck[getRandomInt(deck.length)]);
	}
	return cards;
	
}

function check_ids (id,pswd) {	
	for (player of players) {
		if (player.id == id && player.password==pswd) {return true;}
	}
}

function findID(id) {
	for (i = 0; i < players.length; i++){
		if (players[i].id == id) {return i;}
	}
}

function pickQuestion() {
	return questions[getRandomInt(questions.length)];
}


question = pickQuestion();
app.use(express.json());
app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Content-Type','application/json');
  next();
});


app.get('/test', (req, res, next) => {
  res.status(200).end("test");
});

app.post('/update', (req, res, next) => {
	if (check_ids(req.body.id,req.body.password)) {
		id = findID(req.body.id);
		ans = {player_list: player_list,player: undefined,timer:{id:null,time:timer.time,duration:timer.duration,type:timer.type,online:timer.online},question:question};
		if (players[id].updates) {ans.player=players[id];}
		res.status(201).json(ans);
		players[id].updates=[];
	} else {res.status(401).json({message:"Erreur d'authentification"}); console.log('Erreur d\'authentification');}
	
	
});

app.post('/register_player', (req, res, next) => {
  var id=players.length > 0 && players.at(-1).id+1 || 0;
  var crypto = require("crypto");
  var pswd = crypto.randomBytes(20).toString('hex');
  player={name: req.body.name, password: pswd, cards_played: [], id: id, cards: [], updates: ['new_player']};
  for (let joueur of players) {
	  joueur.updates.push("new_player");
  }
  if (mode!="ROOM") {
	  player.updates.push("new_game");
	  player.updates.push("new_round");
	  player.cards=generateCards(player.cards);
  }
  if (mode=="VOTE") {
	  player.updates.push("start_vote");
  }
  if (timer.online==true) {player.updates.push("timer_start");}
  players.push(player);
  player_list.push({name: player.name, id: id, nbr_votes: 0, score: 0, cards_played: [], hasPlayed:false});
  console.log(player.name+" a rejoint la partie. "+player_list.length+" joueurs.");
  console.log(player_list);
  
  res.status(201).json(player);
});

app.post('/player_left', (req, res, next) => {
  if (check_ids(req.body.id,req.body.password)) {
		id = findID(req.body.id);
		player=players.splice(id,1)[0];
		player_list.splice(id,1);
		for (joueur of players) {
			joueur.updates.push("player_left");
		} 
		console.log(player.name+" a quitté la partie. "+player_list.length+" joueurs.");
		console.log(player_list);
	} else {res.status(401).json({message:"Erreur d'authentification"}); console.log('Erreur d\'authentification');}
	
});

app.post('/get_question', (req, res, next) => {
  if (check_ids(req.body.id,req.body.password)) {
		res.status(201).json({question:question});
	} else {res.status(401).json({message:"Erreur d'authentification"}); console.log('Erreur d\'authentification');}
	
});

function launchGame() {
	mode = "PLAY";
	console.log("Lancement d'un nouveau round.");
	question=pickQuestion();
	timer.id = setInterval(() => {
				handleTimer();
			},1000);
	timer.type="ROUND";
	timer.end=endRound;
	timer.online=true;
	timer.message="Votes dans ";
	timer.duration=options.round_duration;
	timer.time=options.round_duration;
	for (player of players) {
		player.updates.push("new_round");
		player.cards_played = [];
		if (round==0) {
			player.cards=generateCards(player.cards);}
			player.updates.push("new_game");
		player.updates.push("timer_start");
			
	}
	for (player of player_list) {
		player.cards_played = [];
	}
	round++;
}

function endRound() {
	console.log("Fin du round");
	for (player of players) {
		player.updates.push("end_round");
	}
	timer.id = setInterval(() => {
				handleTimer();
			},1000);
	timer.type="END_ROUND";
	timer.end=startVote;
	timer.online=true;
	timer.message="Attente de la réponse des joueurs. Fin dans ";
	timer.duration=options.end_round_duration;
	timer.time=options.end_round_duration;
}

function startVote() {
	if (timer.online) {handleTimer(true);}
	for (player of player_list) {
		player.hasPlayed=false;
	}
	for (player of players) {
		player.updates.push("start_vote");
	}
	console.log("Démarrage du vote");
}

function checkPlayerRep() {
	for (player of player_list) {
		if (!player.hasPlayed) {return false;}
	}
	return true;
}

function handleTimer(end) {
	timer.time--;
	if (timer.time == 0 || end == true) {
		clearInterval(timer.id);
		timer.id=null;
		timer.online=false;
		timer.end();
	} else if (timer.time % 5 == 0) {console.log(timer.message + timer.time + " secondes.");}
}

function filterCards(cards,cards_played) {
	for (el of cards_played) {
		i = cards.find(e => e==el);
		console.log(i);
		cards.splice(i,1);
	}
	return cards;
}

app.post('/ask_launch', (req, res, next) => {
  if (check_ids(req.body.id,req.body.password)) {
		if (!timer.online) {
			timer.id = setInterval(() => {
				handleTimer();
			},1000);
			timer.type="LAUNCH";
			timer.end=launchGame;
			timer.online=true;
			timer.message="Début de la partie dans ";
			timer.duration=options.game_launch_duration;
			timer.time=options.game_launch_duration;
			for (player of players) {
				player.updates.push("timer_start");
			}
			res.status(201).json({});
		} else {res.status(401).json({message:"Compte à rebours déjà engagé."});}
	} else {res.status(401).json({message:"Erreur d'authentification"}); console.log('Erreur d\'authentification');}
	
});

app.post('/send_cards', (req, res, next) => {
	if (check_ids(req.body.id,req.body.password)) {  
	  id = findID(req.body.id);
	  player_list[id].cards_played=req.body.cards_played;
	  player_list[id].hasPlayed=true;
	  players[id].cards = filterCards(players[id].cards,player_list[id].cards_played);
	  players[id].cards=generateCards(players[id].cards);
	  console.log(player_list[id].cards_played);
	  res.status(201).json(players[id]);
	  if (checkPlayerRep()) {handleTimer(true);}
	} else {res.status(401).json({message:"Erreur d'authentification"}); console.log('Erreur d\'authentification');}
});

app.get('/cards', (req, res, next) => {
  res.status(200).json(stuff);
});

app.post('/api/stuff', (req, res, next) => {
  console.log(req.body);
  res.status(201).json({
    message: 'Objet créé !'
  });
});

module.exports = app;