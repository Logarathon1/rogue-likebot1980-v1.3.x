// Used to get various information from the save file

const fs = require("fs");
const Jimp = require('jimp');

var roomTypes = ["Entrance","Exit","Fight","Encounter","Empty","Boss","Shop","Cheddar King Start","The Gate"]
var randomEquipmentImageIDs = JSON.parse(fs.readFileSync('./sprite-data.json'));
var tierAuraColour = [{r:0,g:0,b:0},{r:127,g:127,b:127},{r:195,g:195,b:195},{r:255,g:255,b:255},{r:29,g:220,b:34},{r:75,g:68,b:223},{r:153,g:43,b:227},{r:235,g:3,b:235},{r:255,g:255,b:98},{r:255,g:217,b:231},{r:255,g:11,b:11}]
var itemTiers = [0,0,0,0,0,1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,7,7,8,9,10];

var inputData;

var stdin = process.openStdin();

console.log("[CONSOLE] Rogue-likebot 1980 v1.3.x Utility Console Ready")

stdin.addListener ("data", function (d) {
	inputData = d.toString().trim();
	query();
})

function query () {
	load();
	inputData = inputData.split("!");
	console.log(inputData[1])
	if (inputData[1] == "location") {
		console.log("[CONSOLE] " + getLocation());
	}
	else if (inputData[1] == "player") {
		console.log(player);
	}
	else if (inputData[1] == "enemy") {
		console.log(enemy);
	}
	else if (inputData[1] == "dungeon") {
		output = "[CONSOLE] The Dungeon\n\n";
		for (i = 0; i < dungeon.length; i++) {
			output += "Stage " + (i + 1) + ": " + dungeon[i].name + "\n";
			for (j = 0; j < dungeon[i].floors.length; j++) {
				output += "    Floor " + (j + 1) + "\n";
				for (k = 0; k < dungeon[i].floors[j].length; k++) {
					output += "        Room " + (k + 1) + ": " + roomTypes[dungeon[i].floors[j][k].roomType] + "";
					if (i == stage && floor == j && k == room) {
						output += " *THE PLAYER IS HERE*"
					}
					if (k < dungeon[i].floors[j].length - 1) {
						output += "\n"
					}
				}
				output += "\n"
			}
			if (i < dungeon.length - 1) {
				output += "\n"
			}
		}
		console.log(output);
	}
	else if (inputData[1] == "stage") {
		console.log("[CONSOLE] Stage " + (stage + 1) + " of " + dungeon.length + "\nThis stage contains " + dungeon[stage].floors.length + " floors");
	}
	else if (inputData[1] == "floor") {
		console.log("[CONSOLE] Floor " + (floor + 1) + " of " + dungeon[stage].floors.length + "\nThis floor contains " + dungeon[stage].floors[floor].length + " rooms");
	}
	else if (inputData[1] == "room") {
		console.log("[CONSOLE] Room " + (room + 1) + " of " + dungeon[stage].floors[floor].length);
	}
	else if (inputData[1] == "progress") {
		progress = getProgress();
		console.log("[CONSOLE] Progress: " + progress[0] + " of " + progress[1] + " Rooms (" + progress[2] + "%)\nFights: " + progress[3][0] + "/" + progress[3][1] + "\nEncounters: " + progress[4][0] + "/" + progress[4][1] + "\nEmpty Rooms: " + progress[5][0] + "/" + progress[5][1] + "\nBoss Fights: " + progress[6][0] + "/" + progress[6][1]);
	}
	else if (inputData[1] == ("deathlog")) {
		if (inputData[2]) {
			getDeathlog(1,inputData[2]);
		}
		else {
			getDeathlog(0)
		}
	}
	else if (inputData[1] == ("randplayer")) {
		assemblePlayerImage();
	}
	return;
}

