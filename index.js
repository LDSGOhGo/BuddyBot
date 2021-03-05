const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.TOKEN;
const Hypixel = require('hypixel-api-reborn');
const mojangjs = require('mojangjs');
const fetch = require('fetch');
const hypixel = new Hypixel.Client(process.env.KEY);
const keepAlive = require('./server');
const apod = require('nasa-apod-js');
const guildMembers = new Discord.Collection();
var fs = require("fs");
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
var idNumber = 0;
db.defaults({ users: []}).write();
db.defaults({ commands: []}).write();
db.defaults({ ign: []}).write();
var response = ["As I see it, yes.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.", " Don’t count on it.", "It is certain.", "It is decidedly so.", "Most likely.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Outlook good.", "Reply hazy, try again.", "Signs point to yes.", "Very doubtful.", "Without a doubt.", "Yes.", "Yes – definitely.", "You may rely on it."];
let toggle = true;	
async function refreshGuild() {
  try {
    let guild = await hypixel.getGuild('name', 'The Buttermelon Squad');
    let names = await Promise.all(guild.members.map(member => mojangjs.getNameFromUUID(member.uuid)));

    for (let i = 0; i < guild.members.length; i++) {
      let member = guild.members[i];
      guildMembers.set(member.uuid, {
        name: names[i],
        uuid: member.uuid,
        status: null
      });
    }
  } catch(error) {
    console.error("Refresh Guild Error");
    console.error(error);
  }
}

async function fetchGuildStatus() {
  try {
    const members = guildMembers.array();
    let memberStatus = await Promise.all(members.map(member => hypixel.getStatus(member.uuid)));
    for (let i = 0; i < members.length; i++) {
      members[i].status = memberStatus[i];
    }
  } catch(error) {
    console.error("Fetch Guild Status Error");
    console.error(error);
  }
}
function processMessage(initialMessage) {
	try {
		let msgOne = initialMessage;
		let splitMsg = msgOne.split(" ");
		let primaryMsg = splitMsg[1];
		return primaryMsg;
	}
	catch(e) {
		console.error(e);
	}
}
function processCommand(initialCommand) {
	try {
		let cmdOne = initialCommand;
		let splitCmd = cmdOne.split(" ");
		let primaryCmd = splitCmd[2];
		return primaryCmd; 
	}
	catch(e) {
		console.error(e);
	}
}
function processWord(initialMessage) {
	try {
		let word = initialMessage.slice(1).trim().split(' ');
		console.log(word);
		var wordList = [];
		let j = 0;
		for(i = 1; i < word.length; i++) {
			wordList[j] = word[i];
			j++;
		}
		var theWords = wordList.join(' ');
		console.log(theWords);
		return theWords;
	}
	catch(e) {
		console.error(e);
	}
}
refreshGuild();

