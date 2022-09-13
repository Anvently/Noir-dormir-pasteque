const express = require('express');
const app = express();

const deck = ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"];

const players = [
	{name: "herroZ", password: "bbb", id: 2, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},
	{name: "herroB", password: "ccc", id: 3, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},
	{name: "Magie", password: "ddd", id: 4, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},
	{name: "TOM", password: "eee", id: 5, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]},	
	{name: "TEX", password: "fff", id: 6, cards: ["Les grands donateurs de la banque de sperme","Le botox","21cm de bonheur","un autocollant 'enfant à bord'","le botox","petits efforts, gros résultats"],cards_played: ["l'aspirine","pépé dans mémé"]}	
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

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.get('/test', (req, res, next) => {
  res.status(200).end("test");
});

app.post('/register_player', (req, res, next) => {
  var id=players.length+1;
  var crypto = require("crypto");
  var pswd = crypto.randomBytes(20).toString('hex');
  player={name: req.name, password: pswd, id: id, cards: generateCards(), cards_played: null};
  players.push(player);
  console.log(player);
  res.status(201).json(player);
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