function load () {
	var userDataToLoad = JSON.parse(fs.readFileSync('./savefile.json'));
	inFight = userDataToLoad[0];
	player = userDataToLoad[1];
	enemy = userDataToLoad[2]
	turn = userDataToLoad[3];
	attack = userDataToLoad[4];
	awaitMove = userDataToLoad[5];
	tempEnemyDefense = userDataToLoad[6];
	tempPlayerDefense = userDataToLoad[7];
	playerLevel = userDataToLoad[8];
	playerXP = userDataToLoad[9];
	wins = userDataToLoad[10];
	runType = userDataToLoad[11];
	enemyAttackType = userDataToLoad[12];
	playerResult = userDataToLoad[13];
	enemyResult = userDataToLoad[14];
	enemyAction = userDataToLoad[15];
	highestRunScore = userDataToLoad[16];
	highestRunName = userDataToLoad[17];
	runGold = userDataToLoad[18];
	encounterType = userDataToLoad[19];
	levelSkip = userDataToLoad[20];
	healthLoss = userDataToLoad[21];
	awaitChoice = userDataToLoad[22];
	shop1 = userDataToLoad[23];
	shop2 = userDataToLoad[24];
	shop3 = userDataToLoad[25];
	playerClass = userDataToLoad[26];
	awaitClass = userDataToLoad[27];
	fightStartMessage = userDataToLoad[28];
	turnSummary = userDataToLoad[29];
	statusMessage = userDataToLoad[30];
	reward = userDataToLoad[31];
	encounterOccured = userDataToLoad[32];
	encounterSummary = userDataToLoad[33];
	previousEnemyAttack = userDataToLoad[34];
	characterChoice = userDataToLoad[35];
	player1 = userDataToLoad[36];
	player2 = userDataToLoad[37];
	player3 = userDataToLoad[38];
	player4 = userDataToLoad[39];
	player5 = userDataToLoad[40];
	selectedCharacter = userDataToLoad[41];
	lootReward = userDataToLoad[42];
	playerReward = userDataToLoad[43];
	attacked = userDataToLoad[44];
	fallenHero = userDataToLoad[45];
	scrapChance = userDataToLoad[46];
	weaponUpgradeCost = userDataToLoad[47];
	weaponReforgeCost = userDataToLoad[48];
	armourUpgradeCost = userDataToLoad[49];
	armourReforgeCost = userDataToLoad[50];
	encounterDeathMessage = userDataToLoad[51];
	encounterCauseOfDeath = userDataToLoad[52];
	encounterResult = userDataToLoad[53];
	canSeeIntents = userDataToLoad[54];
	stage = userDataToLoad[55];
	floor = userDataToLoad[56];
	room = userDataToLoad[57];
	dungeon = JSON.parse(fs.readFileSync('./dungeon.json'));
}

function getTimeStamp(noFormatting) {
	var d = new Date();
	if (noFormatting) {
		dateText = "" + d.getFullYear() + "-";
		if (d.getMonth() < 9) {
			dateText += "0" + d.getMonth() + "-";
		}
		else {
			dateText += "" + d.getMonth() + "-";
		}
		if (d.getDate() < 10) {
			dateText += "0" + d.getDate();
		}
		else {
			dateText += "" + d.getDate();
		}
		return (dateText);
		}
	else {
		return("[" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " " + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + "] ");
	}
}

function getLocation () {
	var playerLocation = dungeon[stage].roomName.toUpperCase() + " " + (room) + ", " + dungeon[stage].floorName.toUpperCase() + " " + (floor + 1) + " OF " + dungeon[stage].name.toUpperCase() + " (STAGE " + (stage + 1) + ")";
	return playerLocation;
}