client.on('message', async msg => {
	if(msg.author.bot) {
		return;
	}
	else {
		if(msg.content.toLowerCase().includes("noice")) {
			msg.react('🇳');
			msg.react('🇴');
			msg.react('🧊');
		}
		if(msg.content == "!abuse") {
			msg.channel.send({files: ["abuse.JPG"]});
		}
		if(msg.content == "!uwu" || msg.content == "!Uwu" || msg.content == "!UwU" || msg.content == "!owo" || msg.content == "!Owo" || msg.content == "!OwO") {
			try {
				const user = db.get('users')
				.find({id: msg.author.id})
				.value();
				if(user.owo == true) {
					console.log("t");
					db.get('users')
					.find({id: msg.author.id})
					.assign({owo: false})
					.write();
					msg.react('👌');
					msg.channel.send("UwU/OwO reactions off");
				}
				else if(user.owo == false) {
					console.log("f");
					db.get('users')
					.find({id: msg.author.id})
					.assign({owo: true})
					.write();
					msg.react('👌');
					msg.channel.send("UwU/OwO reactions on");
				}
			}
			catch(e) {
				msg.channel.send("please run ```!activateuwu``` first");
			}
		}
		if(msg.content == "!activateuwu") {
			try {
			const user = {
				id: msg.author.id,
				owo: true,
				fine: 0
			}
			db.get('users').push(user).write();
			msg.react('👌');
			msg.channel.send("UwU/OwO reactions activated. Toggle on and off at any time with !uwu")
			}
			catch(e) {
				console.error(e);
				msg.channel.send("IDK Error or something");
			}
		}
		if(msg.content == "!hi") {
			msg.channel.send("<@602887436300714013> Go say hi to " + msg.author.username);
		}
		if(msg.author.id === "602887436300714013") {
			if(msg.content.startsWith("!add ")) {
				try {
					let userName = processMessage(msg.content);
					let rankName = processCommand(msg.content);
					let userId = msg.mentions.users.first().id
					const user = {
					id: userId,
					name: userName,
					rank: rankName
					}
					db.get('users').push(user).write();
					idNumber++;
					msg.react('👌');
				}
				catch(e) {
					console.error(e);
				}
			}
			if(msg.content == "!owner") {
				try {
					const user = db.get('users')
					.find({rank: "Owner"})
					.value();
					console.log(user.name);
					msg.channel.send(user.name);
				}
				catch(e) {
					console.log(e);
				}
			}
		}
		if(msg.content == "!toggle") {
			try {
					var pass = false;
					const user = db.get('users')
					.filter({rank: "toggle"})
					.value();
					for(i of user) {
						if(i.id == msg.author.id) {
							pass = true;
						}
					}
					if(pass == true) {
						if(toggle == true) {
							toggle = false;
						}
						else {
							toggle = true;
						}
						msg.react('👌');
					}
					else {
						msg.react('❌');
					}
				}
				catch(e) {
					console.log(e);
				}
		}
		if(msg.content.startsWith("!tag")) {
				if(msg.content != "!tags" && msg.content != "!tag") {
					try {
						const user = db.get('users')
						.filter({rank: "tags"})
						.value();
						if(user) {
							for(i of user) {
								if(i.id == msg.author.id) {
									let tagName = processMessage(msg.content);
									let name = tagName.toLowerCase();
									let tag = processCommand(msg.content);
									const tag1 = db.get('commands')
									.find({name: name})
									.value();
									if(tag1) {
										db.get('commands')
										.find({name: name})
										.assign({tags: tag})
										.write();
										msg.react('👌');
									}
									else {
										const tags = {
											id: 1,
											name: tagName,
											tags: tag
											}
											db.get('commands').push(tags).write();
											msg.react('👌');
									}
								}
							}
						}
					}
					catch(e) {
						console.error(e);
						msg.channel.send("error creating tag");
					}
				}
			}
			if(msg.content.startsWith("!deletetag")) {
				try {
					let tagName = processMessage(msg.content);
					db.get('commands')
					.remove({name: tagName})
					.write();
					msg.react('👌');
				}
				catch(e) {
					console.error(e);
					msg.channel.send("Could not remove tag. Not sure why");
				}
			}
		const tag = db.get('commands')
			.filter({id: 1})
			.value();
		try {
			for(i of tag) {
				let name = i.name;
				if(("!" + name.toLowerCase()) == msg.content.toLowerCase()) {
					if(i.tags) {
						msg.channel.send(i.tags);
					}
					else {
						msg.channel.send("Empty tag, what are you doing lol");
					}
				}
			}
		}
		catch(e) {
			console.error(e);
		}
		if(msg.content.startsWith("!addign")) {
			try {
				let userIgn = processMessage(msg.content);
				const igns = db.get('ign')
				.find({id: msg.author.id})
				.value();
				if(igns) {
					db.get('ign')
					.find({id: msg.author.id})
					.assign({ign: userIgn})
					.write();
					msg.react('👌');
				}
				else {
					const theIgn = {
						id: msg.author.id,
						ign: userIgn
						}
					db.get('ign').push(theIgn).write();
					msg.react('👌');
				}
			}
			catch(e) {
				console.error(e);
				msg.channel.send("bro idk whats happening");
			}
		}
		if(msg.content == "!ign") {
			try {
				const igns = db.get('ign')
				.find({id: msg.author.id})
				.value();
				if(igns) {
					msg.channel.send(igns.ign);
				}
				else {
					msg.channel.send("No IGN saved");
				}
			}
			catch(e) {
				console.error(e);
				msg.channel.send("Error I guess. Sorry");
			}
		}
		if(msg.content.startsWith("!bedwars")) {
			if(msg.content == "!bedwars") {
				console.log(msg.content);
				const igns = db.get('ign')
					.find({id: msg.author.id})
					.value();
				if(igns) {
					hypixel.getPlayer(igns.ign).then(player => {
						let beds = player.stats.bedwars.beds.broken
						let kills = player.stats.bedwars.kills
						let finals = player.stats.bedwars.finalKills
						let level = player.stats.bedwars.level
						let prestige = player.stats.bedwars.prestige
						let wins = player.stats.bedwars.wins
						const embed = new Discord.MessageEmbed()
						.setColor(344703)
						.setTitle(`Current Bedwars Stats For ${igns.ign}`)
						.addField("Beds Broken: ", beds)
						.addField("Kills: ", kills)
						.addField("Final Kills: ", finals)
						.addField("Stars: ", level)
						.addField("Prestige: ", prestige)
						.addField("Wins: ", wins)
						.setTimestamp();
						msg.channel.send({embed});
					}).catch(e => {
					console.error(e);
					msg.channel.send("error in !rank please check console for error");
					});
				}
				else {
					msg.channel.send("You dont have an IGN saved yet");
				}
			}
			else {
				if(msg.mentions.users.first()) {
					let person = msg.mentions.users.first().id;
					const igns = db.get('ign')
					.find({id: person})
					.value();
					if(igns) {
						hypixel.getPlayer(igns.ign).then(player => {
							let beds = player.stats.bedwars.beds.broken
							let kills = player.stats.bedwars.kills
							let finals = player.stats.bedwars.finalKills
							let level = player.stats.bedwars.level
							let prestige = player.stats.bedwars.prestige
							let wins = player.stats.bedwars.wins
							const embed = new Discord.MessageEmbed()
							.setColor(344703)
							.setTitle(`Current Bedwars Stats For ${igns.ign}`)
							.addField("Beds Broken: ", beds)
							.addField("Kills: ", kills)
							.addField("Final Kills: ", finals)
							.addField("Stars: ", level)
							.addField("Prestige: ", prestige)
							.addField("Wins: ", wins)
							.setTimestamp();
							msg.channel.send({embed});
						}).catch(e => {
						console.error(e);
						msg.channel.send("error in !bedwars please check console for error");
						});
					}
					else {
						msg.channel.send(`${msg.mentions.users.first()} has not saved an ign`);
					}
				}
				else {
					msg.channel.send("You did not mention an user");
				}
			}
		}
		if(msg.content.startsWith("!skywars")) {
			console.log(msg.content);
			if(msg.content == "!skywars") {
				const igns = db.get('ign')
					.find({id: msg.author.id})
					.value();
				if(igns) {
					hypixel.getPlayer(igns.ign).then(player => {
						let heads = player.stats.skywars.heads
						let kills = player.stats.skywars.kills
						let chests = player.stats.skywars.openedLootChests
						let level = player.stats.skywars.level
						let prestige = player.stats.skywars.prestige
						let wins = player.stats.skywars.wins
						const embed = new Discord.MessageEmbed()
						.setColor(344703)
						.setTitle(`Current Skywars Stats For ${igns.ign}`)
						.addField("Heads: ", heads)
						.addField("Kills: ", kills)
						.addField("Chests Looted: ", chests)
						.addField("Stars: ", level)
						.addField("Prestige: ", prestige)
						.addField("Wins: ", wins)
						.setTimestamp();
						msg.channel.send({embed});
					}).catch(e => {
					console.error(e);
					msg.channel.send("error in !rank please check console for error");
					});
				}
				else {
					msg.channel.send("You dont have an IGN saved yet");
				}
			}
			else {
				if(msg.mentions.users.first()) {
					let person = msg.mentions.users.first().id;
					const igns = db.get('ign')
					.find({id: person})
					.value();
					if(igns) {
						hypixel.getPlayer(igns.ign).then(player => {
							let heads = player.stats.skywars.heads
							let kills = player.stats.skywars.kills
							let chests = player.stats.skywars.openedLootChests
							let level = player.stats.skywars.level
							let prestige = player.stats.skywars.prestige
							let wins = player.stats.skywars.wins
							const embed = new Discord.MessageEmbed()
							.setColor(344703)
							.setTitle(`Current Skywars Stats For ${igns.ign}`)
							.addField("Heads: ", heads)
							.addField("Kills: ", kills)
							.addField("Chests Looted: ", chests)
							.addField("Stars: ", level)
							.addField("Prestige: ", prestige)
							.addField("Wins: ", wins)
							.setTimestamp();
							msg.channel.send({embed});
						}).catch(e => {
						console.error(e);
						msg.channel.send("error in !rank please check console for error");
						});
					}
					else {
						msg.channel.send(`${msg.mentions.users.first()} has not saved an IGN yet`);
					}
				}
				else {
					msg.channel.send("You did not mention an user");
				}
			}
 		}
		 if(msg.content.startsWith("!classic")) {
			console.log(msg.content);
			const igns = db.get('ign')
				.find({id: msg.author.id})
				.value();
			if(igns) {
				hypixel.getPlayer(igns.ign).then(player => {
					let kills = player.stats.duels.classic.kills;
					let winstreak = player.stats.duels.classic.winstreak;
					let deaths = player.stats.duels.classic.deaths;
					let wins = player.stats.duels.classic.wins;
					let losses = player.stats.duels.classic.losses;
					let games = player.stats.duels.classic.playedGames;
					const embed = new Discord.MessageEmbed()
					.setColor(344703)
					.setTitle(`Current Classic Duel Stats For ${igns.ign}`)
					.addField("Kills:", kills)
					.addField("Deaths:", deaths)
					.addField("Winstreak:", winstreak)
					.addField("Wins:", wins)
					.addField("Losses:", losses)
					.addField("Games Played:", games)
					.setTimestamp();
					msg.channel.send({embed});
				}).catch(e => {
				console.error(e);
				msg.channel.send("error in !rank please check console for error");
				});
			}
			else {
				msg.channel.send("You dont have an IGN saved yet");
			}
		}
		if(msg.content.startsWith("!uhc")) {
			console.log(msg.content);
			const igns = db.get('ign')
				.find({id: msg.author.id})
				.value();
			if(igns) {
				hypixel.getPlayer(igns.ign).then(player => {
					let kills = player.stats.duels.uhc.overall.kills;
					let winstreak = player.stats.duels.uhc.overall.winstreak;
					let deaths = player.stats.duels.uhc.overall.deaths;
					let wins = player.stats.duels.uhc.overall.wins;
					let losses = player.stats.duels.uhc.overall.losses;
					let games = player.stats.duels.uhc.overall.playedGames;
					const embed = new Discord.MessageEmbed()
					.setColor(344703)
					.setTitle(`Current UHC Duel Stats For ${igns.ign}`)
					.addField("Kills:", kills)
					.addField("Deaths:", deaths)
					.addField("Winstreak:", winstreak)
					.addField("Wins:", wins)
					.addField("Losses:", losses)
					.addField("Games Played:", games)
					.setTimestamp();
					msg.channel.send({embed});
				}).catch(e => {
				console.error(e);
				msg.channel.send("error in !rank please check console for error");
				});
			}
			else {
				msg.channel.send("You dont have an IGN saved yet");
			}
		}
		if(msg.content.startsWith("!sumo")) {
			console.log(msg.content);
			const igns = db.get('ign')
				.find({id: msg.author.id})
				.value();
			if(igns) {
				hypixel.getPlayer(igns.ign).then(player => {
					let kills = player.stats.duels.sumo.kills;
					let winstreak = player.stats.duels.sumo.winstreak;
					let deaths = player.stats.duels.sumo.deaths;
					let wins = player.stats.duels.sumo.wins;
					let losses = player.stats.duels.sumo.losses;
					let games = player.stats.duels.sumo.playedGames;
					const embed = new Discord.MessageEmbed()
					.setColor(344703)
					.setTitle(`Current Sumo Duel Stats For ${igns.ign}`)
					.addField("Kills:", kills)
					.addField("Deaths:", deaths)
					.addField("Winstreak:", winstreak)
					.addField("Wins:", wins)
					.addField("Losses:", losses)
					.addField("Games Played:", games)
					.setTimestamp();
					msg.channel.send({embed});
				}).catch(e => {
				console.error(e);
				msg.channel.send("error in !rank please check console for error");
				});
			}
			else {
				msg.channel.send("You dont have an IGN saved yet");
			}
		}
		if(msg.content.startsWith("!bridge")) {
			console.log(msg.content);
			const igns = db.get('ign')
				.find({id: msg.author.id})
				.value()
			if(igns) {
				hypixel.getPlayer(igns.ign).then(player => {
					let kills = player.stats.duels.bridge.overall.kills;
					let winstreak = player.stats.duels.bridge.overall.winstreak;
					let deaths = player.stats.duels.bridge.overall.deaths;
					let wins = player.stats.duels.bridge.overall.wins;
					let losses = player.stats.duels.bridge.overall.losses;
					let games = player.stats.duels.bridge.overall.playedGames;
					const embed = new Discord.MessageEmbed()
					.setColor(344703)
					.setTitle(`Current Bridge Duel Stats For ${igns.ign}`)
					.addField("Kills:", kills)
					.addField("Deaths:", deaths)
					.addField("Winstreak:", winstreak)
					.addField("Wins:", wins)
					.addField("Losses:", losses)
					.addField("Games Played:", games)
					.setTimestamp();
					msg.channel.send({embed});
				}).catch(e => {
				console.error(e);
				msg.channel.send("error in !rank please check console for error");
				});
			}
			else {
				msg.channel.send("You dont have an IGN saved yet");
			}
		}
		if(msg.content == "!tags") {
			try {
				const tag = db.get('commands')
					.filter({id: 1})
					.value();
				let tags = "";
				for(i of tag) {
					tags = tags + i.name + "\n";
				}
				const embed = new Discord.MessageEmbed()
				.setColor(344703)
				.setTitle("List of tags")
				.setDescription(tags)
				.setTimestamp();
				msg.channel.send({embed});
			}
			catch(e) {
				console.error(e);
				msg.channel.send("Error in finding tags, tbh idk why");
			}
		}
		let lowerCase = msg.content.toLowerCase();
		if(lowerCase.includes("dog water")) {
			msg.channel.send("*bog water");
		}
		if(msg.content == "!repo") {
			msg.channel.send("https://repl.it/@ohgo/h");
			console.log("Somebody wants a sneak peak 0-0");
		}
		if(msg.content.startsWith("!request")) {
			let request1 = msg.content.toString();
			let request = ("\n" + request1)
			console.log(msg.content);
			fs.appendFile("requests.txt", request, function (err) {
  				if (err) return console.log(err);});
			msg.channel.send("Request submitted!");
		}
		if(toggle == true) {
			if(msg.content != "!uwu" && msg.content != "!activateuwu") {
				try {
					const user = db.get('users')
					.find({id: msg.author.id})
					.value();
					if(user.owo == false) {
						return;
					}
					else {
						if(lowerCase.includes("uwu")) {
							msg.channel.send({files: ["dont.JPG"]});
							const user = db.get('users')
							.find({id: msg.author.id})
							.value()
							db.get('users')
							.find({ id: msg.author.id})
							.assign({fine: user.fine + 350})
							.write()
							const user1 = db.get('users')
							.find({id: msg.author.id})
							.value()
							msg.channel.send("Fine Total: $" + user1.fine);
						}
						if(lowerCase.includes("owo")) {
							msg.channel.send({files: ["dont1.JPG"]});
							const user = db.get('users')
							.find({id: msg.author.id})
							.value()
							db.get('users')
							.find({ id: msg.author.id})
							.assign({ fine: user.fine + 350})
							.write()
							const user1 = db.get('users')
							.find({id: msg.author.id})
							.value()
							msg.channel.send("Fine Total: $" + user.fine);
						}
					}
				}
				catch(e) {
					console.log("not again");
				}
			}
		}
		if(msg.content === "!helpme") {
			console.log("somebody needed help");
			const embed = new Discord.MessageEmbed()
  		.setColor(344703)
  		.setTitle("List of commands")
			.addField("!8ball", "*!8ball questionHere?*")
			.addField("!apod", "*!apod \n !apod description*")
			.addField("!coinflip", "*!coinflip*")
			.addField("!refreshguild", "*!refreshguild*")
			.addField("!fortunecookie", "*!fortunecookie*")
			.addField("!rank", "*!rank nameHere*")
			.addField("!bedwarskills", "*!bedwarskills nameHere*")
			.addField("!check", "*!check wordHere \n Checks the base LDSG mod logs word list*")
			.addField("!bedwarsfinals", "*!bedwarsfinals nameHere*")
			.addField("!beds", "*!beds nameHere*")
			.addField("!stars", "*!stars nameHere*")
			.addField("!bedwarsprestige", "*!bedwarsprestige nameHere*")
			.addField("!bedwarswins", "*!bedwarswins nameHere*")
			.addField("!statsbedwars", "*!statsbedwars nameHere*")
			.addField("!statsskywars", "*!statsskywars nameHere*")
			.addField("!skywarskills", "*!skywarskills nameHere*")
			.addField("!skywarslevel", "*!skywarslevel nameHere*")
			.addField("!skywarsprestige", "*!skywarsprestige nameHere*")
			.addField("!skywarswins", "*!skywarswins nameHere*")
			.addField("!classicstats", "*!classicstats nameHere*")
			.addField("!uhcstats", "*!uhcstats nameHere*")
			.addField("!sumostats", "*!sumostats nameHere*")
			.addField("!bridgestats", "*!bridgestats nameHere*")
			.addField("!guildlevel", "*!guildlevel \n only works for buttermeloon squad currently*")
			.addField("!guildxp", "*!guildxp \n only works for buttermelon squad currently*")
			.setTimestamp();
			msg.author.send({embed});
			const embed1 = new Discord.MessageEmbed()
			embed1.setColor(344703)
			embed1.setTitle("List of commands continued")
			embed1.addField("!weeklyxp", "*!weeklyxp \n only works for buttermelon squad currently*")
			embed1.addField("!guildstatus", "*!guildstatus \n only works for buttermelon squad currently*")
			embed1.addField("!guildonline", "*!guildonline \n only works for buttermelon squad currently*")
			embed1.addField("!nodebuffstats", "*!nodebuffstats nameHere*")
			embed1.setTimestamp();
			msg.author.send({embed: embed1});
			msg.react('👌');
		}
		if(msg.content.startsWith("!nodebuffstats")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		let kills = player.stats.duels.nodebuff.kills;
		let winstreak = player.stats.duels.nodebuff.winstreak;
		let deaths = player.stats.duels.nodebuff.deaths;
		let wins = player.stats.duels.nodebuff.wins;
		let losses = player.stats.duels.nodebuff.losses;
		let games = player.stats.duels.nodebuff.playedGames;
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Nodebuff Duel Stats For ${name}`)
  	.addField("Kills:", kills)
		.addField("Deaths:", deaths)
		.addField("Winstreak:", winstreak)
		.addField("Wins:", wins)
		.addField("Losses:", losses)
		.addField("Games Played:", games)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
	async function getFortune() {
		await fetch.fetchUrl("http://www.affirmations.dev/", function(error, meta, body){
			let fortune = body.toString()
			console.log(fortune);
			let splitFortune = fortune.slice(16, (fortune.length - 2))
			console.log(splitFortune);
			msg.channel.send(splitFortune);
		});
	}
	if(msg.content.startsWith("!8ball")) {
		if(msg.content.endsWith("?")) {
			var rando = Math.floor(Math.random() * 20);
			msg.channel.send(response[rando]);
			console.log("8ball: " + response[rando]);
		}
		else {
			msg.channel.send("Am I trippin or did you forget to ask a question?");
			console.log("8ball with no ?");
		}
	}
	if(msg.content === "!apod") {
		apod.fetch(process.env.NASAKEY).then(data => {
			console.log(data.url);
			msg.channel.send(data.title); 
			msg.channel.send(data.url);
		})  
	}
	if(msg.content === "!coinflip") {
		if(Math.random() < 0.5) {
			msg.channel.send("heads");
			console.log("coinflip: heads");
		}
		else {
			msg.channel.send("tails");
			console.log("coinflip: tails");
		}
	}
	if(msg.content === "!apod description") {
		apod.fetch(process.env.NASAKEY).then(data => {
			console.log("Apod Description Sent");
			const embed = new Discord.MessageEmbed()
			.setColor(344703)
			.setTitle(`Description for apod of ${data.date}`)
			.setDescription(data.explanation)
			.setTimestamp();
			msg.channel.send({embed});
		})
	}
 if (msg.content === '!refreshguild') {
  refreshGuild();
 }
  
 if (msg.content === '!displayguild') {
  console.log(guildMembers);
 }

if (msg.content === "!fortunecookie") {
	try {
		getFortune();
	}
	catch(e) {
		console.error(e);
		msg.channel.send("Error in obtaining fortune");
	}
 }

 if(msg.content.startsWith("!rank")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Rank Of ${name}`)
  	.setDescription(player.rank)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
if(msg.content.startsWith("!bedwarskills")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Bedwars Kills For ${name}`)
  	.setDescription(player.stats.bedwars.kills)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !bedwarskills please check console for error");
});
 }
 if(msg.content.startsWith("!check")) {
	 let word = processWord(msg.content);
	 console.log(word);
	 fs.readFile('badwords.txt', 'utf8' , (err, data) => {
  if (err) {
    console.error(err)
    return
  }
	let words = data.toString();
	let wordList = words.split(",");
	let trigger = false;
	for(i = 0; i < wordList.length; i++) {
		if(wordList[i] == word) {
			trigger = true;
		}
	}
  if(trigger === true) {
		msg.channel.send(`"${word}" is a trigger word`);
	}
	else {
		msg.channel.send(`"${word}" is not a trigger word`);
	}
})
 }
 if(msg.content.startsWith("!bedwarsfinals")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Bedwars Final Kills For ${name}`)
  	.setDescription(player.stats.bedwars.finalKills)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!beds")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Bed Breaks For ${name}`)
  	.setDescription(player.stats.bedwars.beds.broken)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!stars")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Stars For ${name}`)
  	.setDescription(player.stats.bedwars.level)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!bedwarsprestige")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Bedwars Prestige For ${name}`)
  	.setDescription(player.stats.bedwars.prestige)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!bedwarswins")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Bedwars Wins For ${name}`)
  	.setDescription(player.stats.bedwars.wins)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!statsbedwars")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		let beds = player.stats.bedwars.beds.broken
		let kills = player.stats.bedwars.kills
		let finals = player.stats.bedwars.finalKills
		let level = player.stats.bedwars.level
		let prestige = player.stats.bedwars.prestige
		let wins = player.stats.bedwars.wins
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Bedwars Stats For ${name}`)
  	.addField("Beds Broken: ", beds)
  	.addField("Kills: ", kills)
  	.addField("Final Kills: ", finals)
  	.addField("Stars: ", level)
  	.addField("Prestige: ", prestige)
  	.addField("Wins: ", wins)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
	});
}
if(msg.content.startsWith("!statsskywars")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		let heads = player.stats.skywars.heads
		let kills = player.stats.skywars.kills
		let chests = player.stats.skywars.openedLootChests
		let level = player.stats.skywars.level
		let prestige = player.stats.skywars.prestige
		let wins = player.stats.skywars.wins
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Skywars Stats For ${name}`)
  	.addField("Heads: ", heads)
  	.addField("Kills: ", kills)
  	.addField("Chests Looted: ", chests)
  	.addField("Stars: ", level)
  	.addField("Prestige: ", prestige)
  	.addField("Wins: ", wins)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!skywarskills")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Skywars Kills For ${name}`)
  	.setDescription(player.stats.skywars.kills)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!skywarslevel")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Skywars Level For ${name}`)
  	.setDescription(player.stats.skywars.level)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!skywarsprestige")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Skywars Prestige For ${name}`)
  	.setDescription(player.stats.skywars.prestige)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!skywarswins")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Skywars Wins For ${name}`)
  	.setDescription(player.stats.skywars.wins)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!classicstats")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		let kills = player.stats.duels.classic.kills;
		let winstreak = player.stats.duels.classic.winstreak;
		let deaths = player.stats.duels.classic.deaths;
		let wins = player.stats.duels.classic.wins;
		let losses = player.stats.duels.classic.losses;
		let games = player.stats.duels.classic.playedGames;
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Classic Duel Stats For ${name}`)
  	.addField("Kills:", kills)
		.addField("Deaths:", deaths)
		.addField("Winstreak:", winstreak)
		.addField("Wins:", wins)
		.addField("Losses:", losses)
		.addField("Games Played:", games)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!uhcstats")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		let kills = player.stats.duels.uhc.overall.kills;
		let winstreak = player.stats.duels.uhc.overall.winstreak;
		let deaths = player.stats.duels.uhc.overall.deaths;
		let wins = player.stats.duels.uhc.overall.wins;
		let losses = player.stats.duels.uhc.overall.losses;
		let games = player.stats.duels.uhc.overall.playedGames;
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current UHC Duel Stats For ${name}`)
  	.addField("Kills:", kills)
		.addField("Deaths:", deaths)
		.addField("Winstreak:", winstreak)
		.addField("Wins:", wins)
		.addField("Losses:", losses)
		.addField("Games Played:", games)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!sumostats")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		let kills = player.stats.duels.sumo.kills;
		let winstreak = player.stats.duels.sumo.winstreak;
		let deaths = player.stats.duels.sumo.deaths;
		let wins = player.stats.duels.sumo.wins;
		let losses = player.stats.duels.sumo.losses;
		let games = player.stats.duels.sumo.playedGames;
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Sumo Duel Stats For ${name}`)
  	.addField("Kills:", kills)
		.addField("Deaths:", deaths)
		.addField("Winstreak:", winstreak)
		.addField("Wins:", wins)
		.addField("Losses:", losses)
		.addField("Games Played:", games)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if(msg.content.startsWith("!bridgestats")) {
	 console.log(msg.content);
	let name = processMessage(msg.content);
	console.log(name);
	hypixel.getPlayer(name).then(player => {
		let kills = player.stats.duels.bridge.overall.kills;
		let winstreak = player.stats.duels.bridge.overall.winstreak;
		let deaths = player.stats.duels.bridge.overall.deaths;
		let wins = player.stats.duels.bridge.overall.wins;
		let losses = player.stats.duels.bridge.overall.losses;
		let games = player.stats.duels.bridge.overall.playedGames;
		const embed = new Discord.MessageEmbed()
  	.setColor(344703)
  	.setTitle(`Current Bridge Duel Stats For ${name}`)
  	.addField("Kills:", kills)
		.addField("Deaths:", deaths)
		.addField("Winstreak:", winstreak)
		.addField("Wins:", wins)
		.addField("Losses:", losses)
		.addField("Games Played:", games)
  	.setTimestamp();
  	msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	msg.channel.send("error in !rank please check console for error");
});
 }
 if (msg.content === "!guildlevel") {
	hypixel.getGuild('name', 'The Buttermelon Squad').then(guild => {
  const embed = new Discord.MessageEmbed()
   .setColor(344703)
   .setTitle("Current Guild Level")
   .setDescription(guild.level)
   .setTimestamp();
   msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	console.error(e);
	});
 }

if (msg.content === "!guildxp") {
	hypixel.getGuild('name', 'The Buttermelon Squad').then(guild => {
  const embed = new Discord.MessageEmbed()
   .setColor(344703)
   .setTitle("Current Guild XP Total")
   .setDescription(guild.experience)
   .setTimestamp();
   msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	console.error(e);
	});
 }

 if (msg.content === "!weeklyxp") {
	hypixel.getGuild('name', 'The Buttermelon Squad').then(guild => {
  const embed = new Discord.MessageEmbed()
   .setColor(344703)
   .setTitle("Current Guild Weekly XP")
   .setDescription(guild.totalWeeklyGexp)
   .setTimestamp();
   msg.channel.send({embed});
	}).catch(e => {
  console.error(e);
	console.error(e);
	});
 }

 if (msg.content === '!guildstatus') {
  try {
   await fetchGuildStatus();

   let displayStatus = guildMembers.map(member => `${member.name}: ${member.status.online ? "Online": "Offline"}`);
   const embed = new Discord.MessageEmbed()
   .setColor(344703)
   .setTitle("Guild Player Status")
   .setAuthor(client.user.username, client.user.avatarURL())
   .addField("Players:", displayStatus.join("\n"))
   .setTimestamp();
   msg.channel.send({embed});
  } catch(error) {
   console.error("Error in !guildstatus");
   console.error(error);
  }
 }
 if (msg.content === '!guildonline') {
  try {
   await fetchGuildStatus();

   let displayStatus = guildMembers.filter(member => member.status.online).map(member => `${member.name}`);
   const embed = new Discord.MessageEmbed()
   .setColor(344703)
   .setTitle("Online Guild Members")
   .setDescription(displayStatus.join("\n"))
   .setTimestamp();
   msg.channel.send({embed});
  } catch(error) {
   console.error("Error in !guildstatus");
   console.error(error);
  }
 }
}
});
keepAlive();
client.login(token);