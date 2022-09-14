const express = require('express');
const app = express();
const bp = require('body-parser');

const deck = ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"];

const players = [
	{name: "herroZ", password: "bbb", id: 1, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},
	{name: "herroB", password: "ccc", id: 2, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},
	{name: "Magie", password: "ddd", id: 3, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},
	{name: "TOM", password: "eee", id: 4, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},	
	{name: "TEX", password: "fff", id: 5, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]}	
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

app.post('/register_player', (req, res, next) => {
  var id=players.length+1;
  var crypto = require("crypto");
  var pswd = crypto.randomBytes(20).toString('hex');
  player={name: req.body.name, password: pswd, id: id, cards: generateCards(), cards_played: []};
  players.push(player);
  res.status(201).json(player);
});

app.post('/send_cards', (req, res, next) => {
	if (check_ids(req.body.id,req.body.password)) {  
	  id = findID(req.body.id);
	  players[id].cards_played=req.body.cards_played;
	  players[id].cards=generateCards(players[id].cards);
	  console.log(players[id].cards_played);
	  res.status(201).json(players[id]);
	} else {res.status(401).json({message:"Erreur d'authentification"}); console.log('erreu');}
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