function getFullPlayerInfo () {
	var playerInfo = "PLAYER DETAILS\nFull Name - " + player.name + "\nFirst Name - " + player.firstName + "\nHealth - " + player.health + "/" + player.maxHealth + "\nAttack - " + player.attack + "\nDefense - " + player.defense + "\n\nCORE STATS\nCore Health - " + player.healthCore + "\nCore Attack - " + player.attackCore + "\nCore Defense - " + player.defenseCore + "\nGold - " + runGold + "\nCurrent Level - " + playerLevel + "\nCurrent XP - " + player.xp + "/" + Math.floor((playerLevel ** 1.5) * 10) + "\n\nEQUIPMENT\nHead: " + player.head.name + "\n" + player.head.identifier + "\n- " + player.head.defenseBonus + " Defense - " + player.head.modifications + " Modifications\n\nBody: " + player.body.name + "\n" + player.body.identifier + "\n- " + player.body.defenseBonus + " Defense - " + player.body.modifications + " Modifications\n\nArms: " + player.arms.name + "\n" + player.arms.identifier + "\n- " + player.arms.defenseBonus + " Defense - " + player.arms.modifications + " Modifications\n\nLegs: " + player.legs.name + "\n" + player.legs.identifier + "\n- " + player.legs.defenseBonus + " Defense - " + player.legs.modifications + " Modifications\n\nWeapon: " + player.weapon.name + "\n" + player.weapon.identifier + "\n- " + player.weapon.attackBonus + " Attack - " + player.weapon.modifications + " Modifications\n\nOffhand: " + player.offhand.name + "\n" + player.offhand.identifier + "\n- " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - " + player.offhand.modifications + " Modifications\n\nRelic: " + player.relic.name + "\n" + player.relic.identifier + "\n- " + player.relic.healthBonus + " Additional Health - " + player.relic.modifications + " Modifications";
	return playerInfo;
}

function getProgress () {
	var totalRoomCount = 0;
	var currentProgress = 0;
	var fightCount = 0;
	var encounterCount = 0;
	var emptyRoomCount = 0;
	var bossCount = 0;
	var fightCountCurrent = 0;
	var encounterCountCurrent = 0;
	var emptyRoomCountCurrent = 0;
	var bossCountCurrent = 0;
	i = 0;
	while (i < dungeon.length) {
		j = 0;
		while (j < dungeon[i].floors.length) {
			k = 0;
			while (k < dungeon[i].floors[j].length) {
				if (dungeon[i].floors[j][k].roomType != 0 && dungeon[i].floors[j][k].roomType != 1) {
					totalRoomCount++;
					switch (dungeon[i].floors[j][k].roomType) {
						case 2:
						fightCount++;
						break;
						
						case 3:
						case 6:
						encounterCount++;
						break;
						
						case 4:
						emptyRoomCount++;
						break;
						
						case 5:
						bossCount++;
						break;
					}
				}
				if (i == stage && floor == j && k == room) {
					currentProgress = totalRoomCount;
					currentProgress--;
					fightCountCurrent = fightCount;
					encounterCountCurrent = encounterCount;
					emptyRoomCountCurrent = emptyRoomCount;
					bossCountCurrent = bossCount;
					switch (dungeon[i].floors[j][k].roomType) {
						case 2:
						fightCountCurrent--;
						break;
						
						case 3:
						case 6:
						encounterCountCurrent--;
						break;
						
						case 4:
						emptyRoomCountCurrent--;
						break;
						
						case 5:
						bossCountCurrent--;
						break;
						
						
					}
				}
				k++;
			}
			j++
		}
		i++
	}
	progressPercentage = ((currentProgress / totalRoomCount) * 100).toFixed(2);
	return [currentProgress,totalRoomCount,progressPercentage,[fightCountCurrent,fightCount],[encounterCountCurrent,encounterCount],[emptyRoomCountCurrent,emptyRoomCount],[bossCountCurrent,bossCount]]
}

function getDeathlog (command,position) {
	var tempDeathlog = JSON.parse(fs.readFileSync('./deathlog.json'));
	switch (command) {
		case 0:
		var output = "There are " + tempDeathlog.length + " completed runs, use !deathlog!<#> to view a specific run\n" ;
		for (i = 0; i < tempDeathlog.length; i++) {
			output += "\n#" + (i + 1) + ": " + tempDeathlog[i].name;
		}
		console.log(output)
		break;
		
		case 1:
		if (tempDeathlog[position - 1]) {
			console.log(tempDeathlog[position - 1]);
		}
		else {
			console.log("ERROR: No such run with number " + position + " exists!")
		}
		break;
	}
}

