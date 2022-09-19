const express = require('express');
const app = express();
const bp = require('body-parser');
const questions = require('./questions.json');

const deck = ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"];

const players = [
	{name: "herroZ", updates: [], password: "bbb", id: 1, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},
	
];

const player_list = [
	{name: "herroZ", id: 1, nbr_votes: 0, score: 0, cards_played: []},
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
		ans = {player_list: player_list,player: undefined};
		if (players[id].updates) {ans.player=players[id];}
		res.status(201).json(ans);
		players[id].updates=[];
	} else {res.status(401).json({message:"Erreur d'authentification"}); console.log('Erreur d\'authentification');}
	
	
});

app.post('/register_player', (req, res, next) => {
  var id=players.at(-1).id+1;
  var crypto = require("crypto");
  var pswd = crypto.randomBytes(20).toString('hex');
  player={name: req.body.name, password: pswd, cards_played: [], id: id, cards: generateCards(), updates: ['new_player']};
  for (let joueur of players) {
	  joueur.updates.push("new_player");
  }
  players.push(player);
  player_list.push({name: player.name, id: id, nbr_votes: 0, score: 0, cards_played: []});
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

app.post('/send_cards', (req, res, next) => {
	if (check_ids(req.body.id,req.body.password)) {  
	  id = findID(req.body.id);
	  player_list[id].cards_played=req.body.cards_played;
	  players[id].cards=generateCards(players[id].cards);
	  console.log(player_list[id].cards_played);
	  res.status(201).json(players[id]);
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