function assemblePlayerImage () {
	// Random player sprite creation
	console.log(getTimeStamp() + "Assembling Random Player Image");

	player = {head:{imgID:randomEquipmentImageIDs[0][Math.floor(Math.random() * randomEquipmentImageIDs[0].length)],tier:itemTiers[Math.floor(Math.random() * itemTiers.length)]},
			  body:{imgID:randomEquipmentImageIDs[1][Math.floor(Math.random() * randomEquipmentImageIDs[1].length)],tier:itemTiers[Math.floor(Math.random() * itemTiers.length)]},
			  arms:{imgID:randomEquipmentImageIDs[2][Math.floor(Math.random() * randomEquipmentImageIDs[2].length)],tier:itemTiers[Math.floor(Math.random() * itemTiers.length)]},
			  legs:{imgID:randomEquipmentImageIDs[3][Math.floor(Math.random() * randomEquipmentImageIDs[3].length)],tier:itemTiers[Math.floor(Math.random() * itemTiers.length)]},
			  weapon:{imgID:0,tier:itemTiers[Math.floor(Math.random() * itemTiers.length)]},
			  offhand:{imgID:0,tier:itemTiers[Math.floor(Math.random() * itemTiers.length)]},
			  relic:{imgID:randomEquipmentImageIDs[7][Math.floor(Math.random() * randomEquipmentImageIDs[7].length)],tier:itemTiers[Math.floor(Math.random() * itemTiers.length)]}
			 }
	if (Math.random() < 0.5) {
		player.weapon.imgID = randomEquipmentImageIDs[4][Math.floor(Math.random() * randomEquipmentImageIDs[4].length)];
		player.offhand.imgID = randomEquipmentImageIDs[4][0];
	}
	else {
		player.weapon.imgID = randomEquipmentImageIDs[5][Math.floor(Math.random() * randomEquipmentImageIDs[5].length)];
		player.offhand.imgID = randomEquipmentImageIDs[6][Math.floor(Math.random() * randomEquipmentImageIDs[6].length)];
	}
	
	Jimp.read('./images/custom-player/cloaks/' + player.body.imgID.type + '/' + player.body.imgID.variant + '.png', (err, cloak) => {
		if (err) throw err;
		Jimp.read('./images/custom-player/base-models/0.png', (err, basemodel) => {
			if (err) throw err;
			Jimp.read('./images/custom-player/legs/' + player.legs.imgID.type + '/' + player.legs.imgID.variant + '.png', (err, legs) => {
				if (err) throw err;
				Jimp.read('./images/custom-player/arms/' + player.arms.imgID.type + '/' + player.arms.imgID.variant + '.png', (err, arms) => {
					if (err) throw err;
					Jimp.read('./images/custom-player/chest/' + player.body.imgID.type + '/' + player.body.imgID.variant + '.png', (err, chest) => {
						if (err) throw err;
						Jimp.read('./images/custom-player/head/' + player.head.imgID.type + '/' + player.head.imgID.variant + '.png', (err, head) => {
							if (err) throw err;
							Jimp.read('./images/custom-player/relics/' + player.relic.imgID.type + '/' + player.relic.imgID.variant + '.png', (err, relic) => {
								if (err) throw err;
								Jimp.read('./images/custom-player/equipment/' + player.weapon.imgID.type + '/' + player.weapon.imgID.variant + '.png', (err, weapon) => {
									if (err) throw err;
									Jimp.read('./images/custom-player/equipment/' + player.offhand.imgID.type + '/' + player.offhand.imgID.variant + '.png', (err, offhand) => {
										if (err) throw err;
										Jimp.read('./images/custom-player/shadow/0.png', (err, imgbase) => {
											if (err) throw err;
											offhand.flip(true,false);
											imgbase
												.composite(cloak, 0, 0)
												.composite(basemodel, 0, 0)
												.composite(legs, 0, 0)
												.composite(arms, 0, 0)
												.composite(chest, 0, 0)
												.composite(relic, 0, 0)
												.composite(head, 0, 0)
												.composite(weapon, 0, 0)
												.composite(offhand, 0, 0)
												.write('./bin/randplayer.png');
											console.log(getTimeStamp() + "Generated Random Player Image!");
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
	Jimp.read('./images/custom-player/cloaks/' + player.body.imgID.type + '/' + player.body.imgID.variant + '.png', (err, cloak) => {
		if (err) throw err;
		Jimp.read('./images/custom-player/base-models/0.png', (err, basemodel) => {
			if (err) throw err;
			Jimp.read('./images/custom-player/legs/' + player.legs.imgID.type + '/' + player.legs.imgID.variant + '.png', (err, legs) => {
				if (err) throw err;
				Jimp.read('./images/custom-player/arms/' + player.arms.imgID.type + '/' + player.arms.imgID.variant + '.png', (err, arms) => {
					if (err) throw err;
					Jimp.read('./images/custom-player/chest/' + player.body.imgID.type + '/' + player.body.imgID.variant + '.png', (err, chest) => {
						if (err) throw err;
						Jimp.read('./images/custom-player/head/' + player.head.imgID.type + '/' + player.head.imgID.variant + '.png', (err, head) => {
							if (err) throw err;
							Jimp.read('./images/custom-player/relics/' + player.relic.imgID.type + '/' + player.relic.imgID.variant + '.png', (err, relic) => {
								if (err) throw err;
								Jimp.read('./images/custom-player/equipment/' + player.weapon.imgID.type + '/' + player.weapon.imgID.variant + '.png', (err, weapon) => {
									if (err) throw err;
									Jimp.read('./images/custom-player/equipment/' + player.offhand.imgID.type + '/' + player.offhand.imgID.variant + '.png', (err, offhand) => {
										if (err) throw err;
										Jimp.read('./images/custom-player/shadow/0.png', (err, imgbase) => {
											if (err) throw err;
											offhand.flip(true,false);
											var auraData = []
											for (i = 0; i < 61; i++) {
												auraData.push([]);
												for (j = 0; j < 61; j++) {
													auraData[i].push({aura:false});
												}
											}
											var cloakLayer = []
											for (i = 0; i < 61; i++) {
												cloakLayer.push([]);
												for (j = 0; j < 61; j++) {
													cloakLayer[i].push({cloak:false});
												}
											}
											imgbase.composite(cloak, 0, 0);
											for (i = 0; i < 61; i++) {
												for (j = 0; j < 61; j++) {
													var col = Jimp.intToRGBA(imgbase.getPixelColor(i,j));
													if (col.a == 0 || auraData[i][j].aura) {
														if (Jimp.intToRGBA(cloak.getPixelColor(i + 1,j)).a != 0 || Jimp.intToRGBA(cloak.getPixelColor(i - 1,j)).a != 0 || Jimp.intToRGBA(cloak.getPixelColor(i,j + 1)).a != 0 || Jimp.intToRGBA(cloak.getPixelColor(i,j - 1)).a != 0) {
															imgbase.setPixelColor(Jimp.rgbaToInt(tierAuraColour[player.body.tier].r,tierAuraColour[player.body.tier].g,tierAuraColour[player.body.tier].b,255),i,j);
														}
													}
													if (Jimp.intToRGBA(cloak.getPixelColor(i,j)).a != 0) {
														cloakLayer[i][j].cloak = true;
													}
												}
											}
											imgbase.composite(basemodel, 0, 0);
											imgbase.composite(legs, 0, 0);
											for (i = 0; i < 61; i++) {
												for (j = 0; j < 61; j++) {
													if (Jimp.intToRGBA(legs.getPixelColor(i,j)).a != 0) {
														cloakLayer[i][j].cloak = false;
													}
													var col = Jimp.intToRGBA(imgbase.getPixelColor(i,j));
													if (col.a != 0 && !cloakLayer[i][j].cloak) {}
													else if (col.a == 0 || auraData[i][j].aura || cloakLayer[i][j].cloak) {
														if (Jimp.intToRGBA(legs.getPixelColor(i + 1,j)).a != 0 || Jimp.intToRGBA(legs.getPixelColor(i - 1,j)).a != 0 || Jimp.intToRGBA(legs.getPixelColor(i,j + 1)).a != 0 || Jimp.intToRGBA(legs.getPixelColor(i,j - 1)).a != 0) {
															imgbase.setPixelColor(Jimp.rgbaToInt(tierAuraColour[player.legs.tier].r,tierAuraColour[player.legs.tier].g,tierAuraColour[player.legs.tier].b,255),i,j);
															auraData[i][j].aura = true;
														}
													}
													
												}
											}
											imgbase.composite(arms, 0, 0);
											for (i = 0; i < 61; i++) {
												for (j = 0; j < 61; j++) {
													if (Jimp.intToRGBA(arms.getPixelColor(i,j)).a != 0) {
														cloakLayer[i][j].cloak = false;
													}
													var col = Jimp.intToRGBA(imgbase.getPixelColor(i,j));
													if (col.a != 0 && !cloakLayer[i][j].cloak) {}
													else if (col.a == 0 || auraData[i][j].aura) {
														if (Jimp.intToRGBA(arms.getPixelColor(i + 1,j)).a != 0 || Jimp.intToRGBA(arms.getPixelColor(i - 1,j)).a != 0 || Jimp.intToRGBA(arms.getPixelColor(i,j + 1)).a != 0 || Jimp.intToRGBA(arms.getPixelColor(i,j - 1)).a != 0) {
															imgbase.setPixelColor(Jimp.rgbaToInt(tierAuraColour[player.arms.tier].r,tierAuraColour[player.arms.tier].g,tierAuraColour[player.arms.tier].b,255),i,j);
															auraData[i][j].aura = true;
														}
													}
													
												}
											}
											imgbase.composite(chest, 0, 0)
											for (i = 0; i < 61; i++) {
												for (j = 0; j < 61; j++) {
													if (Jimp.intToRGBA(chest.getPixelColor(i,j)).a != 0) {
														cloakLayer[i][j].cloak = false;
													}
													var col = Jimp.intToRGBA(imgbase.getPixelColor(i,j));
													if (col.a != 0 && !cloakLayer[i][j].cloak) {}
													else if (col.a == 0 || auraData[i][j].aura || cloakLayer[i][j].cloak) {
														if (Jimp.intToRGBA(chest.getPixelColor(i + 1,j)).a != 0 || Jimp.intToRGBA(chest.getPixelColor(i - 1,j)).a != 0 || Jimp.intToRGBA(chest.getPixelColor(i,j + 1)).a != 0 || Jimp.intToRGBA(chest.getPixelColor(i,j - 1)).a != 0) {
															imgbase.setPixelColor(Jimp.rgbaToInt(tierAuraColour[player.body.tier].r,tierAuraColour[player.body.tier].g,tierAuraColour[player.body.tier].b,255),i,j);
															auraData[i][j].aura = true;
														}
													}
													
												}
											}
											imgbase.composite(relic, 0, 0);
											for (i = 0; i < 61; i++) {
												for (j = 0; j < 61; j++) {
													if (Jimp.intToRGBA(relic.getPixelColor(i,j)).a != 0) {
														cloakLayer[i][j].cloak = false;
													}
													var col = Jimp.intToRGBA(relic.getPixelColor(i,j));
													if (col.a == 0) {
														if (Jimp.intToRGBA(relic.getPixelColor(i + 1,j)).a != 0 || Jimp.intToRGBA(relic.getPixelColor(i - 1,j)).a != 0 || Jimp.intToRGBA(relic.getPixelColor(i,j + 1)).a != 0 || Jimp.intToRGBA(relic.getPixelColor(i,j - 1)).a != 0) {
															imgbase.setPixelColor(Jimp.rgbaToInt(tierAuraColour[player.relic.tier].r,tierAuraColour[player.relic.tier].g,tierAuraColour[player.relic.tier].b,255),i,j);
															auraData[i][j].aura = true;
														}
													}
													
												}
											}
											imgbase.composite(head, 0, 0);
											for (i = 0; i < 61; i++) {
												for (j = 0; j < 61; j++) {
													if (Jimp.intToRGBA(head.getPixelColor(i,j)).a != 0) {
														cloakLayer[i][j].cloak = false;
													}
													var col = Jimp.intToRGBA(imgbase.getPixelColor(i,j));
													if (col.a != 0 && !cloakLayer[i][j].cloak) {}
													else if (col.a == 0 || auraData[i][j].aura) {
														if (Jimp.intToRGBA(head.getPixelColor(i + 1,j)).a != 0 || Jimp.intToRGBA(head.getPixelColor(i - 1,j)).a != 0 || Jimp.intToRGBA(head.getPixelColor(i,j + 1)).a != 0 || Jimp.intToRGBA(head.getPixelColor(i,j - 1)).a != 0) {
															imgbase.setPixelColor(Jimp.rgbaToInt(tierAuraColour[player.head.tier].r,tierAuraColour[player.head.tier].g,tierAuraColour[player.head.tier].b,255),i,j);
															auraData[i][j].aura = true;
														}
													}
													
												}
											}
											imgbase.composite(weapon, 0, 0);
											for (i = 0; i < 61; i++) {
												for (j = 0; j < 61; j++) {
													if (Jimp.intToRGBA(weapon.getPixelColor(i,j)).a != 0) {
														cloakLayer[i][j].cloak = false;
													}
													var col = Jimp.intToRGBA(imgbase.getPixelColor(i,j));
													if (col.a != 0 && !cloakLayer[i][j].cloak) {}
													else if (col.a == 0 || auraData[i][j].aura) {
														if (Jimp.intToRGBA(weapon.getPixelColor(i + 1,j)).a != 0 || Jimp.intToRGBA(weapon.getPixelColor(i - 1,j)).a != 0 || Jimp.intToRGBA(weapon.getPixelColor(i,j + 1)).a != 0 || Jimp.intToRGBA(weapon.getPixelColor(i,j - 1)).a != 0) {
															imgbase.setPixelColor(Jimp.rgbaToInt(tierAuraColour[player.weapon.tier].r,tierAuraColour[player.weapon.tier].g,tierAuraColour[player.weapon.tier].b,255),i,j);
															auraData[i][j].aura = true;
														}
													}
													
												}
											}
											imgbase.composite(offhand, 0, 0);
											for (i = 0; i < 61; i++) {
												for (j = 0; j < 61; j++) {
													if (Jimp.intToRGBA(offhand.getPixelColor(i,j)).a != 0) {
														cloakLayer[i][j].cloak = false;
													}
													var col = Jimp.intToRGBA(imgbase.getPixelColor(i,j));
													if (col.a != 0 && !cloakLayer[i][j].cloak) {}
													else if (col.a == 0 || auraData[i][j].aura) {
														if (Jimp.intToRGBA(offhand.getPixelColor(i + 1,j)).a != 0 || Jimp.intToRGBA(offhand.getPixelColor(i - 1,j)).a != 0 || Jimp.intToRGBA(offhand.getPixelColor(i,j + 1)).a != 0 || Jimp.intToRGBA(offhand.getPixelColor(i,j - 1)).a != 0) {
															imgbase.setPixelColor(Jimp.rgbaToInt(tierAuraColour[player.offhand.tier].r,tierAuraColour[player.offhand.tier].g,tierAuraColour[player.offhand.tier].b,255),i,j);
															auraData[i][j].aura = true;
														}
													}
													
												}
											}
											imgbase.write('./bin/randplayer_aura.png');
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
}
