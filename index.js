// Rogue-likebot 1980 v1.3.x
// See README file for how to run/use
// Will have bugs, when inputting to the console be sure to use the correct command/number
// Created by Logan Fincham

// Facebook dependencies
const FB = require('fb');
const token = "";

// Main dependencies
const fs = require("fs");
const cron = require("node-cron");
const Jimp = require('jimp');


// Lots of vars, not sure if i needed to do this but oh well

var previousPost = '';

// Various enemy and player data

// Attacks located in this external file
var enemyAttacks = JSON.parse(fs.readFileSync('./enemy-attacks2.json'));
// Decorative prefixes
var enemyPrefixes = ['Tortured', 'Killer', 'Vile', 'Bloodthirsty', 'Fiendish', 'Ancient', 'Wicked', 'Ruthless', 'Dark', 'Malignant', 'Writhing', 'Agonized', 'Parasitic', 'Unbidden', 'Enslaved'];

// Functional prefixes
// Grants an additional "type"
var enemySubTypePrefixes = [{prefix:'Hidden',typeID:0,rarity:2},{prefix:'Flying',typeID:1,rarity:2},{prefix:'Undersized',typeID:2,rarity:1},{prefix:'Giant',typeID:3,rarity:1},{prefix:'Mounted',typeID:4,rarity:3},{prefix:'Fallen',typeID:5,rarity:3},{prefix:'Undead',typeID:5,rarity:3},{prefix:'Armoured',typeID:6,rarity:2},{prefix:'Reinforced',typeID:6,rarity:2},{prefix:'Burrowing',typeID:7,rarity:4},{prefix:'Cursed',typeID:8,rarity:10}];
// Allows the enemy to inflict a status effect on successful hit
var enemySpecialPrefixes = [{prefix:'Blinding',effectID:0},{prefix:'Venomous',effectID:1},{prefix:'Toxic',effectID:1},{prefix:'Incomprehensible',effectID:2},{prefix:'Necrotic',effectID:3},{prefix:'Tainted',effectID:3},{prefix:'Burning',effectID:4},{prefix:'Blazing',effectID:4},{prefix:'Arcing',effectID:5},{prefix:'Electrified',effectID:5},{prefix:'Frost-Bitten',effectID:6},{prefix:'Frigid',effectID:6},{prefix:'Chained',effectID:7}]

// Player names from Discord submissions and online generators
var playerNames = JSON.parse(fs.readFileSync('./player-names.json'));
// Old suffixes system
//var playerSuffixes = ['The Valiant','The Strange','The Bold','The Gallant','The Gutsy','The Unseen'];
// New suffixes system, now dependant on progression
var playerSuffixes = [['The Weak','The Unskilled','The Rookie'],['The Acquainted','The Brave','The Resolute'],['The Noble','The Courageous','The Daring','The Resistant'],['The Undaunted','The Grand','The Intrepid','The Adamant','The Resilient'],['The Heroic','The Epic','The Destroyer','The Relentless'],['The Legendary','The Mythical','The Unbreakable']];
// Player classes located in this external file, includes unused "Explorer" class, starts with sword, shield, and bow, has random abilities
var playerClasses = JSON.parse(fs.readFileSync('./player-classes.json'));
// Abilities located in this external file, most are unused
var abilities = JSON.parse(fs.readFileSync('./abilities.json'))
// Was to be used with sprite system
var playerRaces = []

// Enemies such as The Merchant and The Gatekeeper that only appear through encounters
var specialEnemies = JSON.parse(fs.readFileSync('./special-enemies.json'));

// Old boss naming system
var bossTypes = ['Spiders', 'Dragons', 'Undead', 'Bandits', 'Spirits', 'Harpies', 'Skeletons', 'Vipers', 'Slimes', 'Bats', 'Pyigmeyen', 'Wolves', 'Murlocs', 'Ogres', 'Trolls', 'Goblins', 'Orcs', 'Ents', 'Scorpions', 'Octobeasts', 'Liches', 'Monstrosities', 'Owlbears', 'Hydra', 'Chimera', 'Werehorses', 'Necromancers', 'Lyzzrdmeyen', 'Colossi', 'Gnomes', 'Cultists','Vuultyrmeyen', 'Elves','Men'];
var bossPrefixes = ['Lord of the ', 'Ruler of the ', 'Father of the ', 'Mother of the ', 'Father of ', 'Mother of ', 'King of ', 'Queen of ', 'Emperor of ', 'Empress of ', 'Slayer of ', 'Renderer of ', 'Destroyer of ', 'Crusher of ','Leader of the ','Legend among '];
var bossNames = ["Bi'bas", 'Blexliusmus', "Te'rexchom", 'Rironvildai', 'Varadu', 'Rarakan', 'Stennnegloom', "Ranth'edr", 'Salorcir', "Ar'dag", 'Nazgkhor', 'Thandka', 'Cthozara', 'Ictho', 'Lith', 'Rothrakskel', 'Xycasgoth', 'Neul', 'Daijeda', 'Abctu', 'Chthonhoth', 'Ulkluth', 'Varag Ulthor', 'John','Spoop','Sima','Cromur','Murbi','Orcu','Vallli','Be-u','Bamur','Yitil','Hasxo','Daxu','Thanoth','Ogg','Rathcxactu','Nyar-thoth','Yoggyogyoggtur','Torranresh','Ishiellu','An-khi','Deus-mogu','Xaia','Ysith','Tsi','Derrario','Sailn','Ra-roth','Lv.35 Boss']

// Old weapon class system
var weaponClasses = [[{twohanded:false},{twohanded:false},{twohanded:true},{twohanded:true},{twohanded:false},{twohanded:false},{twohanded:true},{twohanded:false},{twohanded:false}],[{twohanded:false},{twohanded:true},{twohanded:true},{twohanded:true}],[{twohanded:true},{twohanded:true},{twohanded:true},{twohanded:false}],[{twohanded:false},{twohanded:false},{twohanded:false}]];
// Item naming for use in "inventory"
var armourTypes = ["Head","Body","Arms","Legs","Offhand"];
var rewardTypes = ['Weapon','Armour','Relic'];
var weaponTypes = ['Short','Long','Ranged','Unarmed'];
// Old item prefix system
//var rewardPrefixes = ['Legendary','Mystical','Strange','Ancient','Burning','Frozen','Arcane','Enchanted','Obsidian','Red','Green','Blue','Steel','Ultimate','Bloodied','Magnificent','Lyzzrd','Bleeding','Fiery'];
// New prefix system dependant on item tier
var rewardPrefixes = [['Broken'],['Rusted','Damaged'],['Chipped','Beaten'],['Worn','Subpar'],['Average','Decent'],['Great','Excellent'],['Magnificent','Pristine'],['Legendary','Ultimate'],['Supreme','Fabled'],['Mythical','Mythological'],['Omnipotent','Apocryphal']];
// Unused prefixes, were to be used for equipment set generation
var magicRewardPrefixes = ['Red','Green','Blue','Mystical','Enchanted','Burning','Frozen','Arcane','Fiery'];

// Sprite system - used in random explorer generation
var randomEquipmentImageIDs = JSON.parse(fs.readFileSync('./sprite-data.json'));
// Index of all encounters resulting in a merchant fight
var merchants = [6,34,36,38,40]

// Actions The Smith can perform, takes one from each of these lists
var smithWeaponActions = [{description:"SHARPEN WEAPON (Improves your main weapon's damage)",method:1,equipment:"Weapon",result:"(+1 Attack)"},{description:"REWORK WEAPON (Resets your main weapon's modification count)",method:2,equipment:"Weapon",result:"(Reset Weapon Modifications)"},{description:"REFORGE WEAPON (Upgrades your main weapon's tier)",method:3,equipment:"Weapon",result:"(+1 Tier)"}];
var smithArmourActions = [
						[{description:"HARDEN HEAD ARMOUR (Improves your head armour's defense)",method:4,equipment:"Head Armour",result:"(+1 Defense)"},{description:"REWORK HEAD ARMOUR (Resets your head armour's modification count)",method:5,equipment:"Head Armour",result:"(Reset Head Armour Modifications)"},{description:"REFORGE HEAD ARMOUR (Upgrades your head armour's tier)",method:6,equipment:"Head Armour",result:"(+1 Tier)"}],
						[{description:"HARDEN BODY ARMOUR (Improves your body armour's defense)",method:7,equipment:"Body Armour",result:"(+1 Defense)"},{description:"REWORK BODY ARMOUR (Resets your body armour's modification count)",method:8,equipment:"Body Armour",result:"(Reset Body Armour Modifications)"},{description:"REFORGE BODY ARMOUR (Upgrades your body armour's tier)",method:9,equipment:"Body Armour",result:"(+1 Tier)"}],
						[{description:"HARDEN ARM ARMOUR (Improves your arm armour's defense)",method:10,equipment:"Arm Armour",result:"(+1 Defense)"},{description:"REWORK ARM ARMOUR (Resets your arm armour's modification count)",method:11,equipment:"Arm Armour",result:"(Reset Arm Armour Modifications)"},{description:"REFORGE ARM ARMOUR (Upgrades your arm armour's tier)",method:12,equipment:"Arm Armour",result:"(+1 Tier)"}],
						[{description:"HARDEN LEG ARMOUR (Improves your leg armour's defense)",method:13,equipment:"Leg Armour",result:"(+1 Defense)"},{description:"REWORK LEG ARMOUR (Resets your leg armour's modification count)",method:14,equipment:"Leg Armour",result:"(Reset Leg Armour Modifications)"},{description:"REFORGE LEG ARMOUR (Upgrades your leg armour's tier)",method:15,equipment:"Leg Armour",result:"(+1 Tier)"}],
						[{description:"HARDEN OFFHAND ARMOUR (Improves your offhand armour's defense)",method:19,equipment:"Offhand Armour",result:"(+1 Defense)"},{description:"REWORK OFFHAND ARMOUR (Resets your offhand armour's modification count)",method:20,equipment:"Offhand Armour",result:"(Reset Offhand Armour Modifications)"},{description:"REFORGE OFFHAND ARMOUR (Upgrades your offhand armour's tier)",method:21,equipment:"Offhand Armour",result:"(+1 Tier)"}]];
var smithRelicActions = [{description:"HARDEN RELIC (Improves your relic's health bonus)",method:16,equipment:"Relic",result:"(+4 Health Bonus)"},{description:"REWORK RELIC (Resets your relic's modification count)",method:17,equipment:"Relic",result:"(Reset Relic Modifications)"},{description:"REFORGE RELIC (Upgrades your relic's tier)",method:18,equipment:"Relic",result:"(+1 Tier)"}];

// Old item system
var attackRewards = [[' Broadsword',' Dagger',' Axe',' Greatsword',' Scimitar',' Rapier',' Zweihander',' Khopesh',' Falchion'],[' Spear',' Glaive',' Pike',' Lance'],[' Bow',' Crossbow',' Longbow',' Boomerang'],[' Knuckle-duster',' Combat Gauntlet',' Handwraps']];
var defenseRewards = [[' Helmet'],[' Chestplate',' Platemail',' Chainmail',' Scalemail',' Cloak'],[' Gauntlets',' Gloves',' Bracers'],[' Greaves',' Boots',' Shoes'],[' Shield']];
var healthRewards = [' Talisman',' Amulet',' Ring',' Anklet',' Fruit',' Mask',' Feather',' Claw',' Horn',' Scale',' Skull',' Jaw',' Jewel',' Bone'];

// Weighted tier probabilities, chooses a random number from these arrays and assigns that as the item's numeric tier
// Regular item drops
var itemTiers = [1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5,6,6,6,6,7];
// Drops from Mini Bosses
var miniBossItemTiers = [4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,6,6,6,6,6,6,7];
// Drops from Stage Bosses
var bossItemTiers = [5,5,5,5,5,6,6,6,7];
// Items found in shops, one from each list is used
var shopItemTiers = [[1,1,1,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3],[3,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,4,5,5,5,5,5,5,5,5,5],[5,5,5,5,5,5,5,5,5,5,6,6,6,6,6,6,6,7],[6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,6,7,7,7,7,7,7,7,7,7,7,8,8,8,9,9,10]];

// Tier names, Broken and all above S are unobtainable as standard drops, above S can only be bought from the Exoticist or upgraded from a lower tier item
var tierList = ["Broken","F","E","D","C","B","A","S","SS","SSS","X"];
// First number is the multiplier bonus, second number is the minimum multiplier (see playerTurn for how this works)
var tierVariation = [[0,0],[1,0],[0.5,0.5],[0.25,0.75],[0,1],[0.25,1],[0.5,1],[1,1],[1,1.25],[1,1.5],[1,2]];
// Item durabilities are found in this external file
var tierDurability = JSON.parse(fs.readFileSync('./tier-durability.json'));
// For use in the sprite system
var tierAuraColour = [{r:0,g:0,b:0},{r:127,g:127,b:127},{r:195,g:195,b:195},{r:255,g:255,b:255},{r:29,g:220,b:34},{r:75,g:68,b:223},{r:153,g:43,b:227},{r:235,g:3,b:235},{r:255,g:255,b:98},{r:255,g:217,b:231},{r:255,g:11,b:11}]
var rewardResult = '';
// Weapon attack stat multipliers, each number corresponds to a different weapon type (short, long, ranged, unarmed), first number of each array is one-handed, second is two-handed
var weaponConversionMatrix = [[1,2.4],[1.1,2],[0.75,2],[1.2,2]];

// Enemy moves that could be learned by the player via the Library, unused/removed
var learnableEnemyMoves = [{player:false,address:[1,1]},{player:false,address:[1,3]},{player:false,address:[1,4]},{player:false,address:[2,1]},{player:false,address:[3,1]},{player:false,address:[4,1]},{player:false,address:[4,4]},{player:false,address:[7,1]},{player:false,address:[7,2]}]
// Boss moves that could be learned by the player through the Cursed Tome, unused/removed
var bossMoves = [{player:false,address:[8,3]}];
// Demonic moves that can be learned by the player via Cursed Tome, each is an upgrade to each class's special move, costs health to use, is more powerful, and cannot be upgraded
// They are located in this external file
var demonicMoves = JSON.parse(fs.readFileSync('./demonic-attacks.json'));
// Reference to the special class moves for use when learning one from another class
var classMoves = [{player:true,address:[5,0]},{player:true,address:[5,1]},{player:true,address:[5,2]},{player:true,address:[5,3]},{player:true,address:[5,4]},{player:true,address:[5,5]}]
// Action IDs to Facebook reacts
var moveSlots = ["","[ANGRY]","[LIKE]","[HAHA]","[WOW]","[LOVE]","[SAD]"];

// Prefixes added to items upgraded in The Smith encounter
var weaponUpgradePrefixes = ['Sharpened','Hardened','Tempered'];
var armourUpgradePrefixes = ['Hardened','Tempered','Fitted'];
var reforgePrefixes = ['Reforged','Smithed','Re-tuned'];
// Prefixes added to items found through the Demonic Forge Sigil encounter
var demonicPrefixes = ['Forbidden','Cursed','Demonic','Eldritch','Unbound','Hell-forged','Evil']

// Blank Var
var dungeon = [];
// All dungeon assets located in this external file
var dungeonAssets = JSON.parse(fs.readFileSync('./dungeon-assets.json'));

// Unused Dungeon naming system
var dungeonPrefixes = ['The ', 'Blood ', 'Skull ', 'Crystal '];
var dungeonNames = ['Dungeon ', 'Tomb ', 'Crypt ', 'Cavern '];
var dungeonSuffixes = ['', 'of Ashes', 'of Bones', 'of Skulls'];

// Cursed Tome naming system
var bookPrefixes = ["Cursed ", "Demonic ", "Forbidden ", "Ancient ", "Arcane ", "Strange ", "Dark ","Blood-soaked "];
var bookNames = ["Tome", "Encyclopaedia", "Compendium", "Lexicon", "Volume", "Atlas", "Codex", "Dictionary","Manuscript"];
var bookSuffixes = [" of Flames", " of Bones", " of Flesh", " of Death", " of Power"];
// Various book contents from The Library
var bookContents = ["a book detailing the history of the Lyzzrdmeyen and their cultish ways","a scroll about a dark terror locked away in a vault","a book about an ancient empire of dragon riders"];
var bookTitle = "";
// Lore Books from The Library, mostly unencountered
var loreBooks = [
					{
						title:'"The Last Day"',
						pages:
						[
							'"The Shadow broke The Angel' + "'" + 's Gate, releasing the draconic horror back into The Dungeon. It warped The Dungeon with it' + "'" + 's might, bending reality to it' + "'" + 's will. Even The Architect perished in it' + "'" + 's wrath..."',
							'"The Blade rose to face The Angel, Spear in hand. The Sun burst back aflame as the two traded blows, and at the end of the third minute The Blade' + "'" + 's final strike fell, and The Sun grew dark once more..."',
							'"The Angel fell, it' + "'" + 's Gate sealed thereafter. The Shadow' + "'" + 's Gate was sealed too, but not before it could breach The Gate of The Demon King, his Horde reaching forth to ravage The Beyond and return to the world, should the Final Gate fall..."'
						]
					},
					{
						title:'"A Brief History of The Dungeon Explorer' + "'" + 's Guild"',
						pages:
						[
							'"' + "After The Last Day, The Dungeon remained untouched by the people of The Surface for centuries. It took 500 years since the cataclysmic battle between The Angel and The Blade for the first Dungeon Explorer to venture inside one of it's many entrances, and after his expedition he founded the Dungeon Explorer's Guild..." + '"',
							'"' + "Many people became members, and by the Dungeon Explorer's disappearance The Guild numbered over 1000. The Guild's numbers halved over the next 100 years, and after another 100 years only 8 members remain..." + '"',
							'"' + "They all reside within The Dungeon, outcast from the society of The Surface due to rumours of demonic influence over them. Despite their negative reputation, they are sworn to aid those who venture inside, even if the Explorer isn't a Guild member..." + '"'
						]
					},
					{
						title:'"' + "The Dungeon Explorer's Journal: Volume I" + '"',
						pages:
						[
							'"' + "My first expedition into The Dungeon has been a success, despite all of the tales of the demons and the near-apocalypse caused by it's alleged builders. The worst beast I encountered was some sort of troll-ogre hybrid. I need to share this with the people back at town..." + '"'
						]
					},
					{
						title:'"' + "The Dungeon Explorer's Journal: Volume II" + '"',
						pages:
						[
							'"' + "I have begun to create a map of The Dungeon during this second expedition. The new members of The Guild have been interested in the idea for some time now, perhaps it will make their beginnings as a Dungeon Explorer easier..." + '"'
						]
					},
					{
						title:'"' + "The Dungeon Explorer's Journal: Volume III" + '"',
						pages:
						[
							'"' + "During my third expedition I encountered something very strange. Perhaps I made a mistake in my original map, but the layout of The Dungeon seems to have changed since my last visit. Now that I reflect on it I don't believe the layout then was even the same as my first expedition! Something strange is going on here..." + '"'
						]
					},
					{
						title:'"' + "The Dungeon Explorer's Journal: Volume IV" + '"',
						pages:
						[
							'"' + "On another note, I have found the den of a giant lizard-like beast. It seems far too powerful to be defeated alone, perhaps I will enlist the help of some of the other Guild members to defeat it..." + '"'
						]
					},
					{
						title:'"' + "The Dungeon Explorer's Journal: Volume V" + '"',
						pages:
						[
							'"' + "The group expedition was a failure, and what I believed about The Dungeon is true. We managed to reach the third floor before we noticed what was happening, but even by then our party was halved. The rooms shift and change even during an expedition, as if we were all exploring a different Dungeon. I recognize the entrance to the lizard-beast's chanber ahead of me, perhaps I will wait and see if any other Explorers make it here..." + '"'
						]
					}
				]

// For use in Facebook comment
var encounterActions = [
						'',
						'',
						['None/Invalid Move','Leave the Chest','Open the Chest','None/Invalid Move','None/Invalid Move','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','Ignore Sigil','Activate Sigil','None/Invalid Move','None/Invalid Move','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Sword Symbol','Amulet Symbol','Shield Symbol','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','Leave The Library','Find Something to Read','Node/Invalid Move','None/Invalid Move','Find a Place to Rest','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','Rob The Merchant','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Leave The Room','Sleep in The Room','Search The Room','Rest in The Room','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Keep Current Equipment','Replace Offhand Equipment','Attempt to Scrap Reward','Replace Current Equipment','None/Invalid Move'],
						['None/Invalid Move','Attempt to Take the Reward','Attempt to Purchase the Reward','Leave the Explorer','None/Invalid Move','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','Loot the Shrine','None/Invalid Move','None/Invalid Move','None/Invalid Move','Pay Respects','None/Invalid Move'],
						['None/Invalid Move','Leave The Smith','Improve Weapon','Reforge Weapon','Reforge Armour','Improve Armour','None/Invalid Move'],
						['None/Invalid Move','Attack The Demon','Attempt to Escape','None/Invalid Move','None/Invalid Move','Worship The Demon','None/Invalid Move'],
						['None/Invalid Move','Put the Book Back','Read the Book','None/Invalid Move','None/Invalid Move','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','Leave the Fountain','Touch the Water','Toss a Coin','Splash Water onto Eyes','Drink the Water','None/Invalid Move'],
						['None/Invalid Move','Refuse','None/Invalid Move','None/Invalid Move','None/Invalid Move','Accept','None/Invalid Move'],
						['None/Invalid Move','Leave the Pool','None/Invalid Move','Attempt a Distraction','None/Invalid Move','Attempt Stealth','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Jump','Dodge','None/Invalid Move','Duck','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Jump','Dodge','None/Invalid Move','Duck','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Jump','Dodge','None/Invalid Move','Duck','None/Invalid Move'],
						['None/Invalid Move','Ignore the Move','None/Invalid Move','None/Invalid Move','None/Invalid Move','Learn the Move','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Jump','Dodge','None/Invalid Move','Duck','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Jump','Dodge','None/Invalid Move','Duck','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Jump','Dodge','None/Invalid Move','Duck','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Jump','Dodge','None/Invalid Move','Duck','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Jump','Dodge','None/Invalid Move','Duck','None/Invalid Move'],
						['None/Invalid Move','Upgrade [ANGRY]','Upgrade [LIKE]','Upgrade [HAHA]','Upgrade [WOW]','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','Upgrade [ANGRY]','Upgrade [LIKE]','Upgrade [HAHA]','Upgrade [WOW]','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','None/Invalid Move','Enhance Weapon','Enhance Secondary Weapon','Enhance Secondary Offhand','Enhance Offhand','None/Invalid Move'],
						['None/Invalid Move','Jump off the Portal Sigil','Stay on the Portal Sigil','None/Invalid Move','None/Invalid Move','None/Invalid Move','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Cancel','Sell Weapons','Sell Relic','None/Invalid Move','Sell Armour','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move'],
						['None/Invalid Move','Purchase Nothing','Purchase the First Item','Purchase the Third Item','None/Invalid Move','Purchase the Second Item','None/Invalid Move']
];
// For use in Facebook Post
var encounterNames = ["","Random Loot","Suspicious Chest","Strange Sigil","Three Pedestals","The Library","The Merchant","Empty Room","Get Loot Utility","Dungeon Explorer","Explorer Shrine","The Smith","Demonic Sigil","Cursed Tome","The Fountain","The Gatekeeper","Honey Pool","Hidden Trap","The Vault","The Vault","learn move utility","Throne Room","Throne Room","Throne Room","Throne Room","The Gatekeeper","Level Up","use consumable utility","select loot scrap utility","Portal Sigil","The Merchant","Sell Items","Sell Items","Sell Items","The Weaponer","The Weaponer","The Armourist","The Armourist","The Relificer","The Relificer","The Exoticist","The Exoticist"]

// Player moves are located in this external folder
var moves = JSON.parse(fs.readFileSync('./player-attacks.json'));
// Old combat system
var strongAttackActions = ['Vicious Slash'];
var normalAttackActions = ['Balanced Blow'];
var blockActions = ['Steady Block'];
var healActions = ['Recovery'];

// Old intents messages from old combat system
var strongAttackMessages = [' prepares to charge...', ' tenses with intent...',' powers up...'];
var normalAttackMessages = [' steps forward...', ' readies itself...',' begins an attack...'];
var blockMessages = [' tenses up...', " prepares it's defense..."," raises its guard"];
var healMessages = [' steps back...', " licks its wounds...",' turns away...'];
// Various death messages
var deathMessages = ['Impaled by','Brutally eviscerated by','Torn in half by','Shredded by','Slammed into the ground by','Absolutely annihilated by','Cut into several pieces by','Drained of all bodily fluids by','Removed of all vital organs by','Just straight up murdered by','Violently crushed by'];

// More vars used for initialization

var inFight = false;
var player = null;
var enemy = null;
var turn = 1;
var attack = 0;
var awaitMove = false;
var tempEnemyDefense = 1;
var tempPlayerDefense = 1;
var playerLevel = 1;
var playerXP = 0;
var wins = 0;
var runType = 0;
var enemyAttackType = 0;
var playerResult = '';
var enemyResult = '';
var enemyAction = '';
var highestRunScore = 0;
var highestRunName = '';
var runGold = 25;
var encounterType = 0;
var levelSkip = 0;
var healthLoss = 0;
var awaitChoice = false;
var shop1 = null;
var shop2 = null;
var shop3 = null;
var playerClass = 0;
var awaitClass = false;
var playerAction = 0;

var fightStartMessage = '';
var turnSummary = '';
var statusMessage = '';
var reward = false;
var encounterOccured = false;
var encounterSummary = '';
var previousEnemyAttack = 0;

var characterChoice = false;
var player1 = null;
var player2 = null;
var player3 = null;
var player4 = null;
var player5 = null;
var selectedCharacter = null;

var lootReward = null;

var playerReward = null;
var attacked = false;
var fallenHero;
var scrapChance;
var weaponUpgradeCost;
var weaponReforgeCost;
var armourUpgradeCost;
var armourReforgeCost;

var encounterDeathMessage = '';
var encounterCauseOfDeath = '';

var encounterResult = '';

var canSeeIntents = true;

var stage = 0;
var floor = 0;
var room = 0;

var fallenHeroMessage = '';

var enemyDodge = false;
var playerDodge = false;

var learnMove = null;

var smithActions = [[],[],[]];

var didGainLootEquipment = false;

var currentMerchant = {active:false}

// Change this to true if you want to enable sprites
// Note: Mostly incomplete, will run into issues
var outputImages = false;

console.log(getTimeStamp() + 'Online');

var inputData;

var stdin = process.openStdin();

//assemblePlayerImage();

var hasRun = false

stdin.addListener ("data", function (d) {
	// For use in commands to the bot or when in an offline run
	console.log("input = [" + d.toString().trim() + "]");
	inputData = d.toString().trim();
	run();
})

// Post scheduler, uncomment to run the script every hour
/*
cron.schedule('0 * * * *', () => {
	
  console.log(getTimeStamp() + 'Beginning Startup...');

	run();

});
*/

function run () {
	// Log into Facebook
//	FB.setAccessToken(token);
	// Load existing save file
	load();
	// Reload durabilities (fix for random issue where they sometimes get overridden)
	tierDurability = JSON.parse(fs.readFileSync('./tier-durability.json'))
	console.log(getTimeStamp() + "Processing Turn...");
	// Check run-state
	if (inFight == false && characterChoice == false) {
		// No run exists, generate player
		generatePlayerChoice();
	}
	else if (inFight == false && characterChoice == true) {
		// Run exists but player not selected
		getReactions();
	}
	else {
		// Run exists (redundant as leads to same outcome as previous statement)
		getReactions();
	}
}

function generatePlayerChoice() {
	console.log(getTimeStamp() + "Generating Player Choice...");
	// Load names (I don't know why it does this again)
	playerNames = JSON.parse(fs.readFileSync('./player-names.json'));
	// Assign names to players, make sure there are none repeated
	var player1name = Math.floor(Math.random() * (playerNames.length));
	var player2name = Math.floor(Math.random() * (playerNames.length));
	do {
		player2name = Math.floor(Math.random() * (playerNames.length));
	} while (player2name == player1name);
	var player3name = Math.floor(Math.random() * (playerNames.length));
	do {
		player3name = Math.floor(Math.random() * (playerNames.length));	
	} while (player3name == player2name || player3name == player1name);
	
	// Assign classes to players, make sure there are none repeated
	var player1class = Math.floor(Math.random() * (playerClasses.length - 1));
	var player2class = Math.floor(Math.random() * (playerClasses.length - 1));
	do {
		player2class = Math.floor(Math.random() * (playerClasses.length - 1));
	} while (player2class == player1class);
	var player3class = Math.floor(Math.random() * (playerClasses.length - 1));
	do {
		player3class = Math.floor(Math.random() * (playerClasses.length - 1));	
	} while (player3class == player2class || player3class == player1class);
	
	
	// Create players
	player1 = generatePlayer(player1name,player1class);
	player2 = generatePlayer(player2name,player2class);
	player3 = generatePlayer(player3name,player3class);
	// Description string and post to output
	var player1Description = player1.name + "\nHealth: " + player1.health + "/" + player1.maxHealth + "\nAttack " + player1.attack + "\nDefense " + player1.defense + "\n" + player1.abilityText;
	var player2Description = player2.name + "\nHealth: " + player2.health + "/" + player2.maxHealth + "\nAttack " + player2.attack + "\nDefense " + player2.defense + "\n" + player2.abilityText;
	var player3Description = player3.name + "\nHealth: " + player3.health + "/" + player3.maxHealth + "\nAttack " + player3.attack + "\nDefense " + player3.defense + "\n" + player3.abilityText;
	var output = "SELECT YOUR PLAYER\n\n" + player1Description + "\n\n" + player2Description + "\n\n" + player3Description + "\n\nIf no character is chosen then one will be randomly selected\n\nIf you'd like to submit a name for a player head to The Bot Appreciation Society Discord server (discord.gg/E5uNWqq) and use the command rpg!submit <namehere> in the #play-with-bots channel to enter it into the pool";
	var comment = player1.name + " - [LIKE] \n" + player2.name + " - [LOVE] \n" + player3.name + " - [HAHA]";
	characterChoice = true;
	post(output, comment);
	inFight = false;
	save();
}

function generateRun (playerChosen) {
	console.log(getTimeStamp() + "Generating Run...");
	generateDungeon(true);
//	var postid = fs.readFileSync('./previous-post-id2.json');
	if (playerChosen == 2,3,5) {
		var characters = [null,null,player1,player3,null,player2]
		player = characters[playerChosen];
		if (player.playerClass == 6) {
			var classes = [0,1,2,3,4,5]
			player.playerClass = classes[Math.floor(Math.random() * classes.length)]
			player.abilityText = "[Class] " + playerClasses[player.playerClass].activeAbility;
			for (i = 0; i < player.abilities.length; i++) {
				player.abilityText += "\n" + player.abilities[i].typeName + " " + player.abilities[i].name + "\n" + player.abilities[i].description
			}
			var playerClassMove = moves[5][player.playerClass][0];
			if (player.weapon.id == playerClassMove.reqWeaponID) {
				if (player.weapon.twohanded && playerClassMove.reqTwoHanded) {
					player.moves[playerClassMove.slot] = playerClassMove;
				}
				else if (!player.weapon.twohanded && playerClassMove.reqOneHanded) {
					player.moves[playerClassMove.slot] = playerClassMove;
				}
				else if (!playerClassMove.reqTwoHanded && !playerClassMove.reqOneHanded) {
					player.moves[playerClassMove.slot] = playerClassMove;
				}
			}
			if (player.offhand.type == 1 && player.offhand.id == 4 && playerClassMove.reqShield) {
				player.moves[playerClassMove.slot] = playerClassMove;
			} 
		}
		
		Jimp.read('./images/explorer-class-images/' + player.playerClass + '.png', (err, img) => {
			if (err) throw err;
			img.write('./bin/player.png');
		});
		
	}
	else {
		var characters = [player1,player2,player3]
		player = characters[Math.floor(Math.random() * characters.length)]
	}
	var comment = "Character Chosen = " + player.name + "\nBeginning Run..."
	//postComment(postid,comment);
	enemy = generateEnemy();
	inFight = true;
	characterChoice = false;
	awaitMove = true;
	player1 = null;
	player2 = null;
	player3 = null;
	player4 = null;
	player5 = null;
	selectedCharacter = null;
	turn = 1;
	wins = 0;
	playerLevel = 1;
	previousEnemyAttack = 0;
	turnSummary = player.name + " approaches the stone archway that marks the entrance to The Dungeon. Like the many Explorers before them, " + player.firstName + " contemplates the many unanswered mysteries of The Dungeon as they walk down the staircase, into the darkness, until they finaly set their eyes upon the first stage of The Dungeon... " + dungeon[stage].name + "\n\n" + dungeon[stage].entryMessage + "\n\n";
	
	setTimeout(function () {turnStart(true);}, 1000);
}

function generatePlayer (name,playerClass) {
	// Player generation function
	console.log(getTimeStamp() + "Generating Player...");
	var playerName = playerNames[name];
	var playerSuffix = playerSuffixes[stage][Math.floor(Math.random() * (playerSuffixes[stage].length))];
	var playerClassID = playerClasses[playerClass].id;
	var playerClassName = playerClasses[playerClassID].name;
	var playerHealthCore = playerClasses[playerClassID].maxHealth;
	var playerAttackCore = playerClasses[playerClassID].attack;
	var playerDefenseCore = playerClasses[playerClassID].defense
	var playerHead = playerClasses[playerClassID].head;
	var playerBody = playerClasses[playerClassID].body;
	var playerArms = playerClasses[playerClassID].arms;
	var playerLegs = playerClasses[playerClassID].legs;
	var playerRelic = playerClasses[playerClassID].relic;
	var playerWeapon = playerClasses[playerClassID].weapon;
	var playerOffhand = playerClasses[playerClassID].offhand;
	var playerSecondaryWeapon = playerClasses[playerClassID].secondaryWeapon;
	var playerSecondaryOffhand = playerClasses[playerClassID].secondaryOffhand;
	var playerMoveLevels = playerClasses[playerClassID].movelevels;
	var playerStoredItemsCapacity = playerClasses[playerClassID].storedItemsCapacity;
	var playerConsumablesCapacity = playerClasses[playerClassID].consumablesCapacity;
	var playerInventoryCapacity = playerClasses[playerClassID].inventoryCapacity;
	var playerHealth = playerHealthCore + playerHead.healthBonus + playerBody.healthBonus + playerArms.healthBonus + playerLegs.healthBonus + playerRelic.healthBonus + playerWeapon.healthBonus + playerOffhand.healthBonus;
	var playerAttack = playerAttackCore + playerHead.attackBonus + playerBody.attackBonus + playerArms.attackBonus + playerLegs.attackBonus + playerRelic.attackBonus + playerWeapon.attackBonus + playerOffhand.attackBonus;
	var playerDefense = playerDefenseCore + playerHead.defenseBonus + playerBody.defenseBonus + playerArms.defenseBonus + playerLegs.defenseBonus + playerRelic.defenseBonus + playerWeapon.defenseBonus + playerOffhand.defenseBonus;
	var playerMoves = [{type:"Special",name:"Nothing",description:"Does nothing",requirementText:"No requirements",attackMultiplier:0,defenseMultiplier:0,ignoreDefense:false,method:7},
						moves[playerWeapon.id][1][playerMoveLevels[playerWeapon.id][1]],
						moves[playerWeapon.id][2][playerMoveLevels[playerWeapon.id][2]],
						moves[playerWeapon.id][3][playerMoveLevels[playerWeapon.id][3]],
						moves[playerWeapon.id][4][playerMoveLevels[playerWeapon.id][4]],
						moves[playerWeapon.id][5],
						{type:"Consumable Move Placeholder"}];
	var playerEquipmentBase = {head:playerHead.base,body:playerBody.base,arms:playerArms.base,legs:playerLegs.base,offhand:playerOffhand.base,weapon:playerWeapon.base,relic:playerRelic.base}
	var playerXP = 0;
	var playerPassiveAbility = [abilities[playerClasses[playerClassID].passiveAbility[Math.floor(Math.random() * playerClasses[playerClassID].passiveAbility.length)]]];
	var playerAbilityText = "[Class] " + playerClasses[playerClassID].activeAbility;
	var playerRace = playerRaces[Math.floor(Math.random() * playerRaces.length)]
	for (i = 0; i < playerPassiveAbility.length; i++) {
		playerAbilityText += "\n" + playerPassiveAbility[i].typeName + " " + playerPassiveAbility[i].name + "\n" + playerPassiveAbility[i].description
	}
	
	tempPlayerDefense = playerDefense;
	
	var playerClassMove = moves[5][playerClassID][0];
	if (playerClassID != 6) {
		playerMoves[playerClassMove.slot] = playerClassMove;
	}
	var levelModifier = 1;
	
	var currentPlayer = {name: playerClassName + " " + playerName + " " + playerSuffix,className:playerClassName,firstName:playerName,suffix:playerSuffix,healthCore:playerHealthCore,attackCore:playerAttackCore,attackVar:0,abilityAttackVar:0,defenseCore:playerDefenseCore,defenseVar:0,abilityDefenseVar:0,maxHealth:playerHealth,health:playerHealth,attack:playerAttack, defense: playerDefense, level: levelModifier, playerClass: playerClassID, abilityText: playerAbilityText, abilities: playerPassiveAbility, supplies: 10, previousMove:0, moves: playerMoves,learntMoves:[],head:playerHead,body:playerBody,arms:playerArms,legs:playerLegs,relic:playerRelic,weapon:playerWeapon,offhand:playerOffhand,secondaryWeapon:playerSecondaryWeapon,secondaryOffhand:playerSecondaryOffhand,xp:playerXP,equipmentBase:playerEquipmentBase,canSeeIntents:true,blindDuration:0,storedItems:[],storedItemsCapacity:playerStoredItemsCapacity,movelevels:playerMoveLevels,poison:0,blindDuration:0,frost:0,blaze:0,shock:0,decayDuration:0,decayStrength:0,madnessDuration:0,speed:1,race:playerRace};
	
	return(currentPlayer);
}

function generatePlayerEnemy () {
	// Explorer enemy generation function
	var playerName = playerNames[Math.floor(Math.random() * (playerNames.length))];
	var playerSuffix = playerSuffixes[stage][Math.floor(Math.random() * (playerSuffixes[stage].length))];
	do {
		var playerClassID = playerClasses[Math.floor(Math.random() * (playerClasses.length))].id;
	} 
	while (playerClassID == player.playerClass);
	var playerClassName = playerClasses[playerClassID].name;
	var playerAbility = abilities[playerClasses[playerClassID].passiveAbility[Math.floor(Math.random() * playerClasses[playerClassID].passiveAbility.length)]];
	var playerHealthCore = playerClasses[playerClassID].maxHealth;
	var playerAttackCore = playerClasses[playerClassID].attack;
	var playerDefenseCore = playerClasses[playerClassID].defense;
	var playerHead = playerClasses[playerClassID].head;
	var playerBody = playerClasses[playerClassID].body;
	var playerArms = playerClasses[playerClassID].arms;
	var playerLegs = playerClasses[playerClassID].legs;
	var playerRelic = playerClasses[playerClassID].relic;
	var playerWeapon = playerClasses[playerClassID].weapon;
	var playerOffhand = playerClasses[playerClassID].offhand;
	var playerHealth = playerHealthCore + playerHead.healthBonus + playerBody.healthBonus + playerArms.healthBonus + playerLegs.healthBonus + playerRelic.healthBonus + playerWeapon.healthBonus + playerOffhand.healthBonus;
	var playerAttack = playerAttackCore + playerHead.attackBonus + playerBody.attackBonus + playerArms.attackBonus + playerLegs.attackBonus + playerRelic.attackBonus + playerWeapon.attackBonus + playerOffhand.attackBonus;
	var playerDefense = playerDefenseCore + playerHead.defenseBonus + playerBody.defenseBonus + playerArms.defenseBonus + playerLegs.defenseBonus + playerRelic.defenseBonus + playerWeapon.defenseBonus + playerOffhand.defenseBonus;
	var scaledLevelModifier = (wins + 1) / 10;
	var gold = Math.floor(scaledLevelModifier * 35 * (Math.random() + 1));
	var enemyXP = Math.floor(0.33 * playerHealth) + 1;
	if (playerClassID == 5) {
		playerAttack *= 2;
	}
	var attackset = [moves[playerWeapon.id][1][stage],moves[playerWeapon.id][2][stage],moves[playerWeapon.id][3][stage],moves[playerWeapon.id][4][stage]];
	
	var enemySpecialModifiers = [];
	if (Math.random() < (floor + stage) / dungeon[stage].floors.length) {
		enemySpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
		if (Math.random() < (floor + stage) / dungeon[stage].floors.length && stage > 1) {
			enemySpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
			if (Math.random() < (floor + stage) / dungeon[stage].floors.length && stage > 3) {
				enemySpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
			}
		}
	}
	
	
	
	var currentPlayerEnemy = {name: playerClassName + " " + playerName + " " + playerSuffix, healthCore: playerHealthCore, maxHealth: playerHealth, health: playerHealth, attackCore:  playerAttackCore, attack: playerAttack, defenseCore: playerDefenseCore, defense: playerDefense, goldPotential: gold, boss: false, fallen: false, firstName: playerName,ranReward:false,doReward:true,player:true,xp:enemyXP,attacks:attackset,classIDPlayer:playerClassID,poison:0,blaze:0,shock:0,decayDuration:0,decayStrength:0,ability:playerAbility,speed:0,entryMessage:"The Explorer draws their weapons in response to the threat, readying themself for the fight...",deathMessage:"The Explorer collapses to the ground in a pool of blood, aching as they slowly die...",effectModifiers:enemySpecialModifiers, head: playerHead, body: playerBody, arms: playerArms, legs: playerLegs, weapon: playerWeapon, offhand: playerOffhand, relic: playerRelic};
	
	for (i = 0; i < enemySpecialModifiers.length; i++) {
		currentPlayerEnemy.name = enemySpecialModifiers[i].prefix + " " + currentPlayerEnemy.name;
	}
	
	tempEnemyDefense = currentPlayerEnemy.defense;
	return(currentPlayerEnemy);
}

function generateEnemy () {
	// Basic enemy generation function
	console.log(getTimeStamp() + "Generating Enemy...");
	var deathLog = JSON.parse(fs.readFileSync('./deathlog.json'));
	var heroEncounterChance = Math.floor(Math.random() * deathLog.length);
	var enemyPrefix = Math.floor(Math.random() * (enemyPrefixes.length));
	var enemyName = Math.floor(Math.random() * (dungeon[stage].enemyTypes.length));
	var baseAttack = Math.floor(Math.random() * (3));
	var baseDefense = Math.floor(Math.random() * (2));
	var baseHealth = Math.floor(Math.random() * (6));
	var scaledLevelModifier = (wins + 1) / 10;
	var gold = Math.floor(scaledLevelModifier * 15 * (Math.random() + 1));
	var enemyXP = Math.floor(0.25 * (baseHealth + (15 * ((((wins + 3)/5)) + 1)))) + 1;
	var fallenChance = Math.random();
	var enemyEntryMessage = dungeon[stage].enemyTypes[enemyName].entryMessage;
	var enemyDeathMessage = dungeon[stage].enemyTypes[enemyName].deathMessage;
	if (deathLog[heroEncounterChance].floor == wins && fallenChance < 0.263) {
		var attackset = [enemyAttacks[1][2][stage],enemyAttacks[2][2],enemyAttacks[3][2][stage],enemyAttacks[4][2][stage]];
		var currentEnemy = {name: "Fallen " + deathLog[heroEncounterChance].name, maxHealth: Math.floor(deathLog[heroEncounterChance].maxHealth * ((wins) / 15)), health: Math.floor(deathLog[heroEncounterChance].maxHealth * ((wins) / 15)), attack: deathLog[heroEncounterChance].attack, defense: deathLog[heroEncounterChance].defense, goldPotential: gold, boss: false, fallen: true, firstName: deathLog[heroEncounterChance].firstName, head: deathLog[heroEncounterChance].head, body: deathLog[heroEncounterChance].body, arms: deathLog[heroEncounterChance].arms, legs: deathLog[heroEncounterChance].legs, relic: deathLog[heroEncounterChance].relic, weapon: deathLog[heroEncounterChance].weapon, offhand: deathLog[heroEncounterChance].offhand,ranReward: deathLog[heroEncounterChance].ranReward,xp:Math.floor(scaledLevelModifier * deathLog[heroEncounterChance].maxHealth),attacks:attackset,poison:0,blaze:0,shock:0,decayDuration:0,decayStrength:0,speed:0,entryMessage:"A once-living Explorer emerges from the ground, it's necrotic body bidden by some nefarious force to act as a machine of death...",deathMessage:"The Fallen Explorer disintegrates with the Explorer's final blow, it's necrotic flesh and bone disappearing into the air..."};
	}
	else {
		var enemySpecialModifiers = [];
		if (Math.random() < (floor / (dungeon[stage].floors.length)) && stage > 0) {
			enemySpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
			if (Math.random() < (floor / (dungeon[stage].floors.length)) && stage > 2) {
				enemySpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
				if (Math.random() < (floor / (dungeon[stage].floors.length)) && stage > 4) {
					enemySpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
				}
			}
		}
/*		var enemySpecialTypes = [];
		if (Math.random() < (getProgress()[0] * 2)/getProgress()[1]) {
			var selectedSubType = enemySubTypePrefixes[Math.floor(Math.random() * enemySubTypePrefixes.length)];
			if (selectedSubType.rarity <= stage) {
				enemySpecialTypes.push(selectedSubType);
				if (Math.random() < (getProgress()[0])/getProgress()[1]) {
					selectedSubType = enemySubTypePrefixes[Math.floor(Math.random() * enemySubTypePrefixes.length)];
					if (selectedSubType.rarity <= stage + 1 && selectedSubType.typeID != enemySpecialTypes[0].typeID) {
						enemySpecialTypes.push(selectedSubType);
						if (Math.random() < (getProgress()[0])/(getProgress()[1] * 2)) {
							selectedSubType = enemySubTypePrefixes[Math.floor(Math.random() * enemySubTypePrefixes.length)];
							if (selectedSubType.rarity <= stage + 2 && selectedSubType.typeID != enemySpecialTypes[0].typeID && selectedSubType.typeID != enemySpecialTypes[1].typeID) {
								enemySpecialTypes.push(selectedSubType);
							}
						}
					}
				}
			}
		}
*/		
		var attackset = []
		moveToBoost1 = -1;
		if (floor > dungeon[stage].floors.length) {
			moveToBoost1 = Math.floor(Math.random() * (dungeon[stage].bossTypes[bossName].attackset.length - 1) + 1);
		}
		i = 0;
		while (i < dungeon[stage].enemyTypes[enemyName].attackset.length) {
			if (i == moveToBoost1) {
				attackset.push(enemyAttacks[dungeon[stage].enemyTypes[enemyName].attackset[i][0]][dungeon[stage].enemyTypes[enemyName].attackset[i][1]][stage + 1])
			}
			else {
				attackset.push(enemyAttacks[dungeon[stage].enemyTypes[enemyName].attackset[i][0]][dungeon[stage].enemyTypes[enemyName].attackset[i][1]][stage])
			}
			attackset[i].known = false;
			i++;
		}
		var currentEnemy = {name: enemyPrefixes[enemyPrefix] + " " + dungeon[stage].enemyTypes[enemyName].name, imgID: dungeon[stage].enemyTypes[enemyName].id, maxHealth: Math.floor(baseHealth + (15 * ((((wins + 3)/5)) + 1))), health: Math.floor(baseHealth + (15 * ((((wins + 3)/5)) + 1))), attack: Math.floor(baseAttack + (5 * (((wins/ 10)) + 1))), defense: Math.floor(baseDefense + (4 * (((wins/ 10)) + 1))), goldPotential: gold, boss: false, fallen: false, firstName: enemyPrefixes[enemyPrefix] + " " + dungeon[stage].enemyTypes[enemyName].name,ranReward:true,xp:enemyXP,attacks:attackset,poison:0,blaze:0,shock:0,decayDuration:0,decayStrength:0,speed:0,entryMessage:enemyEntryMessage,deathMessage:enemyDeathMessage,effectModifiers:enemySpecialModifiers};
	}
	i = 0;
	while (i < dungeon[stage].enemyTypes[enemyName].types.length) {
		switch (dungeon[stage].enemyTypes[enemyName].types[i]) {
			case 0:
			currentEnemy.ethereal = true;
			break;
			
			case 1:
			currentEnemy.flying = true;
			break;
			
			case 2:
			currentEnemy.small = true;
			break;
			
			case 3:
			currentEnemy.big = true;
			break;
			
			case 4:
			currentEnemy.mounted = true;
			break;
			
			case 5:
			currentEnemy.fallen = true;
			break;
			
			case 6:
			currentEnemy.armoured = true;
			break;
			
			case 7:
			currentEnemy.burrowing = true;
			break;
			
			case 18:
			currentEnemy.human = true;
			break
		}
		i++;
	}
/*	for (i = 0; i < enemySpecialTypes.length; i++) {
		currentEnemy.name = enemySpecialTypes[i].prefix + " " + currentEnemy.name;
		switch (enemySpecialTypes[i].typeID) {
			case 0:
			currentEnemy.ethereal = true;
			break;
			
			case 1:
			currentEnemy.flying = true;
			break;
			
			case 2:
			currentEnemy.small = true;
			break;
			
			case 3:
			currentEnemy.big = true;
			break;
			
			case 4:
			currentEnemy.mounted = true;
			break;
			
			case 5:
			currentEnemy.fallen = true;
			break;
			
			case 6:
			currentEnemy.armoured = true;
			break;
			
			case 7:
			currentEnemy.burrowing = true;
			break;
		}
	}
*/
	for (i = 0; i < enemySpecialModifiers.length; i++) {
		currentEnemy.name = enemySpecialModifiers[i].prefix + " " + currentEnemy.name;
	}
	tempEnemyDefense = currentEnemy.defense;
	return (currentEnemy);
}

function generateMiniBoss (miniBossID) {
	// Mini Boss enemy generation function
	console.log(getTimeStamp() + "Generating Enemy...");
	var enemyPrefix = Math.floor(Math.random() * (enemyPrefixes.length));
	var enemyName = specialEnemies[miniBossID].name;
	var baseAttack = Math.floor(Math.random() * (3));
	var baseDefense = Math.floor(Math.random() * (2));
	var baseHealth = Math.floor(Math.random() * (6));
	var scaledLevelModifier = (wins + 1) / 10;
	var gold = Math.floor(scaledLevelModifier * 15 * (Math.random() + 1));
	var enemyXP = Math.floor(0.25 * (baseHealth + (15 * ((((wins + 3)/5)) + 1)))) + 1;
	var attackset = []
	moveToBoost1 = Math.floor(Math.random() * (specialEnemies[miniBossID].attackset.length - 1) + 1);
	moveToBoost2 = -1;
	if (floor > dungeon[stage].floors.length) {
		moveToBoost2 = Math.floor(Math.random() * (specialEnemies[miniBossID].attackset.length - 1) + 1);
	}
	i = 0;
	while (i < specialEnemies[miniBossID].attackset.length) {
		if (i == moveToBoost1 || i == moveToBoost2) {
			attackset.push(enemyAttacks[specialEnemies[miniBossID].attackset[i][0]][specialEnemies[miniBossID].attackset[i][1]][stage + 1])
		}
		else {
			attackset.push(enemyAttacks[specialEnemies[miniBossID].attackset[i][0]][specialEnemies[miniBossID].attackset[i][1]][stage])
		}
		i++;
	}
	var currentEnemy = {name: enemyPrefixes[enemyPrefix] + " " + specialEnemies[miniBossID].name, imgID: specialEnemies[miniBossID].id, maxHealth: Math.floor(baseHealth + (25 * ((((wins + 3)/5)) + 1)) + (2 * wins)), health: Math.floor(baseHealth + (25 * ((((wins + 3)/5)) + 1)) + (2 * wins)), attack: Math.floor(baseAttack + (5 * (((wins / 8 )) + 1))), defense: Math.floor(baseDefense + (4 * (((wins / 8 )) + 1))), goldPotential: gold, boss: false, fallen: false, firstName: specialEnemies[miniBossID].name,ranReward:true,xp:enemyXP,miniboss:true,attacks:attackset,poison:0,blaze:0,shock:0,decayDuration:0,decayStrength:0,speed:0,effectModifiers:[]};
	
	i = 0;
	while (i < specialEnemies[miniBossID].types.length) {
		switch (specialEnemies[miniBossID].types[i]) {
			case 0:
			currentEnemy.ethereal = true;
			break;
			
			case 1:
			currentEnemy.flying = true;
			break;
			
			case 2:
			currentEnemy.small = true;
			break;
			
			case 3:
			currentEnemy.big = true;
			break;
			
			case 4:
			currentEnemy.mounted = true;
			break;
			
			case 5:
			currentEnemy.fallen = true;
			break;
			
			case 6:
			currentEnemy.armoured = true;
			break;
			
			case 7:
			currentEnemy.burrowing = true;
			break;
		}
		i++;
	}
	
	tempEnemyDefense = currentEnemy.defense;
	return (currentEnemy);
}

function generateBoss (canFallen) {
	// Stage Boss generation function
	console.log(getTimeStamp() + "Generating Boss...");
	var deathLog = JSON.parse(fs.readFileSync('./deathlog.json'));
	var heroEncounterChance = Math.floor(Math.random() * deathLog.length);
	var assignPrefix = Math.floor(Math.random() * (bossPrefixes.length));
	var assignType = Math.floor(Math.random() * (bossTypes.length));
	var assignName = Math.floor(Math.random() * (bossNames.length));
	var bossName = Math.floor(Math.random() * (dungeon[stage].bossTypes.length));
	var baseAttack = Math.random() * (5);
	var baseDefense = Math.random() * (2);
	var baseHealth = Math.random() * (8);
	var scaledLevelModifier = wins / 5;
	var enemyXP = Math.floor(0.5 * (baseHealth + (30 * ((((wins + 3)/5)) + 1)))) + 1;
	var gold = Math.floor(scaledLevelModifier * 50 * Math.random())
	var enemyEntryMessage = dungeon[stage].bossTypes[bossName].entryMessage;
	var enemyDeathMessage = dungeon[stage].bossTypes[bossName].deathMessage;
	if (deathLog[heroEncounterChance].floor == wins && canFallen) {
		var attackset = [enemyAttacks[1][2][stage],enemyAttacks[2][2][stage],enemyAttacks[3][2][stage],enemyAttacks[4][2][stage]];
		var currentBoss = {name: "Fallen " + deathLog[heroEncounterChance].name, maxHealth: Math.floor(deathLog[heroEncounterChance].maxHealth * ((wins + 2) / 10)), health: Math.floor(deathLog[heroEncounterChance].maxHealth * ((wins + 2) / 10)), attack: Math.floor(deathLog[heroEncounterChance].attack * 1.5), defense: Math.floor(deathLog[heroEncounterChance].defense * 1.25), goldPotential: gold, boss: true, fallen: true, firstName: deathLog[heroEncounterChance].firstName, head: deathLog[heroEncounterChance].head, body: deathLog[heroEncounterChance].body, arms: deathLog[heroEncounterChance].arms, legs: deathLog[heroEncounterChance].legs, relic: deathLog[heroEncounterChance].relic, weapon: deathLog[heroEncounterChance].weapon, offhand: deathLog[heroEncounterChance].offhand,ranReward: deathLog[heroEncounterChance].ranReward,xp:enemyXP,attacks:attackset,poison:0,blaze:0,shock:0,decayDuration:0,decayStrength:0,speed:0,entryMessage:"A once-living Explorer emerges from the ground, it's necrotic body bidden by some nefarious force to act as a machine of death...",deathMessage:"The Fallen Explorer disintegrates with the Explorer's final blow, it's necrotic flesh and bone disappearing into the air..."};
	}
	else {
		var bossSpecialModifiers = [];
		if (Math.random() <  stage * 0.1) {
			bossSpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
			if (Math.random() < stage * 0.1 && stage > 1) {
				bossSpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
				if (Math.random() < stage * 0.1 && stage > 3) {
					bossSpecialModifiers.push(enemySpecialPrefixes[Math.floor(Math.random() * enemySpecialPrefixes.length)]);
				}
			}
		}
		
		var attackset = []
		moveToBoost1 = Math.floor(Math.random() * (dungeon[stage].bossTypes[bossName].attackset.length - 1) + 1);
		moveToBoost2 = Math.floor(Math.random() * (dungeon[stage].bossTypes[bossName].attackset.length - 1) + 1);
		while (moveToBoost2 == moveToBoost1) {
			moveToBoost2 = Math.floor(Math.random() * (dungeon[stage].bossTypes[bossName].attackset.length - 1) + 1);
		}
		i = 0;
		while (i < dungeon[stage].bossTypes[bossName].attackset.length) {
			if (i == moveToBoost1 || i == moveToBoost2) {
				attackset.push(enemyAttacks[dungeon[stage].bossTypes[bossName].attackset[i][0]][dungeon[stage].bossTypes[bossName].attackset[i][1]][stage + 1])
			}
			else {
				attackset.push(enemyAttacks[dungeon[stage].bossTypes[bossName].attackset[i][0]][dungeon[stage].bossTypes[bossName].attackset[i][1]][stage])
			}
			i++;
		}
		var currentBoss = {name:dungeon[stage].bossTypes[bossName].name, imgID: dungeon[stage].bossTypes[bossName].id, maxHealth: Math.floor(baseHealth + (25 * ((((wins + 3)/5)) + 1)) + (2 * wins)), health: Math.floor(baseHealth + (25 * ((((wins + 3)/5)) + 1)) + (2 * wins)), attack: Math.floor(baseAttack + (6 * ((((wins + 3)/8)) + Math.random()))), defense: Math.floor(baseDefense + (5 * ((((wins + 3)/8)) + Math.random()))), goldPotential: gold, boss: true, fallen: false, firstName: dungeon[stage].bossTypes[bossName].name,xp:enemyXP,attacks:attackset,phases:dungeon[stage].bossTypes[bossName].phases,currentPhase:0,ranReward:true,poison:0,blaze:0,shock:0,decayDuration:0,decayStrength:0,speed:0,entryMessage:enemyEntryMessage,deathMessage:enemyDeathMessage,effectModifiers:bossSpecialModifiers};
		for (i = 0; i < bossSpecialModifiers.length; i++) {
			currentBoss.name = bossSpecialModifiers[i].prefix + " " + currentBoss.name;
		}
		currentBoss.name = "The " + currentBoss.name;
	}
	
	i = 0;
	while (i < dungeon[stage].bossTypes[bossName].types.length) {
		switch (dungeon[stage].bossTypes[bossName].types[i]) {
			case 0:
			currentBoss.ethereal = true;
			break;
			
			case 1:
			currentBoss.flying = true;
			break;
			
			case 2:
			currentBoss.small = true;
			break;
			
			case 3:
			currentBoss.big = true;
			break;
			
			case 4:
			currentBoss.mounted = true;
			break;
			
			case 5:
			currentBoss.fallen = true;
			break;
			
			case 6:
			currentBoss.armoured = true;
			break;
			
			case 7:
			currentBoss.burrowing = true;
			break;
		}
		i++;
	}
	
	tempEnemyDefense = currentBoss.defense;
	return (currentBoss);
}

function generateDungeon (newRun) {
	k = 0;
	var newRun2 = newRun;
	while (k < 5) {
		//generate stage
		var stageTheme = 0;
		if (Math.random() < 0.75 && k != 0) {
			do {
				stageTheme = Math.floor(Math.random() * dungeonAssets.length);
			} while (stageTheme == 0 || stageTheme == 1);
		}
		//generate floors
		var floors = [];
		//generate rooms
		var generateRoom;
		i = 0;
		var stageLength = Math.floor(Math.random() * (dungeonAssets[stageTheme].floorMultiplier)) + (dungeonAssets[stageTheme].floorMin);
		while (i < stageLength) {
			var generateFloor = [];
			var roomCount = Math.floor(Math.random() * (dungeonAssets[stageTheme].roomMultiplier)) + (dungeonAssets[stageTheme].roomMin);
			generateFloor.push({roomType:0});
			j = 0;
			while (j < roomCount) {
				generateRoomTypeClass = Math.floor(Math.random() * 10);
				switch (generateRoomTypeClass) {
					case 0:
					case 1:
					case 2:
					case 3:
					generateRoom = {roomType:2};
					generateFloor.push(generateRoom);
					break;
					
					case 4:
					case 5:
					case 6:
					case 7:
					case 8:
					generateRoom = {roomType:3};
					generateFloor.push(generateRoom);
					break;
					
					case 9:
					generateRoom = {roomType:4};
					generateFloor.push(generateRoom);
					break;
				}
				j++;
			}
			generateFloor.push({roomType:1});
			floors.push(generateFloor);
			i++;
		}
		floors.push([{roomType:0},{roomType:6,merchantType:merchants[Math.floor(Math.random() * merchants.length)]},{roomType:5},{roomType:1}]);
		var generateStage =    {name:dungeonAssets[stageTheme].name,
								theme:dungeonAssets[stageTheme].id,
								entryMessage:dungeonAssets[stageTheme].entryMessage,
								roomName:dungeonAssets[stageTheme].roomName,
								floorName:dungeonAssets[stageTheme].floorName,
								encounters:dungeonAssets[stageTheme].encounters,
								enemyTypes:dungeonAssets[stageTheme].enemyTypes,
								bossTypes:dungeonAssets[stageTheme].bossTypes,
								weapons:dungeonAssets[stageTheme].weapons,
								armour:dungeonAssets[stageTheme].armour,
								relics:dungeonAssets[stageTheme].relics,
								floors:floors};
		if (newRun2) {
			dungeon = [(generateStage)];
			fs.writeFileSync('./dungeon2.json', dungeon);
		}
		else {
			dungeon.push(generateStage);
			fs.writeFileSync('./dungeon2.json', dungeon);
		}
		k++;
		newRun2 = false;
	}
	stageTheme = 1;
	floors = [[{roomType:0},{roomType:3},{roomType:8}]];
	var finalStage =   {name:dungeonAssets[stageTheme].name,
						theme:dungeonAssets[stageTheme].id,
						entryMessage:dungeonAssets[stageTheme].entryMessage,
						roomName:dungeonAssets[stageTheme].roomName,
						floorName:dungeonAssets[stageTheme].floorName,
						encounters:dungeonAssets[stageTheme].encounters,
						enemyTypes:dungeonAssets[stageTheme].enemyTypes,
						bossTypes:dungeonAssets[stageTheme].bossTypes,
						weapons:dungeonAssets[stageTheme].weapons,
						armour:dungeonAssets[stageTheme].armour,
						relics:dungeonAssets[stageTheme].relics,
						floors:floors}; 
	dungeon.push(finalStage);
	fs.writeFileSync('./dungeon2.json', dungeon);
}

function generateFight() {
	console.log(getTimeStamp() + "Generating Fight...");
	enemyAttackType = Math.floor(Math.random() * (4));
	enemyMessage = Math.floor(Math.random() * (strongAttackMessages.length));
	switch (enemyAttackType) {
		case 0:
		enemyAction = enemy.name + strongAttackMessages[enemyMessage];
		break;
		
		case 1:
		enemyAction = enemy.name + normalAttackMessages[enemyMessage];
		break;
		
		case 2:
		enemyAction = enemy.name + blockMessages[enemyMessage];
		break;
		
		case 3:
		enemyAction = enemy.name + healMessages[enemyMessage];
		break;
	}
}

function turnStart(playerFirst,renderPlayer) {
	console.log(getTimeStamp() + "Turn Start..."); 
	if (dungeon[stage].floors[floor][room].roomType == 1) {
		room = 0;
		floor++;
	}
	if ((floor + 1) > dungeon[stage].floors.length) {
		room = 0;
		floor = 0;
		stage++;
		player.suffix = playerSuffixes[stage][Math.floor(Math.random() * (playerSuffixes[stage].length))];
		player.name = player.className + " " + player.firstName + " " + player.suffix;
		player.health = player.maxHealth;
		encounterResult += "Leaving the corpse of the defeated Dungeon boss, " + player.name + " makes their way to the now unlocked gate at the far end of the chamber, and pushing aside the heavy stone doors they reveal the next stage of The Dungeon... " + dungeon[stage].name + "\n\n" + dungeon[stage].entryMessage + "\n\n";
	}
	if (dungeon[stage].floors[floor][room].roomType == 0) {
		console.log(getTimeStamp() + " entry");
		room++;
	}
	var encounterChance = Math.random();
	var deathLog = JSON.parse(fs.readFileSync('./deathlog.json'));
	var heroEncounterChance = Math.floor(Math.random() * deathLog.length);
	console.log(getTimeStamp() + dungeon[stage].floors[floor][room].roomType);
	if (dungeon[stage].floors[floor][room].roomType == 6 && !attacked) {
		encounterType = dungeon[stage].floors[floor][room].merchantType;
		encounter(encounterType,renderPlayer);
	}
	else if (Math.random() < 0.015 && !attacked && dungeon[stage].floors[floor][room].roomType == 3) {
		var scaledLevelModifier = (wins + 1) / 10;
		var gold = Math.floor(scaledLevelModifier * 15 * (Math.random() + 1));
		fallenHero = {name: "Fallen " + deathLog[heroEncounterChance].name, maxHealth: Math.floor(deathLog[heroEncounterChance].maxHealth * ((wins) / 8)), health: Math.floor(deathLog[heroEncounterChance].maxHealth * ((wins) / 8)), attack: deathLog[heroEncounterChance].attack, defense: deathLog[heroEncounterChance].defense, goldPotential: gold, boss: false, fallen: true, firstName: deathLog[heroEncounterChance].firstName, head: deathLog[heroEncounterChance].head, body: deathLog[heroEncounterChance].body, arms: deathLog[heroEncounterChance].arms, legs: deathLog[heroEncounterChance].legs, relic: deathLog[heroEncounterChance].relic, weapon: deathLog[heroEncounterChance].weapon, offhand: deathLog[heroEncounterChance].offhand,ranReward: deathLog[heroEncounterChance].ranReward,xp:Math.floor(scaledLevelModifier * deathLog[heroEncounterChance].maxHealth)};
		fallenHeroMessage = deathLog[heroEncounterChance].deathInfo;
		encounterType = 10;
		encounter(10,renderPlayer);
	}
	else if (dungeon[stage].floors[floor][room].roomType == 3 && !attacked) {
		console.log(getTimeStamp() + 'Rolling Encounter');
		if (dungeon[stage].floors[floor][room].encounterType) {
			encounterType = dungeon[stage].floors[floor][room].encounterType;
		}
		else {
			encounterType = dungeon[stage].encounters[Math.floor(Math.random() * dungeon[stage].encounters.length)];
		}
		if (encounterType == 6) {
			merchants = [6,34,36,38,40];
			encounterType = merchants[Math.floor(Math.random() * merchants.length)];
		}
		
		encounter(encounterType,renderPlayer);
	}
	else if (dungeon[stage].floors[floor][room].roomType == 4 && !attacked) {
		encounterType = 7;
		encounter(7,renderPlayer);
	}
	else {
		if (turn <= 1) {
			tempPlayerDefense = player.defense;
		}
		if ((dungeon[stage].floors[floor][room].roomType == 5) && turn <= 1) {
			enemy = generateBoss(false);
			enemyAttackType = Math.floor(Math.random() * enemy.attacks.length);
			if (!player.canSeeIntents || player.blindDuration > 0) {
				console.log(player.blindDuration);
				enemyAction = "It is unclear to " + player.name + " what " + enemy.name + " is going to do..."
				if (player.blindDuration > 0) {
					player.blindDuration--;
					console.log(player.blindDuration);
				}
			}
			else {
				enemyAction = enemy.name + enemy.attacks[enemyAttackType].messages[Math.floor(Math.random() * enemy.attacks[enemyAttackType].messages.length)];
			}
			fightStartMessage = getLocation() + " - BOSS FIGHT\n\n" + enemy.entryMessage + "\n\n" + enemyAction + "\n\n";
		}
		else if ((dungeon[stage].floors[floor][room].roomType == 2 || attacked)) {
			console.log(getTimeStamp() + " room type = fight");
			if (turn <= 1 && enemy.health <= 0) {
				enemy = generateEnemy();
			}
		}
		if (turn > 0 || !enemy.boss) {
			enemyAttackType = Math.floor(Math.random() * enemy.attacks.length);
			do {
				enemyAttackType = Math.floor(Math.random() * enemy.attacks.length);
			} while (enemyAttackType == previousEnemyAttack || enemyAttackType == 0);
		}
		console.log(getTimeStamp() + "Reached end of while loop");
		if (enemy.attacks[previousEnemyAttack].reqCharge && enemy.attacks[previousEnemyAttack].charge > 0) {
			if (enemy.attacks[previousEnemyAttack].chargeConsec) {
				enemyAttackType = previousEnemyAttack;
			}
			else if (Math.random() < 0.75) {
					enemyAttackType = previousEnemyAttack;
			}
		}
		previousEnemyAttack = enemyAttackType;
		if (!player.canSeeIntents || player.blindDuration > 0) {
			console.log(player.blindDuration);
			enemyAction = "It is unclear to " + player.name + " what " + enemy.name + " is going to do..."
		}
		else {
			enemyAction = enemy.name + enemy.attacks[enemyAttackType].messages[Math.floor(Math.random() * enemy.attacks[enemyAttackType].messages.length)];
		}
		console.log(getTimeStamp() + "Generated enemyAction successfully");
		if ((turn <= 1) && !enemy.boss) {
			fightStartMessage =  "" + getLocation() + "\n\n" + enemyAction + "\n\n";
		}
		else if ((turn <= 1) && enemy.boss && attacked) {
			fightStartMessage =  "" + getLocation() + "\n\n" + enemyAction + "\n\n";
		}
		else if (turn > 1) {
			if (playerFirst) {
				turnSummary = "TURN SUMMARY\n\n" + playerResult + "\n\n" + enemyResult + "\n\nTurn " + turn + " begins...\n" + enemyAction + "\n\n";
			}
			else {
				turnSummary = "TURN SUMMARY\n\n" + enemyResult + "\n\n" + playerResult + "\n\nTurn " + turn + " begins...\n" + enemyAction + "\n\n";
			}
		}
		statusMessage = player.name + "\nHealth: " + player.health + "/" + player.maxHealth + "\nAttack " + (player.attack + player.attackVar + player.abilityAttackVar) + "\nDefense " + (player.defense + player.defenseVar + player.abilityDefenseVar) + "\n\nversus " +	enemy.name + "\nHealth: " + enemy.health + "/" + enemy.maxHealth + "\nAttack " + enemy.attack + "\nDefense " + tempEnemyDefense + "\nCheck comments for available moves!";
		var output = turnSummary + encounterResult + fightStartMessage + statusMessage;
		var comment =  getPlayerMoves() + "\n\n" + getEnemyInfo() + "\n\n" + getPlayerInfo();
		enemyDodge = false;
		playerDodge = false;
		playerResult = '';
		enemyResult = '';
		fightStartMessage = '';
		turnSummary = '';
		encounterSummary = '';
		statusMessage = '';
		encounterResult = '';
		awaitMove = true;
		awaitChoice = false;
		encounterOccured = false;
		console.log(getTimeStamp() + "Reached end of turnStart");
		post(output, comment);
		save();
		console.log(getTimeStamp() + "Awaiting Player Input");
	}
}

function getReactions () {
	// Get the selected choice from the input, commented out lines use the Facebook react data as an input
	// Line below uses input from console
	playerAction = inputData;
	/*
	console.log(getTimeStamp() + "Reading Reactions...");
	var postid = fs.readFileSync('./previous-post-id2.json');
	FB.api(postid + "/reactions", function (reac) {
		if(!reac || reac.error) {
			console.log(!reac ? 'error occurred' : reac.error);
			return;
		}
		var like = 0;
		var love = 0;
		var haha = 0;
		var wow = 0;
		var sad = 0;
		var angry = 0;
		var count = 0;
		do {
			try {
				switch (reac.data[count].type) {
					case "LIKE":
					like++;
					break;
					
					case "LOVE":
					love++;
					break;
				
					case "HAHA":
					haha++;
					break;
				
					case "WOW":
					wow++;
					break;
					
					case "SAD":
					sad++;
					break;
					
					case "ANGRY":
					angry++;
					break;
				}
				count++;
			} catch (err) {
				retryAny(0);
				return;
			}
		} while (count < reac.data.length);
		//console.log(getTimeStamp() + "Like:" + like);
		//console.log(getTimeStamp() + "Love:" + love);
		//console.log(getTimeStamp() + "Haha:" + haha);
		//console.log(getTimeStamp() + "Wow:" + wow);
		//console.log(getTimeStamp() + "Angry:" + angry);
		var reactions = [like, love, haha, wow, angry, sad];
		reactions.sort(function(a, b){return b-a});
		if (reactions[0] == 0) {
			console.log(getTimeStamp() + "No Valid Move");
			playerAction = 0;
		}
		else if (reactions[0] == like) {
			playerAction = 2;
		}
		else if (reactions[0] == haha) {
			playerAction = 3;
		}
		else if (reactions[0] == angry) {
			playerAction = 1;
		}
		else if (reactions[0] == love) {
			playerAction = 5;
		}
		else if (reactions[0] == wow) {
			playerAction = 4;
		}
		else if (reactions[0] == sad) {
			playerAction = 6;
		}
		*/
		console.log(getTimeStamp() + "Chosen Action = " + playerAction);
		if ((characterChoice == true)) {
			// When selecting a player from the initial choice
			generateRun(playerAction);
		}
		else if (awaitMove == true) {
			// If in combat
			if (player.lock > 0 && player.previousMove == playerAction) {
				// Player is afflicted with the Lock status effect and has chosen their previous move
				retryMove(2);
				return;
			}
			player.previousMove = playerAction;
			var comment = "Move selected = " + player.moves[playerAction].name + "\nProcessing Turn...";
//			postComment(postid, comment);
			combatStart(playerAction);
		}
		else if (awaitChoice == true) {
			// If in an encounter
			var comment = "Choice selected = " + encounterActions[encounterType][playerAction] + "\nProcessing Turn...";
//			postComment(postid, comment);
			resolveEncounter(Number(playerAction));
		}
//	});
}

function retryAny (retryCase) {
	console.log(getTimeStamp() + "Retry...");
	if (awaitMove == true) {
		retryMove(0);
	}
	else if (awaitChoice == true) {
		resolveEncounter(0);
	}
}

function retryMove (retryCase) {
	console.log(getTimeStamp() + "Retrying Move...");
	switch (retryCase) {
		case 0:
		var output = "The previous post failed to get any reactions, so no move was selected, please select a move\n\n" + getLocation() + "\n\n" + player.name + "\nHealth: " + player.health + "/" + player.maxHealth + "\nAttack " + player.attack + "\nDefense " + player.defense + "\n\nversus " + enemy.name + "\nHealth: " + enemy.health + "/" + enemy.maxHealth + "\nAttack " + enemy.attack + "\nDefense " + tempEnemyDefense + "\n\nTurn " + turn + " Begins, " + enemyAction + "\nCheck comments for available moves!";
		var comment =  getPlayerMoves() + "\n\n" + getPlayerInfo();
		post(output, comment);
		awaitChoice = false;
		awaitMove = true;
		break;
		
		case 1:
		var output = "An invalid reaction was used, so no move was selected, please select a different move\n\n" + getLocation() + "\n\n" + player.name + "\nHealth: " + player.health + "/" + player.maxHealth + "\nAttack " + player.attack + "\nDefense " + player.defense + "\n\nversus " + enemy.name + "\nHealth: " + enemy.health + "/" + enemy.maxHealth + "\nAttack " + enemy.attack + "\nDefense " + tempEnemyDefense + "\n\nTurn " + turn + " Begins, " + enemyAction + "\nCheck comments for available moves!";
		var comment =  getPlayerMoves() + "\n\n" + getPlayerInfo();
		post(output, comment);
		awaitChoice = false;
		awaitMove = true;
		break;
		
		case 2:
		var output = "The move selected was identical to the previous move used, please select a different move\n\n" + getLocation() + "\n\n" + enemyAction + "\n\n" + player.name + "\nHealth: " + player.health + "/" + player.maxHealth + "\nAttack " + player.attack + "\nDefense " + player.defense + "\n\nversus " + enemy.name + "\nHealth: " + enemy.health + "/" + enemy.maxHealth + "\nAttack " + enemy.attack + "\nDefense " + tempEnemyDefense + "\n\nTurn " + turn + " Begins...\nCheck comments for available moves!";
		var comment =  getPlayerMoves() + "\n\n" + getPlayerInfo();
		post(output, comment);
		awaitChoice = false;
		awaitMove = true;
		break;
	}
	
}

function retryEncounter (body, comment) {
	console.log(getTimeStamp() + "Retrying Encounter...");
	var starter = "The previous post failed to get any reactions or an invalid reaction so no choice was selected, please select a choice\n\n"
	var output = starter + body
	post(output, comment);
	awaitMove = false;
	awaitChoice = true;
	return;
}

function combatStart(playerAction) {
	console.log(getTimeStamp() + "Start Combat...");
	playerCrit = false;
	enemyCrit = false;
	if (enemy.attacks[enemyAttackType].method == 1 || enemy.attacks[enemyAttackType].method == 3) {
		dodgeChance = Math.random();
		console.log(dodgeChance);
		dodgeModifier = 1;
		if (enemy.small) {
			dodgeModifier = 2;
		}
		if (enemy.big) {
			dodgeModifier = 0.5;
		}
		console.log(enemy.attacks[enemyAttackType].chance);
		if (dodgeChance < (enemy.attacks[enemyAttackType].chance * dodgeModifier)) {
			enemyDodge = true;
		}
		else {
			enemyDodge = false;
		}
	}
	if (player.moves[playerAction].method == 1 || player.moves[playerAction].method == 3 || player.moves[playerAction].method == 4) {
		dodgeChance = Math.random();
		console.log(dodgeChance);
		console.log(player.moves[playerAction].chance);
		if (player.playerClass == 1 && player.weapon.id == 0) {
			if (dodgeChance <= 0.25) {
				playerCrit = true;
				playerDodge = true;
			}
			else if (dodgeChance <= (player.moves[playerAction].chance + 0.25)) {
				playerDodge = true;
			}
			else {
				playerDodge = false;
			}
		}
		else {
			if (dodgeChance < player.moves[playerAction].chance) {
				playerDodge = true;
			}
			else {
				playerDodge = false;
			}
		}
	}
	
	if (player.frost > 0 || player.speed < enemy.speed || enemy.mounted) {
		enemyTurn(playerAction,false);
	}
	else {
		playerTurn(playerAction);
	}
}

function playerTurn(playerAction) {
	console.log(getTimeStamp() + "Processing Player Turn...");
	var playerCurrentAttack = Math.floor(player.attackCore + player.abilityAttackVar + player.attackVar + player.weapon.attackBonus * (Math.random() * tierVariation[player.weapon.tier][0] + tierVariation[player.weapon.tier][1]) + player.offhand.attackBonus * (Math.random() * tierVariation[player.offhand.tier][0] + tierVariation[player.offhand.tier][1]));
	var playerCurrentDefense = Math.floor(player.defenseCore + player.abilityDefenseVar + player.defenseVar + player.head.defenseBonus * (Math.random() * tierVariation[player.head.tier][0] + tierVariation[player.head.tier][1]) + player.body.defenseBonus * (Math.random() * tierVariation[player.body.tier][0] + tierVariation[player.body.tier][1]) + player.arms.defenseBonus * (Math.random() * tierVariation[player.arms.tier][0] + tierVariation[player.arms.tier][1]) + player.legs.defenseBonus * (Math.random() * tierVariation[player.legs.tier][0] + tierVariation[player.legs.tier][1]) + player.offhand.defenseBonus * (Math.random() * tierVariation[player.offhand.tier][0] + tierVariation[player.offhand.tier][1]));
	
	if (enemy.armoured) {
		switch (player.weapon.id) {
			case 2:
			case 3:
			playerCurrentAttack = Math.floor(playerCurrentAttack * 0.5);
			break;
		}
	}
	
	if (enemy.mounted) {
		if (player.weapon.id == 1) {
			playerCurrentAttack = Math.floor(playerCurrentAttack * 1.5);
		}
	}
	
	if (enemy.flying) {
		switch (player.weapon.id) {
			case 0:
			playerCurrentAttack = Math.floor(playerCurrentAttack * 0.75);
			break;
			
			case 2:
			playerCurrentAttack = Math.floor(playerCurrentAttack * 1.5);
			break;
			
			case 3:
			playerCurrentAttack = Math.floor(playerCurrentAttack * 0.5);
			break;
		}
	}
	
	if (enemy.ethereal) {
		playerCurrentAttack = Math.floor(playerCurrentAttack * 0.25);
	}
	
	if (enemy.burrowing) {
		if (!enemy.attacks[enemyAttackType].attackMultiplier || !enemy.attacks[previousEnemyAttack].attackMultiplier) {
			if (player.weapon.id != 1) {
				tempEnemyDefense = player.attack * 100;
			}
		}
	}
	
	if (enemy.player && checkAbility(player,14)) {
		playerCurrentAttack = Math.floor(playerCurrentAttack * 1.5);
	}
	
	if (checkAbility(player,16) && turn < 6) {
		playerCurrentAttack += Math.floor(playerCurrentDefense * 0.25);
	}
	
	if (playerAction == 0 || playerAction == 6) {
		retryMove(1);
		return;
	}
	else {
		if (turn == 1) {
			tempEnemyDefense = enemy.defense;
		}
		if (player.moves[playerAction].ignoreDefense) {
			tempEnemyDefense = 0;
		}
		if (player.madnessDuration > 0 && !player.moves[playerAction].fromConsumable) {
			madnessOption = Math.floor(Math.random() * player.moves.length + 1);
			if (Math.random() < 0.75) {
				playerAction = madnessOption;
			}
		}
		if (player.shock > 0 && !player.moves[playerAction].fromConsumable) {
			if (Math.random() < (0.25 * player.shock)) {
				playerAction = 0;
			}
		}
		
		if (player.moves[playerAction].reqCharge && player.moves[playerAction].charge < player.moves[playerAction].reqCharge) {
			tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].chargeDefenseMultiplier);
			player.moves[playerAction].charge ++;
			playerResult += player.name + player.moves[playerAction].chargeMessage;
		}
		else {
			if (player.moves[playerAction].reqCharge) {
				player.moves[playerAction].charge = 0;
			}
		switch (player.moves[playerAction].method) {
			case 0:
			if (Math.random() < 0.1) {
				if (checkAbility(player,17)) {
					playerCurrentAttack *= 3;
				}
				else {
					playerCurrentAttack *= 2;
				}
				playerCrit = true;
			}
			tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
			if (enemyDodge) {
				playerResult += player.name + "'s " + player.moves[playerAction].name + " was dodged by " + enemy.name + "!";
			}
			else if ((checkAbility(player,0)) && (enemy.health < (enemy.maxHealth * 0.2)) && playerAction == 1) {
				if (tempEnemyDefense < Math.floor(playerCurrentAttack * 1.5 * player.moves[playerAction].attackMultiplier)) {
					var damage = Math.floor(playerCurrentAttack * 1.5 * player.moves[playerAction].attackMultiplier) - tempEnemyDefense;
					enemy.health -= damage;
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					if (playerCrit) {
						playerResult += player.name + " critically uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					else {
						playerResult += player.name + " uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
				}
				else {
					playerResult += player.name + "'s " + player.moves[playerAction].name + " failed to overcome " + enemy.name + "'s defense!";
				}
			}
			else if ((checkAbility(player,5)) && player.weapon.id == 3 && player.offhand.id == 3) {
				console.log("working");
				if (tempEnemyDefense < Math.floor(playerCurrentAttack  * player.moves[playerAction].attackMultiplier) + 5) {
					var damage = Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier) - tempEnemyDefense + 5;
					enemy.health -= damage;
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					if (playerCrit) {
						playerResult += player.name + " critically uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					else {
						playerResult += player.name + " uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
				}
				else {
					playerResult += player.name + "'s " + player.moves[playerAction].name + " failed to overcome " + enemy.name + "'s defense!";
				}
			}
			else {
				if (tempEnemyDefense < Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier)) {
					var damage = Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier) - tempEnemyDefense
					enemy.health = enemy.health - damage
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					if (playerCrit) {
						playerResult += player.name + " critically uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					else {
						playerResult += player.name + " uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
				}
				else {
					playerResult += player.name + "'s " + player.moves[playerAction].name + " failed to overcome " + enemy.name + "'s defense!";
				}
			}
			break;
			
			case 1:
			var dodgeChance = Math.random();
			if (player.moves[playerAction].attackMultiplier) {
				if (playerDodge && playerCrit) {
					playerDodge = true;
					tempPlayerDefense = playerCurrentDefense;
					if (checkAbility(player,17)) {
						var damage = Math.floor(playerCurrentAttack * 3 * player.moves[playerAction].attackMultiplier);
					}
					else {
						var damage = Math.floor(playerCurrentAttack * 2 * player.moves[playerAction].attackMultiplier);
					}
					enemy.health -= damage
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					playerResult += player.name + " critically " + player.moves[playerAction].actionName + " " + enemy.name + " for " + damage + " damage!";
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
				}
				else if (playerDodge && !playerCrit) {
					tempPlayerDefense = playerCurrentDefense;
					var damage = Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier);
					enemy.health -= damage
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					playerResult += player.name + " successfully " + player.moves[playerAction].actionName + " " + enemy.name + " for " + damage + " damage!";
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
				}
				else {
					tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
					playerResult += player.name + " failed to " + player.moves[playerAction].name + " " + enemy.name + "!";
				}
			}
			else {
				if (playerDodge) {
					tempPlayerDefense = playerCurrentDefense;
					playerResult += player.name + " successfully " + player.moves[playerAction].actionName + " " + enemy.name;
				}
				else {
					tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
					playerResult += player.name + " failed to " + player.moves[playerAction].name + " " + enemy.name + "!";
				}
			}
			break;
				
			case 2:
			var successChance = Math.random();
			var hitChance = player.moves[playerAction].chance;
			if (checkAbility(player,3) && playerAction == 2) {
				hitChance = 0.95;
			}
			if (enemyDodge) {
				playerResult += player.name + "'s " + player.moves[playerAction].name + " was dodged by " + enemy.name + "!";
			}
			else if (successChance <= hitChance) {
				if (Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier) > tempEnemyDefense) {
					tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
					if (playerCrit && checkAbility(player,17)) {
						var damage = Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier * 3) - tempEnemyDefense;
					}
					else {
						var damage = Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier * 2) - tempEnemyDefense;
					}
					enemy.health -= damage
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					if (playerCrit) {
						playerResult += player.name + " critically uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					else {
						playerResult += player.name + " successfully uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
					
				}
				else {
					tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
					playerResult += player.name + "'s " + player.moves[playerAction].name + " failed to overcome " + enemy.name + "'s defense!";
				}
			}
			else {
				tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
				playerResult += player.name + " uses " + player.moves[playerAction].name + " against " + enemy.name + " but missed!";
			}
			break;
			
			case 3:
			if (Math.random() < 0.1) {
				if (checkAbility(player,17)) {
					playerCurrentAttack *= 3;
				}
				else {
					playerCurrentAttack *= 2;
				}
				playerCrit = true;
			}
			if (enemyDodge) {
				playerResult += player.name + "'s " + player.moves[playerAction].name + " was dodged by " + enemy.name + "!";
				break;
			}
			var dodgeChance = Math.random();
			if (dodgeChance < player.moves[playerAction].chance) {
				tempPlayerDefense = playerCurrentDefense;
				playerDodge = true;
			}
			else {
				tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
			}
			if ((checkAbility(player,0)) && (enemy.health < (enemy.maxHealth * 0.2)) && playerAction == 1) {
				if (tempEnemyDefense < Math.floor(playerCurrentAttack * 1.5 * player.moves[playerAction].attackMultiplier)) {
					var damage = Math.floor(playerCurrentAttack * 1.5 * player.moves[playerAction].attackMultiplier) - tempEnemyDefense;
					enemy.health -= damage;
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					if (playerCrit) {
						playerResult += player.name + " critically uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					else {
						playerResult += player.name + " uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
				}
				else {
					playerResult += player.name + "'s " + player.moves[playerAction].name + " failed to overcome " + enemy.name + "'s defense!";
				}
			}
			else if ((checkAbility(player,5)) && player.weapon.id == 3 && player.offhand.id == 3) {
				console.log("working");
				if (tempEnemyDefense < Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier) + 5) {
					var damage = Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier) - tempEnemyDefense + 5;
					enemy.health -= damage;
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					if (playerCrit) {
						playerResult += player.name + " critically uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					else {
						playerResult += player.name + " uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
				}
				else {
					playerResult += player.name + "'s " + player.moves[playerAction].name + " failed to overcome " + enemy.name + "'s defense!";
				}
			}
			else {
				if (tempEnemyDefense < Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier)) {
					var damage = Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier) - tempEnemyDefense
					enemy.health = enemy.health - damage
					console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
					if (playerCrit) {
						playerResult += player.name + " critically uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					else {
						playerResult += player.name + " uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!";
					}
					if (player.moves[playerAction].poison) {
						enemy.poison += player.moves[playerAction].poison;
						playerResult += "\nApplied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].decayStrength) {
						enemy.decayDuration = player.moves[playerAction].decayDuration;
						enemy.decayStrength = player.moves[playerAction].decayStrength;
						playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
					}
					if (player.moves[playerAction].blaze) {
						enemy.blaze += player.moves[playerAction].blaze;
						playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
					}
					if (player.moves[playerAction].shock) {
						enemy.shock += player.moves[playerAction].shock;
						playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
					}
					}
				else {
					playerResult += player.name + "'s " + player.moves[playerAction].name + " failed to overcome " + enemy.name + "'s defense!";
				}
			}
			break;
			
			case 28:
			tempPlayerDefense = Math.floor(playerCurrentDefense * 0.5);
			if (player.supplies > 0) {
				player.supplies--;
				var originalHealth = player.health;
				if ((player.health + 10) > player.maxHealth) {
					player.health = player.maxHealth
				}
				else {
					player.health += 10;
				}
				playerHealthDelta = player.health - originalHealth
				playerResult += player.name + " recovers " + playerHealthDelta + " health! Consumed 1 Healing Supplies";
			}
			else {
				playerResult += player.name + " tries to heal themselves, but appears to have run out of healing supplies!";
			}
			break;
			
			case 4:
			tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
			console.log(getTimeStamp() + "Block => Player def = " + tempPlayerDefense);
			playerResult += player.name + " uses " + player.moves[playerAction].name + "!";
			break;
			
			case 5:
			if (enemyDodge) {
				playerResult += player.name + "'s " + player.moves[playerAction].name + " was dodged by " + enemy.name + "!";
			}
			else {
			tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
			console.log(getTimeStamp() + "Multiple ranged attacks");
			playerResult += "";
			i = 0;
			while (i < player.moves[playerAction].count) {
				if (Math.random() < 0.1) {
					if (checkAbility(player,17)) {
						crit = 3;
					}
					else {
						crit = 2;
					}
					playerCrit = true;
				}
				else {
					crit = 1;
					playerCrit = false;
				}
				var successChance = Math.random();
				var hitChance = player.moves[playerAction].chance;
				if (successChance <= hitChance) {
					if (Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier * crit) > tempEnemyDefense) {
						var damage = Math.floor(playerCurrentAttack * player.moves[playerAction].attackMultiplier * crit - tempEnemyDefense);
						enemy.health -= damage
						console.log(getTimeStamp() + "Player " + damage + " atk => Enemy (" + enemy.health + " hp)");
						if (playerCrit) {
							playerResult += player.name + " successfully critically uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!\n";
						}
						else {
							playerResult += player.name + " successfully uses " + player.moves[playerAction].name + " against " + enemy.name + " for " + damage + " damage!\n";
						}
						if (player.moves[playerAction].poison) {
							enemy.poison += player.moves[playerAction].poison;
							playerResult += "Applied " + player.moves[playerAction].poison + " Poison to " + enemy.name + "!\n";
						}
						if (player.moves[playerAction].decayStrength) {
							enemy.decayDuration = player.moves[playerAction].decayDuration;
							enemy.decayStrength = player.moves[playerAction].decayStrength;
							playerResult += "\nApplied " + player.moves[playerAction].decayStrength + " Decay to " + enemy.name + " for " + player.moves[playerAction].decayDuration + " turns!\n";
						}
						if (player.moves[playerAction].blaze) {
							enemy.blaze += player.moves[playerAction].blaze;
							playerResult += "\nApplied " + player.moves[playerAction].blaze + " Blaze to " + enemy.name + "!\n";
						}
						if (player.moves[playerAction].shock) {
							enemy.shock += player.moves[playerAction].shock;
							playerResult += "\nApplied " + player.moves[playerAction].shock + " Shock to " + enemy.name + "!\n";
						}
					}
					else {
						playerResult += player.name + "'s " + player.moves[playerAction].name + " failed to overcome " + enemy.name + "'s defense!\n";
					}
				}
				else {
					playerResult += player.name + " uses " + player.moves[playerAction].name + " against " + enemy.name + " but missed!\n";
				}
				i++;
				}
			}
			break;
			
			case 6:
			tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
			swapWeapon = player.weapon;
			swapOffhand = player.offhand;
			player.weapon = player.secondaryWeapon;
			player.offhand = player.secondaryOffhand;
			player.secondaryWeapon = swapWeapon;
			player.secondaryOffhand = swapOffhand;
			
			player.moves[1] = moves[player.weapon.id][1][player.movelevels[player.weapon.id][1]];
			player.moves[2] = moves[player.weapon.id][2][player.movelevels[player.weapon.id][2]];
			player.moves[3] = moves[player.weapon.id][3][player.movelevels[player.weapon.id][3]];
			player.moves[4] = moves[player.weapon.id][4][player.movelevels[player.weapon.id][4]];
			player.moves[5] = moves[player.weapon.id][5];
			
			var playerClassMove = moves[5][player.playerClass][player.movelevels[5][player.playerClass]];
			if (player.weapon.id == playerClassMove.reqWeaponID) {
				if (player.weapon.twohanded && playerClassMove.reqTwoHanded) {
					player.moves[playerClassMove.slot] = playerClassMove;
				}
				else if (!player.weapon.twohanded && playerClassMove.reqOneHanded) {
					player.moves[playerClassMove.slot] = playerClassMove;
				}
				else if (!playerClassMove.reqTwoHanded && !playerClassMove.reqOneHanded) {
					player.moves[playerClassMove.slot] = playerClassMove;
				}
			}
			if (player.offhand.type == 1 && player.offhand.id == 4 && playerClassMove.reqShield) {
				player.moves[playerClassMove.slot] = playerClassMove;
			} 
			
			i = 0;
			while (i < player.learntMoves.length) {
				move = player.learntMoves[i];
				if (move.reqWeaponID) {
					if (move.reqWeaponID == player.weapon.id) {
						if (player.weapon.twohanded && move.reqTwoHanded) {
							player.moves[move.slot] = move;
						}
						else if (!player.weapon.twohanded && move.reqOneHanded) {
							player.moves[move.slot] = move;
						}
						else if (!move.reqTwoHanded && !move.reqOneHanded) {
							player.moves[move.slot] = move;
						}
					}
				}
				else if (player.offhand.type == 1 && player.offhand.id == 4 && move.reqShield) {
					player.moves[move.slot] = move;
				}
				else if (!move.reqWeaponID && move.reqShield) {
					player.moves[move.slot] = move;
				}
				i++;
			}
			
			if (player.weapon.moveAbility) {
				player.moves[player.weapon.moveAbility.slot] = player.weapon.moveAbility;
			}
			
			player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
			player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
			player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
			
			playerResult += player.name + " " + player.moves[playerAction].actionName + "!";
			break;
			
			case 7:
			tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
			if (player.shock > 0) {
				playerResult += player.name + "'s Shock paralyzes them!";
			}
			else {
				playerResult += player.name + " does nothing!";
			}
			break;
			
			case 8:
			if (player.consumables.length > 0) {
				tempPlayerDefense = Math.floor(playerCurrentDefense * player.moves[playerAction].defenseMultiplier);
				if (player.consumables.length == 1) {
					useConsumable(0);
					return;
				}
				else {
					encounterType = 27;
					encounter(27);
					return;
				}
			}
			else {
				retryMove(1);
				return;
			}
			break;
		}	
		}
		
		tempEnemyDefense = enemy.defense;
		
		if (player.moves[playerAction].healthCost) {
			player.health -= player.moves[playerAction].healthCost;
			playerResult += "\n" + player.name + " takes " + player.moves[playerAction].healthCost + " damage from " + player.moves[playerAction].name + "!"
		}
		
		if (player.moves[playerAction].attackBoost) {
			player.abilityAttackVar += player.moves[playerAction].attackBoost;
			playerResult += "\nBoosted " + player.name + "'s Attack by " + player.moves[playerAction].attackBoost + "!"
		}
		
		if (player.moves[playerAction].defenseBoost) {
			player.abilityDefenseVar += player.moves[playerAction].defenseBoost;
			playerResult += "\nBoosted " + player.name + "'s Defense by " + player.moves[playerAction].defenseBoost + "!"
		}
		
		if (!damage && player.moves[playerAction].attackMultiplier) {
			if (!player.offhand.empty && player.offhand.type == 0 && Math.random() < 0.5) {
				if (player.offhand.tier != 0) {
					if (player.offhand.durability[0] == 0) {
						if (player.offhand.durability[1]) {
							//degrade tier
							player.offhand.tier--;
							player.offhand.identifier = "[" + tierList[player.offhand.tier] + " Tier" + player.offhand.identifier.split("Tier")[1];
							player.offhand.durability = tierDurability[player.offhand.tier];
							playerResult += "\n" + player.name + "'s " + player.offhand.name + " takes severe damage with the failed attack (-1 Offhand Tier)"
							player.offhand.cost = Math.floor(player.offhand.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
				
						}
						else {
							player.offhand.durability[1]--
							if (player.offhand.durability[1] == 0) {
								playerResult += "\n" + player.name + "'s " + player.offhand.name + " is in a critical state (Next failed hit will degrade item tier)"
							}
							else {
								playerResult += "\n" + player.name + "'s " + player.offhand.name + " takes some damage (" + player.offhand.durability[1] + " Durability left)"
							}
						}
					}
					else {
						player.offhand.durability[0]--
						if (player.offhand.durability[0] == 0) {
							playerResult += "\n" + player.name + "'s " + player.offhand.name + " begins to look like it might take some damage soon (Item will begin to take sustained durability damage)"
						}
					}
				}
			}
			else {
				if (player.weapon.tier != 0) {
					if (player.weapon.durability[0] == 0) {
						if (player.weapon.durability[1] == 0) {
							//degrade tier
							player.weapon.tier--;
							player.weapon.identifier = "[" + tierList[player.weapon.tier] + " Tier" + player.weapon.identifier.split("Tier")[1];
							player.weapon.durability = tierDurability[player.weapon.tier];
							playerResult += "\n" + player.name + "'s " + player.weapon.name + " takes severe damage with the failed attack (-1 Weapon Tier)"
							player.weapon.cost = Math.floor(player.weapon.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.weapon.wins ** 2 / 100) + 1) * (2 / player.weapon.modifications) * ((player.weapon.tier ** 2) / 16));
						}
						else {
							player.weapon.durability[1]--
							if (player.weapon.durability[1] == 0) {
								playerResult += "\n" + player.name + "'s " + player.weapon.name + " is in a critical state (Next failed hit will degrade item tier)"
							}
							else {
								playerResult += "\n" + player.name + "'s " + player.weapon.name + " takes some damage (" + player.weapon.durability[1] + " Durability left)"
							}
						}
					}
					else {
						player.weapon.durability[0]--
						if (player.weapon.durability[0] == 0) {
							playerResult += "\n" + player.name + "'s " + player.weapon.name + " begins to look like it might take some damage soon (Item will begin to take sustained durability damage)"
						}
					}
				}
			}
		}
		
		if (turn >= 5) {
			if (playerCurrentDefense > 0) {
				if (turn == 5) {
					playerResult += "\n" + player.name + " begins to feel exhausted (-1 Defense per turn)"
				}
				else {
					player.defenseVar--;
					playerResult += "\n" + player.name + " feels exhausted! (-1 Defense)"
				}
			}
		}
		
		i = 0;
		while (i < player.moves) {
			if (i != playerAction) {
				if (player.moves[i].reqCharge && player.moves[i].charge > 0 && player.moves[i].chargeConsec) {
					player.moves[i].charge = 0;
				}
			}
			i++;
		}
		
		if (player.health <= 0) {
			console.log(playerResult);
			if (player.frost > 0) {
				loss(playerResult,enemyResult,0,false);
			}
			else {
				loss(playerResult,enemyResult,0,true);
			}
		}
		else if (enemy.health <= 0) {
			if (player.frost > 0) {
				victory(false);
			}
			else {
				victory(true);
			}
		}
		else {
			
			if (player.poison > 0) {
				player.health -= player.poison;
				playerResult += ("\n" + player.name + " takes " + player.poison + " damage from Poison!");
				player.poison--;
				if (player.poison == 0) {
					playerResult += ("\n" + player.name + "'s Poison wears off!");
				}
			}
			if (player.madnessDuration > 0) {
				player.madnessDuration--;
				if (player.madnessDuration == 0) {
					playerResult += ("\n" + player.name + "'s Madness wears off!");
				}
			}
		
			if (player.blindDuration > 0) {
				player.blindDuration--;
				if (player.blindDuration == 0) {
					playerResult += ("\n" + player.name + "'s Blindness wears off!");
				}
			}
		
			if (player.decayDuration > 0) {
				player.health -= player.decayStrength;
				playerResult += ("\n" + player.name + " takes " + player.decayStrength + " damage from Decay!");
				player.decayDuration--;
				if (player.decayDuration == 0) {
					playerResult += ("\n" + player.name + "'s Decay wears off!");
					player.decayStrength = 0;
				}
			}
		
			if (player.blaze > 0) {
				player.health -= player.blaze;
				playerResult += ("\n" + player.name + " takes " + player.blaze + " damage from Blaze!");
				if (Math.random() < 0.5) {
					playerResult += ("\n" + player.name + "'s Blaze extinguishes!");
					player.blaze = 0;
				}
				else {
					playerResult += ("\n" + player.name + "'s Blaze intensifies!");
					player.blaze *= 2;
				}
			}
			if (player.shock > 0) {
				player.shock--;
				if (player.shock == 0) {
					playerResult += ("\n" + player.name + "'s Shock wears off!");
				}
			}
			
			if (player.lock > 0) {
				player.lock--;
				if (player.lock == 0) {
					playerResult += ("\n" + player.name + "'s Lock wears off!");
				}
			}
			
			if (player.health <= 0) {
				console.log(playerResult);
				if (player.frost > 0) {
					loss(playerResult,enemyResult,0,false);
					return;
				}
				else {
					loss(playerResult,enemyResult,0,true);
					return;
				}
			}
			
			if (player.frost > 0) {
				player.frost--;
				if (player.frost == 0) {
					playerResult += ("\n" + player.name + "'s Frost wears off!");
				}
				turn += 1;
				turnStart(false);
			}
			else {
				enemyTurn(playerAction,true);
			}
		}
	}
}

function enemyTurn(playerAction,playerFirst) {
	console.log(getTimeStamp() + "Processing Enemy Turn...");
	var enemyCurrentAttack = enemy.attack;
	if (enemy.big && enemy.attacks[enemyAttackType].damageType == "melee") {
		enemyCurrentAttack = Math.floor(enemyCurrentAttack * 1.25);
	}
	if (enemy.small && enemy.attacks[enemyAttackType].damageType == "melee") {
		enemyCurrentAttack = Math.floor(enemyCurrentAttack * 0.75);
	}
	var enemyCurrentDefense = enemy.defense;
	if (enemy.shock > 0) {
		if (Math.random() < (0.25 * enemy.shock)) {
			enemyAttackType = 0;
		}
	}
	if (enemy.attacks[enemyAttackType].ignoreDefense) {
		tempPlayerDefense = 0;
	}
	
	
	
	if (enemy.attacks[enemyAttackType].reqCharge && enemy.attacks[enemyAttackType].charge < enemy.attacks[enemyAttackType].reqCharge) {
		tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].chargeDefenseMultiplier);
		enemy.attacks[enemyAttackType].charge ++;
		enemyResult = enemy.name + enemy.attacks[enemyAttackType].chargeMessage;
	}
	else {
	enemy.attacks[enemyAttackType].known = true;
	switch (enemy.attacks[enemyAttackType].method) {
		case 0:
		if (Math.random() < 0.1) {
			enemyCurrentAttack *= 2;
			enemyCrit = true;
		}
		tempEnemyDefense = Math.floor(player.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
		if (playerDodge) {
			enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " but the move was evaded!";
		}
		else if (tempPlayerDefense < Math.floor(enemyCurrentAttack * enemy.attacks[enemyAttackType].attackMultiplier)) {
			var damage = Math.floor(enemyCurrentAttack * enemy.attacks[enemyAttackType].attackMultiplier) - tempPlayerDefense
			player.health = player.health - damage
			console.log(getTimeStamp() + "Enemy " + damage + " atk => Player (" + player.health + " hp)");
			if (checkAbility(player,2) && enemy.attacks[enemyAttackType].damageType == "melee") {
				if ((tempPlayerDefense * 0.25) - tempEnemyDefense > 0) {
					enemy.health = enemy.health - Math.floor(tempPlayerDefense * 0.25) + tempEnemyDefense
					if (enemyCrit) {
						enemyResult = enemy.name + " critically uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!\n" + Math.floor(tempPlayerDefense * 0.25 - tempEnemyDefense) + " damage was reflected back at " + enemy.name + "!";
					}
					else {
						enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!\n" + Math.floor(tempPlayerDefense * 0.25 - tempEnemyDefense) + " damage was reflected back at " + enemy.name + "!";
					}
				}
				else {
					if (enemyCrit) {
						enemyResult = enemy.name + " critically uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!\nNo damage was reflected back at " + enemy.name + "!";
					}
					else {
						enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!\nNo damage was reflected back at " + enemy.name + "!";
					}
				}
			}
			else {
				if (enemyCrit) {
					enemyResult = enemy.name + " critically uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!";
				}
				else {
					enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!";
				}
			}
			if (enemy.attacks[enemyAttackType].poison) {
				player.poison += enemy.attacks[enemyAttackType].poison;
				enemyResult += "\nApplied " + enemy.attacks[enemyAttackType].poison + " Poison to " + player.name + "!\n";
			}
			if (enemy.attacks[enemyAttackType].recoil) {
				if (!enemy.attacks[enemyAttackType].recoilReqDamage || (enemy.attacks[enemyAttackType].recoilReqDamage && damage > 0)) {
					enemy.health -= Math.floor(enemy.attacks[enemyAttackType].recoil * enemyCurrentAttack);
					enemyResult += "\n" + enemy.name + " takes " + Math.floor(enemy.attacks[enemyAttackType].recoil * enemyCurrentAttack) + " recoil damage!\n";
				}
			}
		}
		else {
			if (checkAbility(player,2) && enemy.attacks[enemyAttackType].damageType == "melee") {
				if ((tempPlayerDefense * 0.25) - tempEnemyDefense > 0) {
					enemy.health = enemy.health - Math.floor(tempPlayerDefense * 0.25) + tempEnemyDefense
					enemyResult = enemy.name + "'s " + enemy.attacks[enemyAttackType].name + " failed to overcome " + player.name + "'s defense!\n" + Math.floor(tempPlayerDefense * 0.25 - tempEnemyDefense) + " damage was reflected back at " + enemy.name + "!";
				}
				else {
					enemyResult = enemy.name + "'s " + enemy.attacks[enemyAttackType].name + " failed to overcome " + player.name + "'s defense!\nNo damage was reflected back at " + enemy.name + "!";
				}
			}
			else {
				enemyResult = enemy.name + "'s " + enemy.attacks[enemyAttackType].name + " failed to overcome " + player.name + "'s defense!";
			}
		}
		break;
		
		case 1:
		if (enemyDodge) {
			tempEnemyDefense = enemy.defense;
			enemyResult = enemy.name + " successfully " + enemy.attacks[enemyAttackType].actionName + " " + player.name;
		}
		else {
			tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
			enemyResult = enemy.name + " failed to " + enemy.attacks[enemyAttackType].name + " " + player.name + "!";
		}
		break;
			
		case 2:
		if (Math.random() < 0.1) {
			enemyCurrentAttack *= 2;
			enemyCrit = true;
		}
		var successChance = Math.random();
		var hitChance = enemy.attacks[enemyAttackType].chance;
		if (playerDodge) {
			enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " but the move was evaded!";
		}
		else if (successChance <= hitChance) {
			if (Math.floor(enemyCurrentAttack * enemy.attacks[enemyAttackType].attackMultiplier) > tempPlayerDefense) {
				tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
				var damage = Math.floor(enemyCurrentAttack * enemy.attacks[enemyAttackType].attackMultiplier - tempPlayerDefense);
				player.health -= damage
				console.log(getTimeStamp() + "Enemy " + damage + " atk => Player (" + player.health + " hp)");
				if (enemyCrit) {
					enemyResult = enemy.name + " successfully critically uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!";
				}
				else {
					enemyResult = enemy.name + " successfully uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!";
				}
				if (enemy.attacks[enemyAttackType].poison) {
					player.poison += enemy.attacks[enemyAttackType].poison;
					enemyResult += "\nApplied " + enemy.attacks[enemyAttackType].poison + " Poison to " + player.name + "!\n";
				}
			}
			else {
				tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
				enemyResult = enemy.name + "'s " + enemy.attacks[enemyAttackType].name + " failed to overcome " + player.name + "'s defense!";
			}
		}
		else {
			tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
			enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " but missed!";
		}
		break;
		
		case 3:
		if (Math.random() < 0.1) {
			enemyCurrentAttack *= 2;
			enemyCrit = true;
		}
		if (enemyDodge) {
			tempEnemyDefense = enemy.defense;
		}
		else {
			tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
		}
		if (playerDodge) {
			enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " but the move was evaded!";
		}
		else if (tempPlayerDefense < Math.floor(enemyCurrentAttack * enemy.attacks[enemyAttackType].attackMultiplier)) {
			var damage = Math.floor(enemyCurrentAttack * enemy.attacks[enemyAttackType].attackMultiplier) - tempPlayerDefense
			player.health = player.health - damage
			console.log(getTimeStamp() + "Enemy " + damage + " atk => Player (" + player.health + " hp)");
			if (enemyCrit) {
				enemyResult = enemy.name + " critically uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!";
			}
			else {
				enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!";
			}
			if (enemy.attacks[enemyAttackType].poison) {
				player.poison += enemy.attacks[enemyAttackType].poison;
				enemyResult += "\nApplied " + enemy.attacks[enemyAttackType].poison + " Poison to " + player.name + "!\n";
			}
		}
		else {
			enemyResult = enemy.name + "'s " + enemy.attacks[enemyAttackType].name + " failed to overcome " + player.name + "'s defense!";
		}
		break;
		
		case 4:
		tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
		console.log(getTimeStamp() + "Block => Enemy def = " + tempEnemyDefense);
		enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + "!";
		break;
		
		case 5:
		tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
		console.log(getTimeStamp() + "Multiple ranged attacks");
		enemyResult = "";
		i = 0;
		if (playerDodge) {
			enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " but the move was evaded!";
		}
		else {
			while (i < enemy.attacks[enemyAttackType].count) {
				if (Math.random() < 0.1) {
					crit = 2;
					enemyCrit = true;
				}
				else {
					crit = 1;
					enemyCrit = false;
				}
				var successChance = Math.random();
				var hitChance = enemy.attacks[enemyAttackType].chance;
				if (successChance <= hitChance) {
					if (Math.floor(enemyCurrentAttack * enemy.attacks[enemyAttackType].attackMultiplier * crit) > tempPlayerDefense) {
						var damage = Math.floor(enemyCurrentAttack * enemy.attacks[enemyAttackType].attackMultiplier * crit - tempPlayerDefense);
						player.health -= damage;
						console.log(getTimeStamp() + "Enemy " + damage + " atk => Player (" + player.health + " hp)");
						if (enemyCrit) {
							enemyResult += enemy.name + " successfully critically uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!\n";
						}
						else {
							enemyResult += enemy.name + " successfully uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " for " + damage + " damage!\n";
						}
						if (enemy.attacks[enemyAttackType].poison) {
							player.poison += enemy.attacks[enemyAttackType].poison;
							enemyResult += "Applied " + enemy.attacks[enemyAttackType].poison + " Poison to " + player.name + "!\n";
						}
					}
					else {
						enemyResult += enemy.name + "'s " + enemy.attacks[enemyAttackType].name + " failed to overcome " + player.name + "'s defense!\n";
					}
				}
				else {
					enemyResult += enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " against " + player.name + " but missed!\n";
				}
				i++;
			}
		}
		break;
		
		case 6:
		tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
		var originalHealth = enemy.health;
		if ((enemy.health + enemy.attacks[enemyAttackType].healAmount) > enemy.maxHealth) {
			enemy.health = enemy.maxHealth
		}
		else {
			enemy.health += enemy.attacks[enemyAttackType].healAmount;
		}
		enemyHealthDelta = enemy.health - originalHealth
		enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + " to recover " + enemyHealthDelta + " health!";
		break;
		
		case 7:
		tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
		enemyResult = enemy.name + " does nothing!";
		break;
		
		case 8:
		tempEnemyDefense = Math.floor(enemy.defense * enemy.attacks[enemyAttackType].defenseMultiplier);
		if (enemy.attacks[enemyAttackType].blindPlayer) {
			player.blindDuration += enemy.attacks[enemyAttackType].blindDuration;
		}
		if (enemy.attacks[enemyAttackType].poison) {
			player.poison += enemy.attacks[enemyAttackType].poison;
		}
		if (enemy.attacks[enemyAttackType].frost) {
			player.frost += enemy.attacks[enemyAttackType].frost;
		}
		enemyResult = enemy.name + " uses " + enemy.attacks[enemyAttackType].name + ", " + enemy.attacks[enemyAttackType].actionName + "!";
		break;
		}
		
		if (enemy.attacks[enemyAttackType].lifeSteal && damage > 0) {
			enemy.health += Math.floor(damage * enemy.attacks[enemyAttackType].lifeSteal);
			enemyResult += "\nRegained " + Math.floor(damage * enemy.attacks[enemyAttackType].lifeSteal) + " Health from " + player.name + "!"
		}
		if (damage > 0) {
			for (i = 0; i < enemy.effectModifiers.length; i++) {
				switch (enemy.effectModifiers[i].effectID) {
					case 0:
					player.blindDuration += 3;
					break;
				
					case 1:
					player.poison += 3;
					enemyResult += "\nApplied 3 Poison to " + player.name + "!";
					break;
				
					case 2:
					player.madnessDuration += 3;
					enemyResult += "\nApplied 3 Madness to " + player.name + "!";
					break;
				
					case 3:
					player.decayDuration += 3;
					player.decayStrength += 3
					enemyResult += "\nApplied 3 turns of 3 Decay to " + player.name + "!";
					break;
				
					case 4:
					player.blaze += 3;
					enemyResult += "\nApplied 3 Blaze to " + player.name + "!";
					break;
				
					case 5:
					player.shock += 3;
					enemyResult += "\nApplied 3 Shock to " + player.name + "!";
					break;
				
					case 6:
					player.frost += 3;
					enemyResult += "\nApplied 3 Frost to " + player.name + "!";
					break;
				
					case 7:
					player.lock += 3;
					enemyResult += "\nApplied 3 Lock to " + player.name + "!";
					break;
				}
			}
		}
		if (checkAbility(player,15)) {
			if (damage > 0) {
				player.abilityAttackVar = 0;
				enemyResult += "\nBroke " + player.name + "'s Fluidity!"
			}
			else {
				player.abilityAttackVar++;
				enemyResult += "\n" + player.name + "'s Fluidity increased to " + player.abilityAttackVar + "!"
			}
		}
		if (damage > 0) {
			if (player.relic.durability[0] == 0) {
				if (player.relic.durability[1] == 0) {
					//degrade tier
					player.relic.tier--;
					player.relic.identifier = "[" + tierList[player.relic.tier] + " Tier" + player.relic.identifier.split("Tier")[1];
					player.relic.durability = tierDurability[player.relic.tier];
					enemyResult += "\n" + player.name + "'s " + player.relic.name + " takes severe damage with the enemy's attack (-1 Offhand Tier)"
					player.relic.cost = Math.floor(player.relic.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.relic.wins ** 2 / 100) + 1) * (2 / player.relic.modifications) * ((player.relic.tier ** 2) / 16));
					if (player.relic.tier == 0) {
						player.relic.healthBonus = 0;
						player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
						if (player.health > player.maxHealth) {
							player.health = player.maxHealth;
						}
					}
				}
				else {
					player.relic.durability[1]--
					if (player.relic.durability[1] == 0) {
						enemyResult += "\n" + player.name + "'s " + player.relic.name + " is in a critical state (Next attack against relic will degrade item tier)"
					}
					else {
						enemyResult += "\n" + player.name + "'s " + player.relic.name + " takes some damage (" + player.relic.durability[1] + " Durability left)"
					}
				}
			}
			else {
				player.relic.durability[0]--
				if (player.relic.durability[0] == 0) {
					enemyResult += "\n" + player.name + "'s " + player.relic.name + " begins to look like it might take some damage soon (Item will begin to take sustained durability damage)"
				}
			}
		}
		if (enemy.attacks[enemyAttackType].attackMultiplier && !playerDodge) {
			if (player.offhand.defense && Math.random() < 0.2) {
				if (player.offhand.durability[0] == 0) {
					if (player.offhand.durability[1] == 0) {
						//degrade tier
						player.offhand.tier--;
						player.offhand.identifier = "[" + tierList[player.offhand.tier] + " Tier" + player.offhand.identifier.split("Tier")[1];
						player.offhand.durability = tierDurability[player.offhand.tier];
						playerResult += "\n" + player.name + "'s " + player.offhand.name + " takes severe damage with the enemy's attack (-1 Offhand Tier)"
						player.offhand.cost = Math.floor(player.offhand.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
				
					}
					else {
						player.offhand.durability[1]--
						if (player.offhand.durability[1] == 0) {
							playerResult += "\n" + player.name + "'s " + player.offhand.name + " is in a critical state (Next attack against offhand will degrade item tier)"
						}
						else {
							playerResult += "\n" + player.name + "'s " + player.offhand.name + " takes some damage (" + player.offhand.durability[1] + " Durability left)"
						}
					}
				}
				else {
					player.offhand.durability[0]--
					if (player.offhand.durability[0] == 0) {
						playerResult += "\n" + player.name + "'s " + player.offhand.name + " begins to look like it might take some damage soon (Item will begin to take sustained durability damage)"
					}
				}
			}
			else {
				switch (Math.floor(Math.random() * 4)) {
					case 0:
					if (player.head.durability[0] == 0) {
						if (player.head.durability[1] == 0) {
							//degrade tier
							player.head.tier--;
							player.head.identifier = "[" + tierList[player.head.tier] + " Tier" + player.head.identifier.split("Tier")[1];
							player.head.durability = tierDurability[player.head.tier];
							enemyResult += "\n" + player.name + "'s " + player.head.name + " takes severe damage with the enemy's attack (-1 Offhand Tier)"
							player.head.cost = Math.floor(player.head.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.head.wins ** 2 / 100) + 1) * (2 / player.head.modifications) * ((player.head.tier ** 2) / 16));
				
						}
						else {
							player.head.durability[1]--
							if (player.head.durability[1] == 0) {
								enemyResult += "\n" + player.name + "'s " + player.head.name + " is in a critical state (Next attack against head will degrade item tier)"
							}
							else {
								enemyResult += "\n" + player.name + "'s " + player.head.name + " takes some damage (" + player.head.durability[1] + " Durability left)"
							}
						}
					}
					else {
						player.head.durability[0]--
						if (player.head.durability[0] == 0) {
							enemyResult += "\n" + player.name + "'s " + player.head.name + " begins to look like it might take some damage soon (Item will begin to take sustained durability damage)"
						}
					}
					break;
					
					case 1:
					if (player.body.durability[0] == 0) {
						if (player.body.durability[1] == 0) {
							//degrade tier
							player.body.tier--;
							player.body.identifier = "[" + tierList[player.body.tier] + " Tier" + player.body.identifier.split("Tier")[1];
							player.body.durability = tierDurability[player.body.tier];
							enemyResult += "\n" + player.name + "'s " + player.body.name + " takes severe damage with the enemy's attack (-1 Offhand Tier)"
							player.body.cost = Math.floor(player.body.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.body.wins ** 2 / 100) + 1) * (2 / player.body.modifications) * ((player.body.tier ** 2) / 16));
				
						}
						else {
							player.body.durability[1]--
							if (player.body.durability[1] == 0) {
								enemyResult += "\n" + player.name + "'s " + player.body.name + " is in a critical state (Next attack against body will degrade item tier)"
							}
							else {
								enemyResult += "\n" + player.name + "'s " + player.body.name + " takes some damage (" + player.body.durability[1] + " Durability left)"
							}
						}
					}
					else {
						player.body.durability[0]--
						if (player.body.durability[0] == 0) {
							enemyResult += "\n" + player.name + "'s " + player.body.name + " begins to look like it might take some damage soon (Item will begin to take sustained durability damage)"
						}
					}
					break;
					
					case 2:
					if (player.arms.durability[0] == 0) {
						if (player.arms.durability[1] == 0) {
							//degrade tier
							player.arms.tier--;
							player.arms.identifier = "[" + tierList[player.arms.tier] + " Tier" + player.arms.identifier.split("Tier")[1];
							player.arms.durability = tierDurability[player.arms.tier];
							enemyResult += "\n" + player.name + "'s " + player.arms.name + " takes severe damage with the enemy's attack (-1 Offhand Tier)"
							player.arms.cost = Math.floor(player.arms.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.arms.wins ** 2 / 100) + 1) * (2 / player.arms.modifications) * ((player.arms.tier ** 2) / 16));
				
						}
						else {
							player.arms.durability[1]--
							if (player.arms.durability[1] == 0) {
								enemyResult += "\n" + player.name + "'s " + player.arms.name + " is in a critical state (Next attack against arms will degrade item tier)"
							}
							else {
								enemyResult += "\n" + player.name + "'s " + player.arms.name + " takes some damage (" + player.arms.durability[1] + " Durability left)"
							}
						}
					}
					else {
						player.arms.durability[0]--
						if (player.arms.durability[0] == 0) {
							enemyResult += "\n" + player.name + "'s " + player.arms.name + " begins to look like it might take some damage soon (Item will begin to take sustained durability damage)"
						}
					}
					break;
					
					case 3:
					if (player.legs.durability[0] == 0) {
						if (player.legs.durability[1] == 0) {
							//degrade tier
							player.legs.tier--;
							player.legs.identifier = "[" + tierList[player.legs.tier] + " Tier" + player.legs.identifier.split("Tier")[1];
							player.legs.durability = tierDurability[player.legs.tier];
							enemyResult += "\n" + player.name + "'s " + player.legs.name + " takes severe damage with the enemy's attack (-1 Offhand Tier)"
							player.legs.cost = Math.floor(player.legs.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.legs.wins ** 2 / 100) + 1) * (2 / player.legs.modifications) * ((player.legs.tier ** 2) / 16));
				
						}
						else {
							player.legs.durability[1]--
							if (player.legs.durability[1] == 0) {
								enemyResult += "\n" + player.name + "'s " + player.legs.name + " is in a critical state (Next attack against legs will degrade item tier)"
							}
							else {
								enemyResult += "\n" + player.name + "'s " + player.legs.name + " takes some damage (" + player.legs.durability[1] + " Durability left)"
							}
						}
					}
					else {
						player.legs.durability[0]--
						if (player.legs.durability[0] == 0) {
							enemyResult += "\n" + player.name + "'s " + player.legs.name + " begins to look like it might take some damage soon (Item will begin to take sustained durability damage)"
						}
					}
					break;
				}
			}
		}
	}
	
	i = 0;
	while (i < enemy.attacks) {
		if (i != enemyAttackType) {
			if (enemy.attacks[i].reqCharge && enemy.attacks[i].charge > 0 && enemy.attacks[i].chargeConsec) {
				enemy.attacks[i].charge = 0;
			}
		}
		i++;
	}
	
	if (turn >= 5) {
		if (enemyCurrentDefense > 0) {
			if (turn == 5) {
				enemyResult += "\n" + enemy.name + " begins to feel exhausted (-1 Defense per turn)"
			}
			else {
				enemy.defense--;
				enemyResult += "\n" + enemy.name + " feels exhausted! (-1 Defense)"
			}
		}
	}
	
	if (enemy.phases) {
		if (enemy.phases[enemy.currentPhase]) {
			if (enemy.health < enemy.phases[enemy.currentPhase].threshold * enemy.maxHealth) {
				enemy.attacks = [];
				i = 0;
				while (i < enemy.phases[enemy.currentPhase].attackset.length) {
					enemy.attacks.push(enemyAttacks[enemy.phases[enemy.currentPhase].attackset[i][0]][enemy.phases[enemy.currentPhase].attackset[i][1]][stage]);
					enemy.attacks[i].known = false;
					i++;
				}
				
				i = 0;
				while (i < enemy.phases[enemy.currentPhase].typesGain.length) {
					switch (enemy.phases[enemy.currentPhase].typesGain[i]) {
						case 0:
						enemy.ethereal = true;
						break;
			
						case 1:
						enemy.flying = true;
						break;
			
						case 2:
						enemy.small = true;
						break;
			
						case 3:
						enemy.big = true;
						break;
			
						case 4:
						enemy.mounted = true;
						break;
			
						case 5:
						enemy.fallen = true;
						break;
			
						case 6:
						enemy.armoured = true;
						break;
			
						case 7:
						enemy.burrowing = true;
						break;
					}
					i++;
				}
				
				i = 0;
				while (i < enemy.phases[enemy.currentPhase].typesLoss.length) {
					switch (enemy.phases[enemy.currentPhase].typesLoss[i]) {
						case 0:
						enemy.ethereal = false;
						break;
			
						case 1:
						enemy.flying = false;
						break;
			
						case 2:
						enemy.small = false;
						break;
			
						case 3:
						enemy.big = false;
						break;
			
						case 4:
						enemy.mounted = false;
						break;
			
						case 5:
						enemy.fallen = false;
						break;
			
						case 6:
						enemy.armoured = false;
						break;
			
						case 7:
						enemy.burrowing = false;
						break;
					}
					i++;
				}
				
				if (enemy.phases[enemy.currentPhase].nameChange) {
					enemy.name = enemy.phases[enemy.currentPhase].nameChange;
				}
				
				enemyResult += "\n\n" + enemy.phases[enemy.currentPhase].phaseShiftMessage;
				enemy.currentPhase++;
			}
		}
	}
	
	tempPlayerDefense = player.defense;
	
	if (player.health <= 0) {
		console.log(playerResult);
		if (player.frost > 0) {
			loss(playerResult,enemyResult,0,false);
		}
		else {
			loss(playerResult,enemyResult,0,true);
		}
	}
	else if (enemy.health <= 0) {
		if (player.frost > 0) {
			victory(false);
		}
		else {
			victory(true);
		}
	}
	else {
		
		if (enemy.poison > 0) {
			if (enemy.fallen) {
				enemy.poison = 0;
				enemyResult += ("\n" + enemy.name + " resists Poison!");
			}
			else {
				enemy.health -= enemy.poison;
				enemyResult += ("\n" + enemy.name + " takes " + enemy.poison + " damage from Poison!");
				enemy.poison--;
				if (enemy.poison == 0) {
					enemyResult += ("\n" + enemy.name + "'s Poison wears off!");
				}
			}
		}
		
		if (enemy.decayDuration > 0) {
			if (enemy.fallen) {
				enemy.decayStrength = 0;
				enemy.decayDuration = 0;
				enemyResult += ("\n" + enemy.name + " resists Decay!");
			}
			else {
				enemy.health -= enemy.decayStrength;
				enemyResult += ("\n" + enemy.name + " takes " + enemy.decayStrength + " damage from Decay!");
				enemy.decayDuration--;
				if (enemy.decayDuration == 0) {
					enemyResult += ("\n" + enemy.name + "'s Decay wears off!");
					enemy.decayStrength = 0;
				}
			}
		}
		
		if (enemy.blaze > 0) {
			if (enemy.fallen) {
				enemy.health -= enemy.blaze;
				enemyResult += ("\n" + enemy.name + " takes " + enemy.blaze + " damage from Blaze!");
				if (Math.random() < 0.25) {
					enemyResult += ("\n" + enemy.name + "'s Blaze extinguishes!");
					enemy.blaze = 0;
				}
				else {
					enemyResult += ("\n" + enemy.name + "'s Blaze intensifies!");
					enemy.blaze *= 3;
				}
			}
			else {
				enemy.health -= enemy.blaze;
				enemyResult += ("\n" + enemy.name + " takes " + enemy.blaze + " damage from Blaze!");
				if (Math.random() < 0.5) {
					enemyResult += ("\n" + enemy.name + "'s Blaze extinguishes!");
					enemy.blaze = 0;
				}
				else {
					enemyResult += ("\n" + enemy.name + "'s Blaze intensifies!");
					enemy.blaze *= 2;
				}
			}
		}
		
		if (enemy.shock > 0) {
			if (enemy.fallen) {
				enemy.shock = 0;
				enemyResult += ("\n" + enemy.name + " resists Shock!");
			}
			else {
				enemy.shock--;
				if (enemy.shock == 0) {
					enemyResult += ("\n" + enemy.name + "'s Shock wears off!");
				}
			}
		}
		
		if (enemy.health <= 0) {
			if (player.frost > 0) {
				victory(false);
				return;
			}
			else {
				victory(true);
				return;
			}
		}
		
		if (player.frost > 0 && !playerFirst) {
			playerTurn(playerAction);
		}
		else {
			turn += 1;
			turnStart(playerFirst);
		}
	}
}

function encounter (encounterType,renderPlayer) {
	console.log(getTimeStamp() + "Generating Encounter...");
	switch (encounterType) {
			case 1:
			// Unused
			console.log(getTimeStamp() + "Random Loot Encounter...");
			//random loot
			lootReward = generateLoot({});
			awaitChoice = true;
			encounterType = 8
			encounter(8,renderPlayer);
			break;
			
			case 2:
			console.log(getTimeStamp() + "Free Gold Encounter...");
			//gain gold
			encounterType = 2;
			encounterSummary = "CHEST OF GOLD FOUND ON " + getLocation() + "\n\nIn the centre of the room sits a heavy, unlocked iron chest, perhaps there is some sort of treasure inside, perhaps it is something else entirely...\n\nCheck comments for available moves!";
			awaitChoice = true;
			awaitMove = false;
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Open the Chest - [LIKE]\nLeave the Chest - [ANGRY]\n\n" + getPlayerInfo();
			
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 3:
			console.log(getTimeStamp() + "Demonic Sigil Encounter...");
			//skip levels
			levelSkip = Math.floor((Math.random() * 12) + 4);
			healthLoss = Math.floor((Math.random() * levelSkip * 10));
			encounterSummary = "STRANGE SIGIL ON " + getLocation() + "\n\nA strange sigil is etched into the floor of the room. It glows dim with a sinister red, getting brighter as " + player.name + " draws closer. " + player.name + " wonders what could happen if they step into it...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Step onto the sigil (???) - [LIKE] \nStep around the sigil and proceed to the next " + dungeon[stage].floorName.toLowerCase() + " - [ANGRY]\n\n" + getPlayerInfo();
					
			encounterType = 3;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 4:
			console.log(getTimeStamp() + "Pedestal Loot Encounter...");
			//loot choice		
			encounterSummary = "TREASURE ON " + getLocation() + "\n\nIn the middle of this " + dungeon[stage].roomName.toLowerCase() + " are three ornate stone pedestals, bearing the mark of a symbol that corresponds to the item on top...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Choose the pedestal with a sword symbol - [LIKE] \nChoose the pedestal with a shield symbol - [LOVE] \nChoose the pedestal with an amulet symbol - [HAHA]\n\n" + getPlayerInfo();
			
			encounterType = 4;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
	
			case 5:
			console.log(getTimeStamp() + "The Library Encounter...");
			//buff + debuff
			encounterSummary = "LIBRARY ON " + getLocation() + "\n\nThis " + dungeon[stage].roomName.toLowerCase() + " contains a vast library with many different books that " + player.name + " could read, or they could take the opportunity to find a quite corner and get some rest...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Explore The Library - [LIKE]\nFind a place to rest - [LOVE]\nLeave The Library - [ANGRY]\n\nCurrent Health = " + player.health + "/" + player.maxHealth + "\n\n" + getPlayerInfo();
			
			encounterType = 5;
			encounterOccured = true;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 6:
			console.log(getTimeStamp() + "Shop Encounter...");
			//sell items
			currentMerchant = {shop:[],active:true,sellModifier:0,type:0}
			currentMerchant.shop.push(shopItem(2))
			currentMerchant.shop.push(shopItem(1));
			currentMerchant.shop.push(shopItem(0));
			i = 0;
			lootGoldGain = 0;
			while (i < player.storedItems.length) {
				lootGoldGain += Math.floor(player.storedItems[i].cost / (2 * Math.random() + 1));
				i++;
			}
			runGold += lootGoldGain;
			player.storedItems = [];
			//shop
			
			encounterSummary = "MERCHANT ON " + getLocation() + "\n\nOn this " + dungeon[stage].roomName.toLowerCase()+ " it appears a merchant has set up shop deep within The Dungeon peddling his wares. After purchasing " + player.name + "'s spare items (+" + lootGoldGain + " Gold) he points towards the three different objects in front of him...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nSell Items - [SAD]\nAttempt to Rob The Merchant - [WOW]\nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			
			encounterType = 6;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 7:
			console.log(getTimeStamp() + "Empty " + dungeon[stage].roomName.toLowerCase()+ " Encounter...");
			//empty room
			encounterSummary = "EMPTY " + dungeon[stage].roomName.toUpperCase() + " ON " + getLocation() + "\n\nThis " + dungeon[stage].roomName.toLowerCase()+ " appears to be empty, however the floor around " + player.name + " is littered with bones. Nevertheless the " + dungeon[stage].roomName.toLowerCase()+ " provides the perfect opportunity to rest up or potentially search around for anything of value, provided the former inhabitant comes back...\nCurrent Health: " + player.health + "/" + player.maxHealth + "\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Sleep and recover 50 health (Good chance of being attacked, if attacked will only recover 25 health) - [LIKE] \nRest and recover 25 health (Small chance of being attacked, if attacked will only recover 12 health) - [LOVE] \nSearch for loot (High chance of being attacked) - [HAHA]\nLeave the " + dungeon[stage].roomName.toLowerCase()+ " and continue onward - [ANGRY]\n\n" + getPlayerInfo();
			
			encounterType = 7;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 8:
			// Utility Encounter
			console.log(getTimeStamp() + "Loot Reward...");
			//fight loot reward
			if (!awaitChoice && enemy.ranReward) {
				if (enemy.fallen && !enemy.ranReward) {
					var lootClass = Math.floor(Math.random() * 3);
					switch (lootClass) {
						case 0:
						lootReward = enemy.weapon;
						lootReward.name = enemy.firstName + "'s " + lootReward.name;
						var reward = lootReward;
						break;
						
						case 1:
						var armourType = Math.floor(Math.random() * 4);
						switch (armourType) {
							case 0:
							lootReward = enemy.head;
							lootReward.name = enemy.firstName + "'s " + lootReward.name;
							var reward = lootReward;
							break;
							
							case 1:
							lootReward = enemy.body;
							lootReward.name = enemy.firstName + "'s " + lootReward.name;
							var reward = lootReward;
							break;
							
							case 2:
							lootReward = enemy.arms;
							lootReward.name = enemy.firstName + "'s " + lootReward.name;
							var reward = lootReward;
							break;
							
							case 3:
							lootReward = enemy.legs;
							lootReward.name = enemy.firstName + "'s " + lootReward.name;
							var reward = lootReward;
							break;
						}
						break;
						
						case 2:
						lootReward = enemy.relic;
						lootReward.name = enemy.firstName + "'s " + lootReward.name;
						var reward = lootReward;
						break;
					}
				}
				else if (!enemy.player) {
					do {
						reward = generateLoot({});
					} while (reward.type == 1 && reward.id == 4 && player.weapon.twohanded && !enemy.ranReward);
				}
				else {
					var reward = playerReward;
					reward.type --;
				}
				if ((enemy.fallen || enemy.boss) && enemy.ranReward) {
					lootReward.name = enemy.firstName + "'s " + lootReward.name;
					var reward = lootReward;
				}
				switch (reward.type) {
					case 0:
					var currentTwoHands = '';
					if (player.weapon.twoHanded) {
						currentTwoHands = '\nRequires Two Hands';
					}
					var rewardTwoHands = '';
					if (reward.twoHanded) {
						rewardTwoHands = '\nRequires Two Hands';
					}
					var scrapChanceStr = "" + ((11 - player.weapon.modifications) / 10);
					scrapChance = Number(scrapChanceStr.slice(0,4));
					if (scrapChance > 1) {
						scrapChance = 1;
					}
					rewardResult = "LOOT REWARD FOUND\n\nFrom " + enemy.firstName + "'s corpse " + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward Weapon: " + reward.name + "\n" + reward.identifier + "\n" + reward.attackBonus + " Attack\n" + reward.modifications + " Modifications" + rewardTwoHands + "\n\nCurrent Weapon: " + player.weapon.name + "\n" + player.weapon.identifier + "\n" + player.weapon.attackBonus + " Attack\n" + player.weapon.modifications + " Modifications" + currentTwoHands + "\n\nCheck comments for available moves!";
					break;
					
					case 1:
					switch (reward.id) {
						case 0:
						var scrapChanceStr = "" + ((11 - player.head.modifications) / 10);
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\nFrom " + enemy.firstName + "'s corpse " + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[reward.id] + ": " + reward.name + "\n" + reward.identifier + "\n" + reward.defenseBonus + " Defense\n" + reward.modifications + " Modifications\n\nCurrent " + armourTypes[reward.id] + ": " + player.head.name + "\n" + player.head.identifier + "\n" + player.head.defenseBonus + " Defense\n" + player.head.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					
						case 1:
						var scrapChanceStr = "" + ((11 - player.body.modifications) / 10);
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\nFrom " + enemy.firstName + "'s corpse " + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[reward.id] + ": " + reward.name + "\n" + reward.identifier + "\n" + reward.defenseBonus + " Defense\n" + reward.modifications + " Modifications\n\nCurrent " + armourTypes[reward.id] + ": " + player.body.name + "\n" + player.body.identifier + "\n" + player.body.defenseBonus + " Defense\n" + player.body.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					
						case 2:
						var scrapChanceStr = "" + ((11 - player.arms.modifications) / 10);
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\nFrom " + enemy.firstName + "'s corpse " + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[reward.id] + ": " + reward.name + "\n" + reward.identifier + "\n" + reward.defenseBonus + " Defense\n" + reward.modifications + " Modifications\n\nCurrent " + armourTypes[reward.id] + ": " + player.arms.name + "\n" + player.arms.identifier + "\n" + player.arms.defenseBonus + " Defense\n" + player.arms.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					
						case 3:
						var scrapChanceStr = "" + ((11 - player.legs.modifications) / 10);
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\nFrom " + enemy.firstName + "'s corpse " + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[reward.id] + ": " + reward.name + "\n" + reward.identifier + "\n" + reward.defenseBonus + " Defense\n" + reward.modifications + " Modifications\n\nCurrent " + armourTypes[reward.id] + ": " + player.legs.name + "\n" + player.legs.identifier + "\n" + player.legs.defenseBonus + " Defense\n" + player.legs.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					
						case 4:
						if (player.offhand.id == 4 && player.offhand.type == 1) {
							var scrapChanceStr = "" + ((11 - player.offhand.modifications) / 10);
						}
						else {
							var scrapChanceStr = "" + ((11 - player.body.modifications) / 10);
						}
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\nFrom " + enemy.firstName + "'s corpse " + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[reward.id] + ": " + reward.name + "\n" + reward.identifier + "\n" + reward.attackBonus + " Attack\n" + reward.defenseBonus + " Defense\n" + reward.modifications + " Modifications\n\nCurrent " + armourTypes[reward.id] + ": " + player.offhand.name + "\n" + player.offhand.identifier + "\n" + player.offhand.attackBonus + " Attack\n" + player.offhand.defenseBonus + " Defense\n" + player.offhand.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					}
					break;
				
					case 2:
					var scrapChanceStr = "" + ((11 - player.relic.modifications) / 10);
					scrapChance = Number(scrapChanceStr.slice(0,4));
					if (scrapChance > 1) {
						scrapChance = 1;
					}
					rewardResult = "LOOT REWARD FOUND\n\nFrom " + enemy.firstName + "'s corpse " + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward Relic: " + reward.name + "\n" + reward.identifier + "\n" + reward.healthBonus + " Health\n" + reward.modifications + " Modifications\n\nCurrent Relic: " + player.relic.name + "\n" + player.relic.identifier + "\n" + player.relic.healthBonus + " Health\n" + player.relic.modifications + " Modifications\n\nCheck comments for available moves!";
					break;
				}
				var output = turnSummary + encounterResult + rewardResult;
				if (!lootReward.twohanded && !player.weapon.twohanded && lootReward.type == 0) {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE] \nReplace Current Offhand (" + player.offhand.name + ", " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - [HAHA])\nReplace Current Secondary Equipment - [LIKE] \nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (100 * scrapChance)) + "% chance degrade your respective item) - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();	
				}
				else if (lootReward.type == 0) {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nReplace Current Secondary Equipment - [LIKE]\nScrap the Loot - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();
				}
				else if (lootReward.type == 1 && lootReward.id == 4) {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nReplace Current Secondary Equipment - [LIKE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (100 * scrapChance)) + "% chance degrade your respective item) - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();
				}
				else {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (100 * scrapChance)) + "% chance degrade your respective item) - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();
				}
			}
			else {
				console.log(lootReward.type);
				if (lootReward.shop) {
					lootReward.type--;
				}
				console.log(lootReward.type);
				switch (lootReward.type) {
					case 0:
					var currentTwoHands = '';
					if (player.weapon.twoHanded) {
						currentTwoHands = '\nRequires Two Hands';
					}
					var rewardTwoHands = '';
					if (lootReward.twoHanded) {
						lootRewardTwoHands = '\nRequires Two Hands';
					}
					var scrapChanceStr = "" + ((11 - player.weapon.modifications) / 10);
					scrapChance = Number(scrapChanceStr.slice(0,4));
					if (scrapChance > 1) {
						scrapChance = 1;
					}
					rewardResult = "LOOT REWARD FOUND\n\n" + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward Weapon: " + lootReward.name + "\n" + lootReward.identifier + "\n" + lootReward.attackBonus + " Attack\n" + lootReward.modifications + " Modifications" + rewardTwoHands + "\n\nCurrent Weapon: " + player.weapon.name + "\n" + player.weapon.identifier + "\n" + player.weapon.attackBonus + " Attack\n" + player.weapon.modifications + " Modifications" + currentTwoHands + "\n\nCheck comments for available moves!";
					break;
					
					case 1:
					switch (lootReward.id) {
						case 0:
						var scrapChanceStr = "" + ((11 - player.head.modifications) / 10);
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\n" + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[lootReward.id] + ": " + lootReward.name + "\n" + lootReward.identifier + "\n" + lootReward.defenseBonus + " Defense\n" + lootReward.modifications + " Modifications\n\nCurrent " + armourTypes[lootReward.id] + ": " + player.head.name + "\n" + player.head.identifier + "\n" + player.head.defenseBonus + " Defense\n" + player.head.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					
						case 1:
						var scrapChanceStr = "" + ((11 - player.body.modifications) / 10);
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\n" + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[lootReward.id] + ": " + lootReward.name + "\n" + lootReward.identifier + "\n" + lootReward.defenseBonus + " Defense\n" + lootReward.modifications + " Modifications\n\nCurrent " + armourTypes[lootReward.id] + ": " + player.body.name + "\n" + player.body.identifier + "\n" + player.body.defenseBonus + " Defense\n" + player.body.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					
						case 2:
						var scrapChanceStr = "" + ((11 - player.arms.modifications) / 10);
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\n" + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[lootReward.id] + ": " + lootReward.name + "\n" + lootReward.identifier + "\n" + lootReward.defenseBonus + " Defense\n" + lootReward.modifications + " Modifications\n\nCurrent " + armourTypes[lootReward.id] + ": " + player.arms.name + "\n" + player.arms.identifier + "\n" + player.arms.defenseBonus + " Defense\n" + player.arms.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					
						case 3:
						var scrapChanceStr = "" + ((11 - player.legs.modifications) / 10);
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\n" + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[lootReward.id] + ": " + lootReward.name + "\n" + lootReward.identifier + "\n" + lootReward.defenseBonus + " Defense\n" + lootReward.modifications + " Modifications\n\nCurrent " + armourTypes[lootReward.id] + ": " + player.legs.name + "\n" + player.legs.identifier + "\n" + player.legs.defenseBonus + " Defense\n" + player.legs.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					
						case 4:
						if (player.offhand.id == 4 && player.offhand.type == 1) {
							var scrapChanceStr = "" + ((11 - player.offhand.modifications) / 10);
						}
						else {
							var scrapChanceStr = "" + ((11 - player.body.modifications) / 10);
						}
						scrapChance = Number(scrapChanceStr.slice(0,4));
						if (scrapChance > 1) {
							scrapChance = 1;
						}
						rewardResult = "LOOT REWARD FOUND\n\n" + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward " + armourTypes[lootReward.id] + ": " + lootReward.name + "\n" + lootReward.identifier + "\n" + lootReward.attackBonus + " Attack\n" + lootReward.defenseBonus + " Defense\n" + lootReward.modifications + " Modifications\n\nCurrent " + armourTypes[lootReward.id] + ": " + player.offhand.name + "\n" + player.offhand.identifier + "\n" + player.offhand.attackBonus + " Attack\n" + player.offhand.defenseBonus + " Defense\n" + player.offhand.modifications + " Modifications\n\nCheck comments for available moves!";
						break;
					}
					break;
				
					case 2:
					var scrapChanceStr = "" + ((11 - player.relic.modifications) / 10);
					scrapChance = Number(scrapChanceStr.slice(0,4));
					if (scrapChance > 1) {
						scrapChance = 1;
					}
					rewardResult = "LOOT REWARD FOUND\n\n" + player.name + " finds a piece of equipment, surely it may be of use...\n\nReward Relic: " + lootReward.name + "\n" + lootReward.identifier + "\n" + lootReward.healthBonus + " Health\n" + lootReward.modifications + " Modifications\n\nCurrent Relic: " + player.relic.name + "\n" + player.relic.identifier + "\n" + player.relic.healthBonus + " Health\n" + player.relic.modifications + " Modifications\n\nCheck comments for available moves!";
					break;
				}
				var output = turnSummary + encounterResult + rewardResult;
				if (!lootReward.twohanded && !player.weapon.twohanded && lootReward.type == 0) {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE] \nReplace Current Offhand (" + player.offhand.name + ", " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - [HAHA])\nScrap the Loot - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();	
				}
				else if (lootReward.type == 0) {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nReplace Current Secondary Equipment - [LIKE]\nScrap the Loot - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();
				}
				else if (lootReward.type == 1 && lootReward.id == 4) {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nReplace Current Secondary Equipment - [LIKE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (scrapChance * 100)) + "% chance degrade your respective item) - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();
				}
				else {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (scrapChance * 100)) + "% chance degrade your respective item) - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();
				}
			}
			
			encounterType = 8;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 9:
			//encounter dungeon Explorer
			lootReward = shopItem(1);
			playerReward = lootReward;
			encounterSummary = "DUNGEON EXPLORER ON " + getLocation() + "\n\nAs " + player.name + " enters this " + dungeon[stage].floorName.toLowerCase() + " they notice another Dungeon Explorer has already slain the enemy and now holds the reward in their hands, a " + lootReward.name + " (" + lootReward.identifier + ", +" + lootReward.attackBonus + " Attack, +" + lootReward.defenseBonus + " Defense, +" + lootReward.healthBonus + " Health/Max Health), perhaps they would be open to some sort of trade for the item, or maybe some other action would suffice...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Attempt to purchase the " + lootReward.name + " from the Explorer - [LIKE]\nAttempt to take the " + lootReward.name + " from the Explorer - [ANGRY]\nDiscuss combat techniques with the Explorer - [WOW]\nLeave the Explorer be - [HAHA]\n\n" + getPlayerInfo();
						
			encounterType = 9;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 10:
			//fallen hero shrine
			encounterSummary = "FALLEN HERO SHRINE ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find nothing but the shrine of a former dungeon Explorer, " + fallenHero.name + ". The plaque on the face of the shrine reads:\n\n" + fallenHeroMessage + "\n\n" + player.name + " could pay their respects to their fellow Explorer, although the Explorer in question would have no use for their equipment anymore...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Pay your respects to the " + fallenHero.name + " - [LOVE]\nAttempt to loot " + fallenHero.name + "'s Shrine - [ANGRY]\n\n" + getPlayerInfo();
						
			encounterType = 10;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 11:
			//the smith
			smithActions[0] = smithWeaponActions[Math.floor(Math.random() * smithWeaponActions.length)];
			if (player.offhand.type == 1) {
				armourAction = Math.floor(Math.random() * 5);
			}
			else {
				armourAction = Math.floor(Math.random() * 4);
			}
			smithActions[1] = smithArmourActions[armourAction][Math.floor(Math.random() * smithArmourActions[armourAction].length)];
			smithActions[2] = smithRelicActions[Math.floor(Math.random() * smithRelicActions.length)];
			
			weaponUpgradeCost = Math.floor(((player.weapon.attackBonus + player.attackCore) + 4) * ((player.weapon.attackBonus + player.attackCore)));
			weaponReforgeCost = Math.floor((player.weapon.modifications - 1) ** 2) * 15;
			armourUpgradeCost = Math.floor((player.defense + 4) * (player.defense));
			armourReforgeCost = Math.floor(((4) ** 2) * (wins / 4));
			if (!player.canSeeIntents) {
				encounterSummary = "BLACKSMITH ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to discover a lone blacksmith hammering away at their anvil. Upon realizing the Explorer in the " + dungeon[stage].roomName.toLowerCase()+ ", the smith offers " + player.name + " their services, tapping what seems to be a sign on their makeshift stall. Despite not being able to read the sign's contents, The Explorer could try and utilize The Smith's services...\n\nCheck comments for available moves!";
				var comment = "??? - [LIKE]\n??? - [LOVE]\n??? - [HAHA]\nDecline The Smith - [ANGRY]\n\n" + getPlayerInfo();
			}
			else {
				encounterSummary = "BLACKSMITH ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to discover a lone blacksmith hammering away at their anvil. Upon realizing the Explorer in the " + dungeon[stage].roomName.toLowerCase()+ ", the smith offers " + player.name + " their services, pointing towards the sign on their makeshift stall. The Explorer reads the offers, noting the flat " + (50 * (stage + 1)) + " Gold fee...\n\nCheck comments for available moves!";
				var comment = smithActions[0].description + " - [LIKE]\n" + smithActions[1].description + " - [LOVE]\n" + smithActions[2].description + " - [HAHA]\nDecline The Smith - [ANGRY]\n\n" + getPlayerInfo();
			}
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 11;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 12:
			enemy = generateMiniBoss(6);
			enemy.firstName = bossNames[Math.floor(Math.random() * bossNames.length)];
			enemy.name = "Demon " + enemy.firstName;
			
			encounterSummary = "DEMONIC SUMMONING SIGIL ACTIVATED\n\nAs " + player.name + " steps onto the sigil the faint red glow turns to burning purple, cursed flames erupt from the sigil's rim, and from the fire comes forth " + enemy.name + "...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Attempt to escape " + enemy.name + " - [LIKE]\nAttempt to worship " + enemy.name + " - [LOVE]\nAttempt to fight " + enemy.name + " - [ANGRY]\n\n" + getPlayerInfo();
					
			encounterType = 12;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 13:
			var prefix = bookPrefixes[Math.floor(Math.random() * bookPrefixes.length)];
			var name = bookNames[Math.floor(Math.random() * bookNames.length)];
			var suffix = bookSuffixes[Math.floor(Math.random() * bookSuffixes.length)];
			bookTitle = "The " + prefix + name + suffix;
			
			encounterSummary = "CURSED BOOK FOUND\n\nAs " + player.name + " explores The Library, they come across a dusty book atop a black pedestal. Wiping the cover, they reveal the title to be '" + bookTitle + "'. Within the tome could be some ancient forbidden knowledge, perhaps it is worth reading, or perhaps not...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Read " + bookTitle + " - [LIKE]\nPut " + bookTitle + " back - [ANGRY]\n\n" + getPlayerInfo();
					
			encounterType = 13;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 14:
			//the fountain
			if (player.canSeeIntents) {
				encounterSummary = "FOUNTAIN ON " + getLocation() + "\n\nAs " + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find it completely empty, save for a small stone fountain in the centre. At it's edge reads a message carved into the stone, it reads 'If ye are in true need, taketh these waters and be cleaned'...\n\nCheck comments for available moves!";
				var comment = "Touch the Water (???) - [LIKE]\nDrink the Water (???) - [LOVE]\nToss a Coin (???) - [HAHA]\nLeave the Fountain - [ANGRY]\n\n" + getPlayerInfo();
			}
			else {
				encounterSummary = "FOUNTAIN ON " + getLocation() + "\n\nAs " + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find it completely empty, save for a small stone fountain in the centre they almost trip over. At it's edge " + player.name + "'s hands come across a message carved into the stone, they can make out the words, '...are...need...waters...cleaned'...\n\nCheck comments for available moves!";
				var comment = "Touch the Water (???) - [LIKE]\nDrink the Water (???) - [LOVE]\nToss a Coin (???) - [HAHA]\nSplash Water onto Eyes (???) - [WOW]\nLeave the Fountain - [ANGRY]\n\n" + getPlayerInfo();
				}
			var output = turnSummary + encounterResult + encounterSummary;
					
			encounterType = 14;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 15:
			encounterSummary = "The figure turns towards " + player.name + " as they walk forwards, shifting it's stance as to deter the Explorer from coming any closer. It speaks a language " + player.firstName + " understands...\n'Turn back, The Gate will not open'\n" + player.name + " takes a single step forward, and in a single motion the figure carves a great gash into the solid stone floor, barely clear of the Explorer's foot.\n'I will not warn you again'\n'Turn back...'\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Accept - [LOVE]\nRefuse - [ANGRY]\n\nEQUIPMENT\nHead: " + player.head.name + " - " + player.head.defenseBonus + " Defense - " + player.head.modifications + " Modifications\nBody: " + player.body.name + " - " + player.body.defenseBonus + " Defense - " + player.body.modifications + " Modifications\nArms: " + player.arms.name + " - " + player.arms.defenseBonus + " Defense - " + player.arms.modifications + " Modifications\nLegs: " + player.legs.name + " - " + player.legs.defenseBonus + " Defense - " + player.legs.modifications + " Modifications\nWeapon: " + player.weapon.name + " - " + player.weapon.attackBonus + " Attack - " + player.weapon.modifications + " Modifications\nOffhand: " + player.offhand.name + " - " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - " + player.offhand.modifications + " Modifications\nRelic: " + player.relic.name + " - " + player.relic.healthBonus + " Additional Health - " + player.relic.modifications + " Modifications\nGold - " + runGold;
						
			encounterType = 15;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 16:
			encounterSummary = "POOL OF HONEY ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find a large pool of golden honey. Several worker bees can be seen taking and depositing the fluid at the pool's edge, but despite this risk it would likely be worthwhile to sample it...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Attempt to sneakily take some honey - [LOVE]\nAttempt to distract the bees and draw them away - [HAHA] \nLeave the pool alone - [ANGRY]\n\n" + getPlayerInfo();
						
			encounterType = 16;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 17:
			encounterSummary = "HIDDEN TRAP ON " + getLocation() + "\n\n" + player.name + " walks into this room to hear a click at their feet, and they look down to see they have activated some hidden trap! With only seconds to spare, the Explorer must quickly decide what to do...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Jump - [LIKE]\nDuck - [LOVE] \nDodge - [HAHA]\n\n" + getPlayerInfo();
						
			encounterType = 17;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 18:
			// Unused
			encounterSummary = "VAULT DOOR ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find a large and very heavy looking iron door. Inscribed on the door are two symbols; one of a sword and one of a shield. The warm blue glow of the inscriptions invites you to touch one...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Touch the Sword Symbol - [LIKE]\nTouch the Shield Symbol - [LOVE] \nLeave the Door alone - [ANGRY]\n\n" + getPlayerInfo();
						
			encounterType = 18;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 19:
			// Unused
			encounterSummary = "SECOND VAULT DOOR ON " + getLocation() + "\n\n" + player.name + " walks up to the second vault door to find three individual bowls - one containing fire, another water, and the last a small plant. " + player.name + " feels compelled to touch one...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Place the Plant in the Fire - [LIKE]\nDouse the Fire with the Water - [LOVE]\nWater the Plant - [HAHA] \nLeave the Bowls alone - [ANGRY]\n\n" + getPlayerInfo();
					
			encounterType = 19;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 20:
			// Utility
			if (!learnMove.address) {
				
			}
			else if (learnMove.player) {
				learnMove = moves[learnMove.address[0]][learnMove.address[1]][Math.floor(Math.random() * moves[learnMove.address[0]][learnMove.address[1]].length)];
			}
			else {
				learnMove = enemyAttacks[learnMove.address[0]][learnMove.address[1]][stage];
			}
			encounterSummary = "NEW COMBAT MOVE\n\n" + player.name + " is able to learn a new move: " + learnMove.name + " (" + learnMove.description + ")\nThis move will occupy the " + moveSlots[learnMove.slot] + " slot\n" + learnMove.requirementText + "\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Learn the Move - [LOVE]\nIgnore the Move - [ANGRY]\n\n" + getPlayerInfo();
						
			encounterType = 20;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 21:
			// Unused
			encounterSummary = "THRONE ROOM ON " + getLocation() + "\n\n" + player.name + " enters this room to find a towering throne at it's centre, there appears to be a figure sitting atop it, but " + player.firstName + " can't be certain without ascending the stairs to check...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Ascend to The Throne - [LOVE]\nLeave The Throne Room - [ANGRY]\n\n" + getPlayerInfo();
						
			encounterType = 21;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 22:
			// Unused
			encounterSummary = "EMPTY THRONE\n\nAfter climbing to the top of the colossal throne, " + player.name + " is somewhat relieved to find that the figure that they saw was but a mere illusion, and that The Throne is empty...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Sit on The Throne - [LOVE]\nLeave The Throne - [ANGRY]\n\n" + getPlayerInfo();
						
			encounterType = 22;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 23:
			encounterDeathMessage = "SAT ATOP THE THRONE\n\n" + player.name + " decides to take a seat on The Throne. Immediately they begin to feel it drain their energy. The Explorer tries to stand up, but their weakened body is incapable of even that. A black halo begins to form around their head, thorns erupt from their skull, and yet despite the pain they can't help but feel tired. After some time " + player.name + " can barely keep their eyes open. Their body yearns for sleep, and with little resistance, their consciousness fades away...\n\n";
			encounterCauseOfDeath = "succumbed to the power of The Throne";
			loss('','',1)
			break;
			
			case 24:
			encounterSummary = "OCCUPIED THRONE\n\nAfter climbing to the top of the colossal throne, " + player.name + " finds a near skeletal figure sitting atop The Throne. On it's head is a black thorny crown, it could potentially be of some value, or power. But the question remains, take the Crown while the figure sits on The Throne, or ...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Sit on The Throne - [LOVE]\nLeave The Throne - [ANGRY]\n\n" + getPlayerInfo();
					
			encounterType = 22;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 25:
			// Unused
			break;
			
			case 26:
			// Utility
			encounterSummary = "LEVEL UP\n\n" + player.name + " is able to upgrade one of their moves!\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "";
			i = 0;
			while (i < 4) {
				if (player.moves[i + 1].upgradeable) {
					if (!player.moves[i + 1].classMove) {
						comment += "Upgrade " + player.moves[i + 1].name + " (" + player.moves[i + 1].description + ") => " + moves[player.weapon.id][i + 1][player.movelevels[player.weapon.id][i + 1] + 1].name + " (" + moves[player.weapon.id][i + 1][player.movelevels[player.weapon.id][i + 1] + 1].description + ") - " + moveSlots[i + 1] + "\n";
					}
					else if (player.moves[i + 1].classMove) {
						comment += "Upgrade " + player.moves[i + 1].name + " (" + player.moves[i + 1].description + ") => " + moves[5][player.moves[i + 1].classID][player.movelevels[5][player.moves[i + 1].classID] + 1].name + " (" + moves[5][player.moves[i + 1].classID][player.movelevels[5][player.moves[i + 1].classID] + 1].description + ") - " + moveSlots[i + 1] + "\n";	
					}
				}
				i++;
			}
			comment += "\n" + getPlayerInfo();
						
			encounterType = 26;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 27:
			// Utility
			// Unused
			encounterSummary = "SELECT CONSUMABLE\n\n" + player.name + " checks their supply of consumables, deciding which one to use...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "";
			i = 0;
			while (i < player.consumables.length) {
				comment += "Use " + player.consumables[i].name + " " + player.consumables[i].identifier + " - " + moveSlots[i + 2] + "\n" + '"' + player.consumables[i].description + '"\n\n';
				i++;
			}
			comment += "\n" + getPlayerInfo();
			encounterType = 27;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 28:
			// Utility
			encounterSummary = "SCRAPPING WEAPON\n\n" + player.name + " decides which weapon to enhance...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var scrapChanceStr = "" + ((11 - player.weapon.modifications) / 10);
			scrapChance = Number(scrapChanceStr.slice(0,4));
			if (scrapChance > 1) {
				scrapChance = 1;
			}
			if (player.weapon.twohanded || player.offhand.type != 0) {
				var comment = "Enhance Weapon (" + scrapChance * 100 + "% Success Chance) - [LIKE]";
			}
			else {
				var comment = "Enhance Weapon (" + scrapChance * 100 + "% Success Chance) - [LIKE]";
				
				var scrapChanceStr = "" + ((11 - player.offhand.modifications) / 10);
				scrapChance = Number(scrapChanceStr.slice(0,4));
				if (scrapChance > 1) {
					scrapChance = 1;
				}
				
				comment += "\nEnhance Offhand (" + scrapChance * 100 + "% Success Chance) - [LOVE]"
			}
			if (!player.secondaryWeapon.empty) {
				var scrapChanceStr = "" + ((11 - player.secondaryWeapon.modifications) / 10);
				scrapChance = Number(scrapChanceStr.slice(0,4));
				if (scrapChance > 1) {
					scrapChance = 1;
				}
				
				comment += "\nEnhance Secondary Weapon (" + scrapChance * 100 + "% Success Chance) - [HAHA]"
			}
			if (!player.secondaryOffhand.empty) {
				if (player.secondaryOffhand.type == 0 && !player.secondaryWeapon.twohanded) {
					var scrapChanceStr = "" + ((11 - player.secondaryOffhand.modifications) / 10);
					scrapChance = Number(scrapChanceStr.slice(0,4));
					if (scrapChance > 1) {
						scrapChance = 1;
					}
				
					comment += "\nEnhance Secondary Offhand (" + scrapChance * 100 + "% Success Chance) - [WOW]"
				}
			}
			comment += "\n\n" + getPlayerInfo();
			encounterType = 28;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 29:
			encounterSummary = "PORTAL SIGIL ACTIVATING\n\nAs " + player.name + " steps onto the sigil the faint red etchings glow brighter, embers begin to fly upwards as reality seems to fade away...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Stay on the Portal Sigil - [LIKE]\nJump off the Portal Sigil - [ANGRY]\n\n" + getPlayerInfo();
					
			encounterType = 29;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 30:
			encounterSummary = "The Merchant gestures to his remaining items...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					encounterSummary  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			encounterSummary += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 30;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 31:
			encounterSummary = player.name + " gestures to their own equipment, indicating that they may like to:";
			var comment = ""
			if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
			else {
				encounterSummary += "\n\nSell a weapon";
				comment += "Sell Weapons - [LIKE]\n";
			}
			if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
			else {
				encounterSummary += "\n\nSell some of their armour";
				comment += "Sell Armour - [LOVE]\n";
			}
			if (!player.relic.empty) {
				encounterSummary += "\n\nSell their " + player.relic.name + " (Relic Base Worth: " + player.relic.cost + ", Sell Price: " + Math.floor((player.relic.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell Relic - [HAHA]\n";
			}
			encounterSummary += "\n\nCheck comments for available moves!"
			comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 31;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 32:
			encounterSummary = player.name + " pulls out their weapons, indicating which they would like to sell...";
			var comment = "";
			if (player.weapon.empty) {}
			else {
				encounterSummary += "\n\nTheir " + player.weapon.name + " (Weapon Base Worth: " + player.weapon.cost + ", Sell Price: " + Math.floor((player.weapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.weapon.name + " - [LIKE]\n"
			}
			if (player.offhand.empty) {}
			else {
				encounterSummary += "\n\nTheir " + player.offhand.name + " (Weapon Base Worth: " + player.offhand.cost + ", Sell Price: " + Math.floor((player.offhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.offhand.name + " - [LOVE]\n"
			}
			if (player.secondaryWeapon.empty) {}
			else {
				encounterSummary += "\n\nTheir " + player.secondaryWeapon.name + " (Weapon Base Worth: " + player.secondaryWeapon.cost + ", Sell Price: " + Math.floor((player.secondaryWeapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.secondaryWeapon.name + " - [HAHA]\n"
			}
			if (player.secondaryOffhand.empty) {}
			else {
				encounterSummary += "\n\nTheir " + player.secondaryOffhand.name + " (Weapon Base Worth: " + player.secondaryOffhand.cost + ", Sell Price: " + Math.floor((player.secondaryOffhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.secondaryOffhand.name + " - [WOW]\n"
			}
			encounterSummary += "\n\nCheck comments for available moves!";
			comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 32;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 33:
			encounterSummary = player.name + " motions towards their armour, indicating which they would like to sell...";
			var comment = "";
			if (player.head.empty) {}
			else {
				encounterSummary += "\n\nTheir " + player.head.name + " (Weapon Base Worth: " + player.head.cost + ", Sell Price: " + Math.floor((player.head.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.head.name + " - [LIKE]\n"
			}
			if (player.body.empty) {}
			else {
				encounterSummary += "\n\nTheir " + player.body.name + " (Weapon Base Worth: " + player.body.cost + ", Sell Price: " + Math.floor((player.body.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.body.name + " - [LOVE]\n"
			}
			if (player.arms.empty) {}
			else {
				encounterSummary += "\n\nTheir " + player.arms.name + " (Weapon Base Worth: " + player.arms.cost + ", Sell Price: " + Math.floor((player.arms.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.arms.name + " - [HAHA]\n"
			}
			if (player.legs.empty) {}
			else {
				encounterSummary += "\n\nTheir " + player.legs.name + " (Weapon Base Worth: " + player.legs.cost + ", Sell Price: " + Math.floor((player.legs.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.legs.name + " - [WOW]\n"
			}
			encounterSummary += "\n\nCheck comments for available moves!";
			comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 33;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 34:
			console.log(getTimeStamp() + "Weapon Shop Encounter...");
			//sell items
			currentMerchant = {shop:[],active:true,sellModifier:0,type:1}
			currentMerchant.shop.push(shopItem(2,1))
			currentMerchant.shop.push(shopItem(1,1));
			currentMerchant.shop.push(shopItem(0,1));
			i = 0;
			lootGoldGain = 0;
			while (i < player.storedItems.length) {
				lootGoldGain += Math.floor(player.storedItems[i].cost / (2 * Math.random() + 1));
				i++;
			}
			runGold += lootGoldGain;
			player.storedItems = [];
			//shop
			
			encounterSummary = "WEAPONER ON " + getLocation() + "\n\nOn this " + dungeon[stage].roomName.toLowerCase()+ " it appears a merchant specializing in weapons has set up shop deep within The Dungeon peddling his wares. After purchasing " + player.name + "'s spare items (+" + lootGoldGain + " Gold) he points towards the three different weapons in front of him...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nSell Items - [SAD]\nAttempt to Rob The Weaponer - [WOW]\nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			
			encounterType = 34;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 35:
			encounterSummary = "The Weaponer gestures to his remaining weapons...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					encounterSummary  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			encounterSummary += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 35;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 36:
			console.log(getTimeStamp() + "Armour Shop Encounter...");
			//sell items
			currentMerchant = {shop:[],active:true,sellModifier:0,type:2}
			currentMerchant.shop.push(shopItem(2,2))
			currentMerchant.shop.push(shopItem(1,2));
			currentMerchant.shop.push(shopItem(0,2));
			i = 0;
			lootGoldGain = 0;
			while (i < player.storedItems.length) {
				lootGoldGain += Math.floor(player.storedItems[i].cost / (2 * Math.random() + 1));
				i++;
			}
			runGold += lootGoldGain;
			player.storedItems = [];
			//shop
			
			encounterSummary = "ARMOURIST ON " + getLocation() + "\n\nOn this " + dungeon[stage].roomName.toLowerCase()+ " it appears a merchant specializing in armour has set up shop deep within The Dungeon peddling his wares. After purchasing " + player.name + "'s spare items (+" + lootGoldGain + " Gold) he points towards the three different armour pieces in front of him...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nSell Items - [SAD]\nAttempt to Rob The Armourist - [WOW]\nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			
			encounterType = 36;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 37:
			encounterSummary = "The Armourist gestures to his remaining armour pieces...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					encounterSummary  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			encounterSummary += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 37;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 38:
			console.log(getTimeStamp() + "Relic Shop Encounter...");
			//sell items
			currentMerchant = {shop:[],active:true,sellModifier:0,type:3}
			currentMerchant.shop.push(shopItem(2,3))
			currentMerchant.shop.push(shopItem(1,3));
			currentMerchant.shop.push(shopItem(0,3));
			i = 0;
			lootGoldGain = 0;
			while (i < player.storedItems.length) {
				lootGoldGain += Math.floor(player.storedItems[i].cost / (2 * Math.random() + 1));
				i++;
			}
			runGold += lootGoldGain;
			player.storedItems = [];
			//shop
			
			encounterSummary = "RELIFICER ON " + getLocation() + "\n\nOn this " + dungeon[stage].roomName.toLowerCase()+ " it appears a merchant specializing in relics has set up shop deep within The Dungeon peddling her wares. After purchasing " + player.name + "'s spare items (+" + lootGoldGain + " Gold) she points towards the three different armour pieces in front of her...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nSell Items - [SAD]\nAttempt to Rob The Relificer - [WOW]\nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			
			encounterType = 38;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 39:
			encounterSummary = "The Relificer gestures to her remaining relics...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					encounterSummary  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			encounterSummary += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 39;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 40:
			console.log(getTimeStamp() + "Exotic Shop Encounter...");
			//sell items
			currentMerchant = {shop:[],active:true,sellModifier:0,type:4}
			currentMerchant.shop.push(shopItem(3,1))
			currentMerchant.shop.push(shopItem(3,2));
			currentMerchant.shop.push(shopItem(3,3));
			i = 0;
			lootGoldGain = 0;
			while (i < player.storedItems.length) {
				lootGoldGain += Math.floor(player.storedItems[i].cost / (2 * Math.random() + 1));
				i++;
			}
			runGold += lootGoldGain;
			player.storedItems = [];
			//shop
			
			encounterSummary = "EXOTICIST ON " + getLocation() + "\n\nOn this " + dungeon[stage].roomName.toLowerCase()+ " it appears a merchant specializing in rare items has set up shop deep within The Dungeon peddling her wares. After purchasing " + player.name + "'s spare items (+" + lootGoldGain + " Gold) she points towards the three different items in front of her...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var output = turnSummary + encounterResult + encounterSummary;
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nSell Items - [SAD]\nAttempt to Rob The Exoticist - [WOW]\nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			
			encounterType = 40;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 41:
			encounterSummary = "The Exoticist gestures to her remaining items...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					encounterSummary  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			encounterSummary += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			var output = turnSummary + encounterResult + encounterSummary;
			
			encounterType = 41;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);
			save();
			break;
			
			case 42:
			// Unused
			encounterSummary = "HIDDEN LAKE " + getLocation() + "\n\n" + player.name + " enters the " + dungeon[stage].roomName.toLowerCase() + " to find a vast misty lake. A narrow but otherwise safe path skirts it's edge leading towards the chamber's exit, but through the fog there appears to be a small island, upon which looks to be a mysterious object. Swimming out to the island would prove to verify it's existence, but to do so safely the Explorer would have to shed most of their armour, and who knows what other secrets the fog hides...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Swim out to The Island with half armour - [LIKE]\nSwim out to The Island with full armour - [LOVE]\nKeep to the water's edge - [ANGRY]\n\n" + getPlayerInfo();
					
			encounterType = 42;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 43:
			// Unused
			encounterSummary = "DROWNING\n\nWithout warning waves roll across The Lake like thunder as " + player.name + " reaches the halfway point. They struggle against the surge, but it only gets worse the further they stray from the shore, they struggle for air as their armour threatens to pull them under. To continue to The Island safely they would have to shed a piece, but if they turned back now they would be able to keep their gear intact, or perhaps they could risk everything and just keep swimming...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Turn back - [LIKE]\n"
			if (!player.head.empty) {
				comment += "Discard '" + player.head.name + "' - [LOVE]\n"
			}
			if (!player.body.empty) {
				comment += "Discard '" + player.body.name + "' - [HAHA]\n"
			}
			if (!player.arms.empty) {
				comment += "Discard '" + player.arms.name + "' - [WOW]\n"
			}
			if (!player.legs.empty) {
				comment += "Discard '" + player.legs.name + "' - [SAD]\n"
			}

			comment += "Keep swimming - [ANGRY]\n\n" + getPlayerInfo();
			encounterType = 43;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
			
			case 44:
			// Unused
			encounterSummary = "THE ISLAND\n\n" + player.name + " climbs onto The Island, finding at it's peak a glowing sword stabbed into a giant serpent's skull. It radiates a powerful energy...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Take The Sword - [LOVE]\nSearch for a way off The Island - [ANGRY]\n\n" + getPlayerInfo();
					
			encounterType = 44;
			awaitChoice = true;
			awaitMove = false;
			playerResult = '';
			enemyResult = '';
			turnSummary = '';
			encounterResult = '';
			post(output, comment, renderPlayer);	
			save();
			break;
	}
}

function resolveEncounter (encounterChoice) {
	console.log(getTimeStamp() + "Resolving Encounter...");
	switch(encounterType) {
		case 1:
		return;
		break;
		
		case 2:
		if ((encounterChoice == 3) || (encounterChoice == 4) || (encounterChoice == 5) || (encounterChoice == 0)) {
				console.log(getTimeStamp() + "Invalid Choice...");
				var output = "CHEST OF GOLD FOUND ON " + dungeon[stage].floorName.toUpperCase() + " " + (floor + 1) + ", " + dungeon[stage].roomName.toLowerCase()+ " " + (room) + " OF " + dungeon[stage].name.toUpperCase() + " (STAGE " + (stage + 1) + ")\n\nIn the centre of the " + dungeon[stage].roomName.toLowerCase()+ " sits a heavy, unlocked iron chest, perhaps there is some sort of treasure inside, perhaps it is something else entirely...\n\nCheck comments for available moves!"; 
				var comment = "Open the Chest - [LIKE]\nLeave the Chest - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
		else {
			switch (encounterChoice) {
				case 1:
				//ignore chest
				encounterResult = "LEFT THE CHEST\n\n" + player.name + " chooses to ignore the obvious trap, or at least what seemed like an obvious trap, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				room++;
				turn = 1;
				turnStart(true);
				break;
		
				case 2:
				//open chest
				if (Math.random() < 0.75) {
					var goldGain = Math.floor((wins + 1) * (Math.random() + 1) * 5);
					runGold += goldGain;
					encounterResult = "OPENED THE CHEST\n\n" + player.name + " opens the chest, finding within " + goldGain + " gold! Proceeding onwards...\n\n"
					encounterOccured = true;
					awaitChoice = false;
					room++;
					turn = 1;
					turnStart(true);
				}
				else {
					enemy = generateMiniBoss(5);
					encounterResult = "ATTACKED BY MOCK-CHEST\n\n" + player.name + " opens the chest, finding within no treasure but rows and rows of teeth! The lid swings shut upon " + player.name + "'s arms (-10 Health) as it springs to life...\n\n"
					player.health -= 10;
					if (player.health <= 0) {
						encounterDeathMessage = "ATTACKED BY MOCK-CHEST\n\n" + player.name + " opens the chest, finding within no treasure but rows and rows of teeth! The lid swings shut upon " + player.name + "'s arms (-10 Health), snapping them clean off. With the Explorer bleeding and vulnerable, the Mock-Chest lifts itself up from the ground, and " + player.name + " watches helplessly as their death shuffles slowly towards them...\n\n"
						encounterCauseOfDeath = "gruesomely eaten alive by " + enemy.name;
						loss('','',1)
						return;
					}
					encounterOccured = true;
					attacked = true;
					awaitChoice = false;
					turn = 1;
					turnStart(true);
				}
				break;
			}
		}
		break;
		
		case 3:
		switch (encounterChoice) {
			case 2:
			console.log(getTimeStamp() + "Sigil Activated...");
			var ranEncounter = Math.floor(Math.random() * 4);
			switch (ranEncounter) {
				case 0:
				//level skip
				encounterType = 29;
				encounter(29);
				break;
				
				case 1:
				//demonic weapon
				if (player.attack > player.defense) {
					lootReward = generateLoot({rewardType:1,tier:bossItemTiers[Math.floor(Math.random() * bossItemTiers.length)]})
					lootReward.name = demonicPrefixes[Math.floor(Math.random() * demonicPrefixes.length)] + " " + lootReward.name;
					switch (lootReward.id) {
						case 0:
						lootReward.defenseBonus = player.head.defenseBonus + 2;
						break;
						
						case 1:
						lootReward.defenseBonus = player.body.defenseBonus + 2;
						break;
						
						case 2:
						lootReward.defenseBonus = player.arms.defenseBonus + 2;
						break;
						
						case 3:
						lootReward.defenseBonus = player.legs.defenseBonus + 2;
						break;
						
						case 4:
						lootReward.defenseBonus = player.offhand.defenseBonus + 2;
						break;
						
						
					}
					lootReward.healthBonus = Math.floor(player.healthCore * 0.25);
				}
				else {
					lootReward = generateLoot({rewardType:0,tier:bossItemTiers[Math.floor(Math.random() * bossItemTiers.length)]})
					lootReward.name = demonicPrefixes[Math.floor(Math.random() * demonicPrefixes.length)] + " " + lootReward.name;
					lootReward.attackBonus += 3;
					lootReward.healthBonus = Math.floor(player.healthCore * 0.25);
				}
				lootReward.demonic = true;
				lootReward.modifications = 1;
				awaitChoice = true;
				turnSummary = "DEMONIC FORGE SIGIL ACTIVATED\n\nAs " + player.name + " steps onto the sigil the faint red glow turns to hot orange, flames erupt from the sigil's rim, and before " + player.name + " floats a powerful demonic artifact. It would be a definite improvement over their current equipment, but at what cost...\n\n"
				encounterType = 8;
				encounter(8);
				break;
				
				case 2:
				//summon demon
				encounterType = 12;
				encounter(12);
				break;
				
				case 3:
				//nothing happens
				encounterResult = "SIGIL INACTIVE\n\n" + player.name + " steps onto the sigil, but is surprised to find that nothing happens. Somewhat disappointed, they continue onwards\n\n"
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Sigil Ignored...");
			turn = 1
			room ++;			
			encounterResult = "SIGIL IGNORED\n\n" + player.name + " ignored the strange sigil, better not to poke around with mysterious forces, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 3,4,5,0:
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "STRANGE SIGIL ON " + dungeon[stage].floorName.toUpperCase() + " " + (floor + 1) + ", ROOM " + (room) + " OF " + dungeon[stage].name.toUpperCase() + " (STAGE " + (stage + 1) + ")\n\nA strange sigil is etched into the floor of the room. It glows dim with a sinister red, getting brighter as " + player.name + " draws closer. " + player.name + " wonders what could happen if they step into it...\n\nCheck comments for available moves!";
			var comment = "Step onto the sigil (???) - [LIKE] \nStep around the sigil and proceed to the next " + dungeon[stage].floorName.toLowerCase() + " - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 4:
		if ((encounterChoice == 1) || (encounterChoice == 4) || (encounterChoice == 0)) {
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "TREASURE ON " + getLocation() + "\n\nIn the middle of this " + dungeon[stage].roomName.toLowerCase()+ " are three ornate stone pedestals, bearing the mark of a symbol that corresponds to the item on top...\n\nCheck comments for available moves!";
			var comment = "Choose the pedestal with a sword symbol - [LIKE] \nChoose the pedestal with a shield symbol - [LOVE] \nChoose the pedestal with an amulet symbol - [HAHA]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
		}
		else {
			switch (encounterChoice) {
				case 2:
				lootReward = generateLoot({rewardType:0});
				encounterType = 8;
				encounter(8);
				break;
				
				case 5:
				lootReward = generateLoot({rewardType:1});
				encounterType = 8;
				encounter(8);
				break;
				
				case 3:
				lootReward = generateLoot({rewardType:2});
				encounterType = 8;
				encounter(8);
				break;
			}
		}
		break;
		
		case 5:
		switch (encounterChoice) {
			case 0:
			case 3:
			case 4:
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "LIBRARY ON " + getLocation() + "\nThis " + dungeon[stage].roomName.toLowerCase()+ " contains a vast library with many different books that " + player.name + " could read, or they could take the opportunity to find a quite corner and get some rest...\n\nCheck comments for available moves!";
			var comment = "Explore The Library - [LIKE]\nFind a place to rest - [LOVE]\nLeave The Library - [ANGRY]\n\nCurrent Health = " + player.health + "/" + player.maxHealth + "\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
			
			case 1:
			turn = 1
			room ++;
			encounterResult = "LEFT THE LIBRARY\n\n" + player.name + " decides the leave The Library and pursue the other aspects of The Dungeon, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 2:
			eventType = Math.random();
			if (eventType < 0.25) {
				encounterType = 13;
				encounter(13);
			}
			else if (eventType < 0.5) {
				var bookType = Math.floor(Math.random() * 6);
				switch (bookType) {
					case 0:
					//core attack
					var improvementText = "and from it they learn several new offensive combat techniques (+1 Core Attack)";
					player.attackCore ++;
					break;
					
					case 1:
					//core defense
					var improvementText = "and from it they learn several new defensive combat techniques (+1 Core Defense)";
					player.defenseCore ++;
					break;
					
					case 2:
					//core health
					var improvementText = "and from it they learn several new techniques to improve their vitality (+5 Core Health)";
					if (player.relic.demonic) {
						player.relic.healthBonus += 5;
					}
					else {
						player.healthCore += 5;
					}
					player.health += 5;
					player.maxHealth += 5;
					break;
					
					case 3:
					//weapon improve
					var improvementText = "and from it they learn a way to improve their weapon (+1 Weapon Attack)";
					player.weapon.attackBonus ++;
					break;
					
					case 4:
					//armour improve
					var improvementText = "and from it they learn a way to improve their armour (+1 Body-Armour Defense)";
					player.body.defenseBonus ++;
					break;
					
					case 5:
					//relic improve
					var improvementText = "and from it they learn a way to improve their relic (+5 Relic Health/Max Health)";
					player.relic.healthBonus += 5;
					player.health += 5;
					break;
				}
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				turn = 1
				room ++;
				encounterResult = "SKILL BOOK FOUND IN THE LIBRARY\n\n" + player.name + " finds a book within The Library, " + improvementText + ", proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else if (eventType < 0.75) {
				encounterResult = "MOVE ENHANCEMENT BOOK FOUND IN THE LIBRARY\n\n" + player.name + " finds a book within The Library, containing within new techniques to apply in one of their combat moves...\n\n";
				didGainLootEquipment = false;
				encounterType = 26;
				encounter(26);
			}
			else if (eventType < 0) {
				learnMove = learnableEnemyMoves[Math.floor(Math.random() * learnableEnemyMoves.length)];
				encounterResult = "MOVE BOOK FOUND IN THE LIBRARY\n\n" + player.name + " finds a book within The Library, containing within details of a strange new combat move...\n\n";
				encounterType = 20;
				encounter(20);
				return;
			}
			else {
				//lore book
				turn = 1
				room ++;
				if (player.canSeeIntents) {
					loreBook = loreBooks[Math.floor(loreBooks.length * Math.random())]
					encounterResult = "FOUND A BOOK TO READ IN THE LIBRARY\n\n" + player.name + " finds a book titled " + loreBook.title + ", they flick to one of the legible pages...\n\n" + loreBook.pages[Math.floor(Math.random() * loreBook.pages.length)] + "\n\nThey put the book back and leave The Library, proceeding onwards...\n\n"
				}
				else {
					encounterResult = "FOUND A BOOK TO READ IN THE LIBRARY\n\n" + player.name + " manages to find a book, but is unable to read it due to being blinded, proceeding onwards...\n\n"
				}
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 5:
			var originalHealth = player.health;
			player.health += 50;
			if (player.health > player.maxHealth) {
				player.health = player.maxHealth
			}
			turn = 1
			room ++;
			encounterResult = "SLEPT IN THE LIBRARY\n\n" + player.name + " finds a reasonably hidden section of The Library and settles down to rest (+" + (player.health - originalHealth) + " Health), proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
		}
		break;
		
		case 6:
		switch (encounterChoice) {
			case 2:
			console.log(getTimeStamp() + "Purchased Shop Item 1...");
			if (runGold >= currentMerchant.shop[0].cost) {
				runGold -= currentMerchant.shop[0].cost;
				lootReward = currentMerchant.shop[0];
				currentMerchant.shop[0] = {sold:true};
				currentMerchant.sellModifier += 3;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Merchant, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Merchant points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 30;
				encounter(30)
			}
			
			break;
			
			case 5:
			console.log(getTimeStamp() + "Purchased Shop Item 2...");
			if (runGold >= currentMerchant.shop[1].cost) {
				runGold -= currentMerchant.shop[1].cost;
				lootReward = currentMerchant.shop[1];
				currentMerchant.shop[1] = {sold:true};
				currentMerchant.sellModifier += 2;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Merchant, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Merchant points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 30;
				encounter(30)
			}
			break;
			
			case 3:
			console.log(getTimeStamp() + "Purchased Shop Item 3...");
			if (runGold >= currentMerchant.shop[2].cost) {
				runGold -= currentMerchant.shop[2].cost;
				lootReward = currentMerchant.shop[2];
				currentMerchant.shop[2] = {sold:true};
				currentMerchant.sellModifier += 1;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Merchant, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Merchant points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 30;
				encounter(30)
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING\n\n" + player.name + " declined The Merchant's offer\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 4:
			enemy = generateMiniBoss(0);
			enemy.name = "The Merchant";
			enemy.firstName = "The Merchant";
			enemy.goldPotential *= 2;
			switch (Math.floor(Math.random() * 3)) {
				case 0:
				lootReward = currentMerchant.shop[0];
				break;
				
				case 1:
				lootReward = currentMerchant.shop[1];
				break;
				
				case 2:
				lootReward = currentMerchant.shop[2];
				break;
			}
			enemy.attack = 5;
			
			enemy.attack += currentMerchant.shop[0].attackBonus;
			enemy.attack += currentMerchant.shop[1].attackBonus;
			enemy.attack += currentMerchant.shop[2].attackBonus;
			
			enemy.defense = 5;
			
			enemy.defense += currentMerchant.shop[0].defenseBonus;
			enemy.defense += currentMerchant.shop[1].defenseBonus;
			enemy.defense += currentMerchant.shop[2].defenseBonus;
			
			enemy.maxHealth += currentMerchant.shop[0].healthBonus;
			enemy.maxHealth += currentMerchant.shop[1].healthBonus;
			enemy.maxHealth += currentMerchant.shop[2].healthBonus;
			
			enemy.health = enemy.maxHealth;
			
			enemyTempDefense = enemy.defense;
			
			enemy.ranReward = false;
			currentMerchant.active = false;
			turn = 1
			encounterResult = "ATTEMPTED TO ROB THE MERCHANT\n\n" + player.name + " seizes an opportunity, drawing their weapon and advancing towards The Merchant. In an instant, their target arms themselves with the items from the table and leaps towards " + player.name + ", beginning fight...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			attacked = true;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0:
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "MERCHANT ON " + getLocation() + "\n\nOn this floor it appears a merchant has set up shop deep within The Dungeon peddling his wares. After purchasing " + player.name + "'s spare items he points towards the three different objects in front of him...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nPurchase nothing - [ANGRY] \nSell Items - [SAD]\nAttempt to Rob The Merchant - [WOW] \n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 7:
		var attackChance = Math.random();
		switch (encounterChoice) {	
			case 2:
			if (attackChance <= 0.5) {
				console.log(getTimeStamp() + "Slept and Was Attacked...");
				var originalHealth = player.health;
				player.health += 25;
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				var playerHealthDelta = player.health - originalHealth;
				turn = 1
				encounterResult = "ATTACKED IN THE EMPTY " + dungeon[stage].roomName.toUpperCase()+ "\n\n" + player.name + " is awoken from their sleep to the sound of the former inhabitant of the " + dungeon[stage].roomName.toLowerCase()+ " returning, recovered " + playerHealthDelta + " health, beginning fight...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				attacked = true;
				turnStart(true);
			}
			else {
				console.log(getTimeStamp() + "Slept and Was Not Attacked...");
				var originalHealth = player.health;
				player.health += 50;
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				var playerHealthDelta = player.health - originalHealth;
				turn = 1
				wins += 1;
				room ++;
				encounterResult = "SLEPT IN THE EMPTY " + dungeon[stage].roomName.toUpperCase()+ "\n\n" + player.name + " awakens from their rest intact, recovered " + playerHealthDelta + " health, proceeding downwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 5:
			if (attackChance <= 0.25) {
				console.log(getTimeStamp() + "Rested and Was Attacked...");
				var originalHealth = player.health;
				player.health += 12;
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				var playerHealthDelta = player.health - originalHealth;
				turn = 1
				encounterResult = "ATTACKED IN THE EMPTY " + dungeon[stage].roomName.toUpperCase()+ "\n\n" + player.name + " is awoken from their rest to the sound of the former inhabitant of the " + dungeon[stage].roomName.toLowerCase()+ " returning, recovered " + playerHealthDelta + " health, beginning fight...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				attacked = true;
				turnStart(true);
			}
			else {
				console.log(getTimeStamp() + "Slept and Was Not Attacked...");
				var originalHealth = player.health;
				player.health += 25;
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				var playerHealthDelta = player.health - originalHealth;
				turn = 1
				wins += 1;
				room ++;
				encounterResult = "RESTED IN THE EMPTY " + dungeon[stage].roomName.toUpperCase()+ "\n\n" + player.name + " awakens from their rest intact, recovered " + playerHealthDelta + " health, proceeding downwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Ignored the Empty " + dungeon[stage].roomName.toLowerCase()+ "...");
			turn = 1
			wins += 1;
			room ++;
			encounterResult = "LEFT THE " + dungeon[stage].roomName.toUpperCase()+ "\n\n" + player.name + " decided the " + dungeon[stage].roomName.toLowerCase()+ " looked too good to be true, proceeding downwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 3:
			if (attackChance <= 0.75) {
				console.log(getTimeStamp() + "Searched for Loot and Was Attacked");
				turn = 1
				encounterResult = "ATTACKED IN THE EMPTY " + dungeon[stage].roomName.toUpperCase()+ "\n\n" + player.name + " clumsily knocks over a pile of bones, the cascading rattle recalling back the " + dungeon[stage].roomName.toLowerCase()+ "'s former inhabitant, beginning fight...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				attacked = true;
				turnStart(true);
			}
			else {
				console.log(getTimeStamp() + "Searched for Loot and Was Not Attacked");
				lootReward = generateLoot({});
				turnSummary = "FOUND LOOT IN THE EMPTY " + dungeon[stage].roomName.toUpperCase()+ "\n\nAmidst the bones of past Explorers and dungeon beasts, " + player.name + " finds a " + lootReward.name + "!\n\n"
				encounterType = 8;
				encounter(8);
			}
			break;
			
			case 4:
			case 0:
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "EMPTY " + dungeon[stage].roomName.toUpperCase()+ " ON " + getLocation() + "\n\nThis " + dungeon[stage].roomName.toLowerCase()+ " appears to be empty, however the floor around " + player.name + " is littered with bones. Nevertheless the " + dungeon[stage].roomName.toLowerCase()+ " provides the perfect opportunity to rest up, unless the former inhabitant comes back...\nCurrent Health: " + player.health + "/" + player.maxHealth + "\n\nCheck comments for available moves!";
			var comment = "Sleep and recover 50 health (Good chance of being attacked, if attacked will only recover 25 health) - [LIKE] \nRest and recover 25 health (Small chance of being attacked, if attacked will only recover 12 health) - [LOVE] \nSearch for loot (High chance of being attacked) - [HAHA] \nLeave the " + dungeon[stage].roomName.toLowerCase() + " and continue onward - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 8:
		switch (encounterChoice) {
			case 1:
			console.log(getTimeStamp() + "Left Reward...");
			encounterResult = "LEFT THE REWARD\n\n" + player.name + " decided the new piece of equipment would not be a good fit, proceeding ownwards...\n\n"
			if (currentMerchant.active) {
				switch (currentMerchant.type) {
					case 0:
					encounterType = 30
					encounter(30)
					break;
					
					case 1:
					encounterType = 35
					encounter(35)
					break;
					
					case 2:
					encounterType = 37
					encounter(37)
					break;
					
					case 3:
					encounterType = 39
					encounter(39)
					break;
					
					case 4:
					encounterType = 41
					encounter(41)
					break;
				}
				
			}
			else {
				turn = 1
				room ++;
				encounterOccured = false;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 5:
			console.log(getTimeStamp() + "Took Reward...");
			switch (lootReward.type) {
				case 0:
				
				player.storedItems.push(player.weapon);
				if (player.storedItems.length > player.storedItemsCapacity) {
					player.storedItems = player.storedItems.sort(compareValues('cost'));
					player.storedItems.shift();
				}
				
				if (player.weapon.twohanded) {
					player.offhand = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[Weapon - Unarmed - Requires One Hand]",modifications:1,tier:4,cost:0,wins:1,empty:true,durability:[0,0],imgID:{lootclass:"equipment",type:"none",variant:0}};
				}
				if (lootReward.twohanded) {
					player.offhand = {name:"Occupied By Weapon",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[Weapon - " + weaponTypes[lootReward.id] + " - Requires Two Hands]",modifications:1,tier:4,cost:0,wins:1,empty:true,durability:[0,0],imgID:{lootclass:"equipment",type:"none",variant:0}};
				}
				player.weapon = lootReward;
				player.moves[1] = moves[lootReward.id][1][player.movelevels[lootReward.id][1]];
				player.moves[2] = moves[lootReward.id][2][player.movelevels[lootReward.id][2]];
				player.moves[3] = moves[lootReward.id][3][player.movelevels[lootReward.id][3]];
				player.moves[4] = moves[lootReward.id][4][player.movelevels[lootReward.id][4]];
				player.moves[5] = moves[lootReward.id][5];
				
				if (lootReward.demonic) {
					player.healthCore -= lootReward.healthBonus;
				}
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				var playerClassMove = moves[5][player.playerClass][player.movelevels[5][player.playerClass]];
				if (player.weapon.id == playerClassMove.reqWeaponID) {
					if (player.weapon.twohanded && playerClassMove.reqTwoHanded) {
						player.moves[playerClassMove.slot] = playerClassMove;
					}
					else if (!player.weapon.twohanded && playerClassMove.reqOneHanded) {
						player.moves[playerClassMove.slot] = playerClassMove;
					}
					else if (!playerClassMove.reqTwoHanded && !playerClassMove.reqOneHanded) {
						player.moves[playerClassMove.slot] = playerClassMove;
					}
				}
				if (player.offhand.type == 1 && player.offhand.id == 4 && playerClassMove.reqShield) {
					player.moves[playerClassMove.slot] = playerClassMove;
				} 
				
				i = 0;
					while (i < player.learntMoves.length) {
						move = player.learntMoves[i];
						if (move.reqWeaponID) {
							if (move.reqWeaponID == player.weapon.id) {
								if (player.weapon.twohanded && move.reqTwoHanded) {
									player.moves[move.slot] = move;
								}
								else if (!player.weapon.twohanded && move.reqOneHanded) {
									player.moves[move.slot] = move;
								}
								else if (!move.reqTwoHanded && !move.reqOneHanded) {
									player.moves[move.slot] = move;
								}
							}
						}
						else if (player.offhand.type == 1 && player.offhand.id == 4 && move.reqShield) {
							player.moves[move.slot] = move;
						}
						else {
							player.moves[move.slot] = move;
						}
						i++;
					}
				
				if (player.weapon.moveAbility) {
					player.moves[player.weapon.moveAbility.slot] = player.weapon.moveAbility;
				}
				

				if (lootReward.demonic) {
					encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment and feels strangely bound to it, proceeding downwards...\n\n"
				}
				else {
					encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment, proceeding downwards...\n\n"
				}
				if (currentMerchant.active) {
					encounterType = 30
					encounter(30)
				}
				else {
					turn = 1
					room ++;
					encounterOccured = false;
					awaitChoice = false;
					turnStart(true);
				}
				break;
				
				case 1:
				switch (lootReward.id) {
					case 0:
					player.storedItems.push(player.head);
					if (player.storedItems.length > player.storedItemsCapacity) {
						player.storedItems = player.storedItems.sort(compareValues('cost'));
						player.storedItems.shift();
					}
					player.head = lootReward;
					break;
					
					case 1:
					player.storedItems.push(player.body);
					if (player.storedItems.length > player.storedItemsCapacity) {
						player.storedItems = player.storedItems.sort(compareValues('cost'));
						player.storedItems.shift();
					}
					player.body = lootReward;
					break;
					
					case 2:
					player.storedItems.push(player.arms);
					if (player.storedItems.length > player.storedItemsCapacity) {
						player.storedItems = player.storedItems.sort(compareValues('cost'));
						player.storedItems.shift();
					}
					player.arms = lootReward;
					break;
					
					case 3:
					player.storedItems.push(player.legs);
					if (player.storedItems.length > player.storedItemsCapacity) {
						player.storedItems = player.storedItems.sort(compareValues('cost'));
						player.storedItems.shift();
					}
					player.legs = lootReward;
					break;
					
					case 4:
					
					if (player.offhand.name != "Empty" || player.offhand.name != "Occupied By Weapon") {
						player.storedItems.push(player.offhand);
						if (player.storedItems.length > player.storedItemsCapacity) {
							player.storedItems = player.storedItems.sort(compareValues('cost'));
							player.storedItems.shift();
						}
					}
					
					player.offhand = lootReward;
					if (player.weapon.twohanded) {
					player.weapon = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[Weapon - Unarmed - Requires One Hand]",modifications:1,tier:4,empty:true};
					}
					var playerClassMove = moves[5][player.playerClass][Math.floor(Math.random() * moves[5][player.playerClass].length)];
					if (player.offhand.type == 1 && player.offhand.id == 4 && playerClassMove.reqShield) {
						player.moves[playerClassMove.slot] = playerClassMove;
					} 
					break
				}
				
				if (lootReward.demonic) {
					player.healthCore -= lootReward.healthBonus;
				}
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}

				if (lootReward.demonic) {
					encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment and feels strangely bound to it, proceeding downwards...\n\n"
				}
				else {
					encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment, proceeding downwards...\n\n"
				}
				if (currentMerchant.active) {
					encounterType = 30
					encounter(30)
				}
				else {
					turn = 1
					room ++;
					encounterOccured = false;
					awaitChoice = false;
					turnStart(true);
				}
				break;
				
				case 2:
				player.storedItems.push(player.relic);
				if (player.storedItems.length > player.storedItemsCapacity) {
					player.storedItems = player.storedItems.sort(compareValues('cost'));
					player.storedItems.shift();
				}
				player.health += (lootReward.healthBonus - player.relic.healthBonus);
				player.relic = lootReward;
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;

				encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment, proceeding downwards...\n\n"
				if (currentMerchant.active) {
					encounterType = 30
					encounter(30)
				}
				else {
					turn = 1
					room ++;
					encounterOccured = false;
					awaitChoice = false;
					turnStart(true);
				}
				break;
			}
			break;
			
			case 3:
			console.log(getTimeStamp() + "Took Reward (replacing offhand)...");
			if (!player.weapon.twohanded && !lootReward.twohanded && lootReward.type == 0) {
				if (player.offhand.name != "Empty" || player.offhand.name != "Occupied By Weapon") {
					player.storedItems.push(player.offhand);
					if (player.storedItems.length > player.storedItemsCapacity) {
						player.storedItems = player.storedItems.sort(compareValues('cost'));
						player.storedItems.shift();
					}
				}
				player.offhand = lootReward;
			
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}

				encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment, proceeding downwards...\n\n"
				if (currentMerchant.active) {
					switch (currentMerchant.type) {
						case 0:
						encounterType = 30
						encounter(30)
						break;
					
						case 1:
						encounterType = 35
						encounter(35)
						break;
						
						case 2:
						encounterType = 37
						encounter(37)
						break;
						
						case 3:
						encounterType = 39
						encounter(39)
						break;
					
						case 4:
						encounterType = 41
						encounter(41)
						break;
					}
				}
				else {
					turn = 1
					room ++;
					encounterOccured = false;
					awaitChoice = false;
					turnStart(true);
				}
			}
			else {
				var output = rewardResult;
				if (!lootReward.twohanded && !player.weapon.twohanded && lootReward.type == 0) {
					var comment = "Keep Current Equipment - [LIKE] \nReplace Current Equipment - [LOVE] \nReplace Current Offhand (" + player.offhand.name + ", " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - [HAHA])\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (scrapChance * 100)) + "% chance degrade your respective item) - [WOW]\n\nEQUIPMENT\nHead: " + player.head.name + " - " + player.head.defenseBonus + " Defense - " + player.head.modifications + " Modifications\nBody: " + player.body.name + " - " + player.body.defenseBonus + " Defense - " + player.body.modifications + " Modifications\nArms: " + player.arms.name + " - " + player.arms.defenseBonus + " Defense - " + player.arms.modifications + " Modifications\nLegs: " + player.legs.name + " - " + player.legs.defenseBonus + " Defense - " + player.legs.modifications + " Modifications\nWeapon: " + player.weapon.name + " - " + player.weapon.attackBonus + " Attack - " + player.weapon.modifications + " Modifications\nOffhand: " + player.offhand.name + " - " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - " + player.offhand.modifications + " Modifications\nRelic: " + player.relic.name + " - " + player.relic.healthBonus + " Additional Health - " + player.relic.modifications + " Modifications\nGold - " + runGold;	
				}
				else {
					var comment = "Keep Current Equipment - [LIKE] \nReplace Current Equipment - [LOVE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (scrapChance * 100)) + "% chance degrade your respective item) - [WOW]\n\nEQUIPMENT\nHead: " + player.head.name + " - " + player.head.defenseBonus + " Defense - " + player.head.modifications + " Modifications\nBody: " + player.body.name + " - " + player.body.defenseBonus + " Defense - " + player.body.modifications + " Modifications\nArms: " + player.arms.name + " - " + player.arms.defenseBonus + " Defense - " + player.arms.modifications + " Modifications\nLegs: " + player.legs.name + " - " + player.legs.defenseBonus + " Defense - " + player.legs.modifications + " Modifications\nWeapon: " + player.weapon.name + " - " + player.weapon.attackBonus + " Attack - " + player.weapon.modifications + " Modifications\nOffhand: " + player.offhand.name + " - " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - " + player.offhand.modifications + " Modifications\nRelic: " + player.relic.name + " - " + player.relic.healthBonus + " Additional Health - " + player.relic.modifications + " Modifications\nGold - " + runGold;
				}
				retryEncounter(output,comment);
			}
			break;
			
			case 4:
			if (lootReward.type == 0) {
				encounterType = 28;
				encounter(28);
			}
			else if (Math.random() < scrapChance) {
				console.log(getTimeStamp() + "Reward Scrap Successful...");
				var improveAmount = 1;
				switch (lootReward.type) {
				
				case 1:
				switch (lootReward.id) {
					case 0:
					if (lootReward.tier > 4) {
						improveAmount ++;
					}
					if (lootReward.tier == 7) {
						improveAmount ++;
					}
					player.head.defenseBonus += improveAmount;
					
					if (player.head.tier < 10) {
						if (Math.random() < (1 - scrapChance) / (11 - player.head.tier)) {
							player.head.tier++;
							player.head.identifier = "[" + tierList[player.head.tier] + " Tier" + player.head.identifier.split("Tier")[1];
							var tierImprove = true;
						}
					}
					
					player.head.modifications ++;
					player.head.cost = Math.floor(player.head.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.head.wins ** 2 / 100) + 1) * (2 / player.head.modifications) * ((player.head.tier ** 2) / 16));
					break;
					
					case 1:
					if (lootReward.tier > 4) {
						improveAmount ++;
					}
					if (lootReward.tier == 7) {
						improveAmount ++;
					}
					player.body.defenseBonus += improveAmount;
					
					if (player.body.tier < 10) {
						if (Math.random() < (1 - scrapChance) / (11 - player.body.tier)) {
							player.body.tier++;
							player.body.identifier = "[" + tierList[player.body.tier] + " Tier" + player.body.identifier.split("Tier")[1];
							var tierImprove = true;
						}
					}
					
					player.body.modifications ++;
					player.body.cost = Math.floor(player.body.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.body.wins ** 2 / 100) + 1) * (2 / player.body.modifications) * ((player.body.tier ** 2) / 16));
					break;
					
					case 2:
					if (lootReward.tier > 4) {
						improveAmount ++;
					}
					if (lootReward.tier == 7) {
						improveAmount ++;
					}
					player.arms.defenseBonus += improveAmount;
					
					if (player.arms.tier < 10) {
						if (Math.random() < (1 - scrapChance) / (11 - player.arms.tier)) {
							player.arms.tier++;
							player.arms.identifier = "[" + tierList[player.arms.tier] + " Tier" + player.arms.identifier.split("Tier")[1];
							var tierImprove = true;
						}
					}
					
					player.arms.modifications ++;
					player.arms.cost = Math.floor(player.arms.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.arms.wins ** 2 / 100) + 1) * (2 / player.arms.modifications) * ((player.arms.tier ** 2) / 16));
					break;
					
					case 3:
					if (lootReward.tier > 4) {
						improveAmount ++;
					}
					if (lootReward.tier == 7) {
						improveAmount ++;
					}
					player.legs.defenseBonus += improveAmount;
					
					if (player.legs.tier < 10) {
						if (Math.random() < (1 - scrapChance) / (11 - player.legs.tier)) {
							player.legs.tier++;
							player.legs.identifier = "[" + tierList[player.legs.tier] + " Tier" + player.legs.identifier.split("Tier")[1];
							var tierImprove = true;
						}
					}
					
					player.legs.modifications ++;
					player.legs.cost = Math.floor(player.legs.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.legs.wins ** 2 / 100) + 1) * (2 / player.legs.modifications) * ((player.legs.tier ** 2) / 16));
					break;
					
					case 4:
					if (player.offhand.id == 4 && player.offhand.type == 1) {
						if (lootReward.tier > 4) {
							improveAmount ++;
						}
						if (lootReward.tier == 7) {
							improveAmount ++;
						}
						player.offhand.defenseBonus += improveAmount
						
						if (player.offhand.tier < 10) {
						if (Math.random() < (1 - scrapChance) / (11 - player.offhand.tier)) {
							player.offhand.tier++;
							player.offhand.identifier = "[" + tierList[player.offhand.tier] + " Tier" + player.offhand.identifier.split("Tier")[1];
							var tierImprove = true;
						}
					}
						
						player.offhand.modifications ++;
						player.offhand.cost = Math.floor(player.offhand.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
					}
					else {
						if (lootReward.tier > 4) {
							improveAmount ++;
						}
						if (lootReward.tier == 7) {
							improveAmount ++;
						}
						player.body.defenseBonus += improveAmount;
						
						if (player.body.tier < 10) {
							if (Math.random() < (1 - scrapChance) / (11 - player.body.tier)) {
								player.body.tier++;
								player.body.identifier = "[" + tierList[player.body.tier] + " Tier" + player.body.identifier.split("Tier")[1];
								var tierImprove = true;
							}
						}
						
						player.body.modifications ++;
						player.body.cost = Math.floor(player.body.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.body.wins ** 2 / 100) + 1) * (2 / player.body.modifications) * ((player.body.tier ** 2) / 16));
					}
					break
				}
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;

				encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to enhance their armour (+" + improveAmount + " Defense), proceeding onwards...\n\n"
				if (tierImprove) {
					encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to significantly enhance their armour (+" + improveAmount + " Defense, +1 Tier), proceeding onwards...\n\n"	
				}
				if (currentMerchant.active) {
					switch (currentMerchant.type) {
						case 0:
						encounterType = 30
						encounter(30)
						break;
						
						case 1:
						encounterType = 35
						encounter(35)
						break;
						
						case 2:
						encounterType = 37
						encounter(37)
						break;
						
						case 3:
						encounterType = 39
						encounter(39)
						break;
					
						case 4:
						encounterType = 41
						encounter(41)
						break;
					}
				}
				else {
					turn = 1
					room ++;
					encounterOccured = false;
					awaitChoice = false;
					turnStart(true);
				}
				break;
				
				case 2:
				improveAmount = 3;
				if (lootReward.tier > 4) {
					improveAmount += 3;
				}
				if (lootReward.tier == 7) {
					improveAmount += 3;
				}
				player.health += improveAmount;
				player.relic.healthBonus += improveAmount;
				
				if (player.relic.tier < 10) {
					if (Math.random() < (1 - scrapChance) / (11 - player.relic.tier)) {
						player.relic.tier++;
						player.relic.identifier = "[" + tierList[player.relic.tier] + " Tier" + player.relic.identifier.split("Tier")[1];
						var tierImprove = true;
					}
				}
				
				player.relic.modifications ++;
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				player.relic.cost = Math.floor(player.relic.healthBonus * ((0.5 + 1) ** 1.4) * ((player.relic.wins ** 2 / 100) + 1) * (2 / player.relic.modifications) * ((player.relic.tier ** 2) / 16));

				encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to enhance their relic (+" + improveAmount + " Health/Max Health), proceeding onwards...\n\n"
				if (tierImprove) {
					encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to significantly enhance their relic (+" + improveAmount + " Health/Max Health, +1 Tier), proceeding onwards...\n\n"
				}
				if (currentMerchant.active) {
					encounterType = 30
					encounter(30)
				}
				else {
					turn = 1
					room ++;
					encounterOccured = false;
					awaitChoice = false;
					turnStart(true);
				}
				break;
				}
			}
			else {
				console.log(getTimeStamp() + "Reward Scrap Failed...");
				switch (lootReward.type) {
				
				case 1:
				switch (lootReward.id) {
					case 0:
					var degradeAmount = 1;
					if (lootReward.tier < 4) {
						degradeAmount ++;
					}
					if (lootReward.tier <= 1) {
						degradeAmount ++;
					}
					player.head.defenseBonus -= degradeAmount;
					
					if (player.head.tier > 0) {
						if (Math.random() < (1 - scrapChance) / player.head.tier) {
							player.head.tier--;
							player.head.identifier = "[" + tierList[player.head.tier] + " Tier" + player.head.identifier.split("Tier")[1];
							var tierDegrade = true;
						}
					}
					
					player.head.modifications ++;
					player.head.cost = Math.floor(player.head.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.head.wins ** 2 / 100) + 1) * (2 / player.head.modifications) * ((player.head.tier ** 2) / 16));
					break;
					
					case 1:
					var degradeAmount = 1;
					if (lootReward.tier < 4) {
						degradeAmount ++;
					}
					if (lootReward.tier <= 1) {
						degradeAmount ++;
					}
					player.body.defenseBonus -= degradeAmount;
					
					if (player.body.tier > 0) {
						if (Math.random() < (1 - scrapChance) / player.body.tier) {
							player.body.tier--;
							player.body.identifier = "[" + tierList[player.body.tier] + " Tier" + player.body.identifier.split("Tier")[1];
							var tierDegrade = true;
						}
					}
					
					player.body.modifications ++;
					player.body.cost = Math.floor(player.body.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.body.wins ** 2 / 100) + 1) * (2 / player.body.modifications) * ((player.body.tier ** 2) / 16));
					break;
					
					case 2:
					var degradeAmount = 1;
					if (lootReward.tier < 4) {
						degradeAmount ++;
					}
					if (lootReward.tier <= 1) {
						degradeAmount ++;
					}
					player.arms.defenseBonus -= degradeAmount;
					
					if (player.arms.tier > 0) {
						if (Math.random() < (1 - scrapChance) / player.arms.tier) {
							player.arms.tier--;
							player.arms.identifier = "[" + tierList[player.arms.tier] + " Tier" + player.arms.identifier.split("Tier")[1];
							var tierDegrade = true;
						}
					}
					
					player.arms.modifications ++;
					player.arms.cost = Math.floor(player.arms.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.arms.wins ** 2 / 100) + 1) * (2 / player.arms.modifications) * ((player.arms.tier ** 2) / 16));
					break;
					
					case 3:
					var degradeAmount = 1;
					if (lootReward.tier < 4) {
						degradeAmount ++;
					}
					if (lootReward.tier <= 1) {
						degradeAmount ++;
					}
					player.legs.defenseBonus -= degradeAmount;
					
					if (player.legs.tier > 0) {
						if (Math.random() < (1 - scrapChance) / player.legs.tier) {
							player.legs.tier--;
							player.legs.identifier = "[" + tierList[player.legs.tier] + " Tier" + player.legs.identifier.split("Tier")[1];
							var tierDegrade = true;
						}
					}
					
					player.legs.modifications ++;
					player.legs.cost = Math.floor(player.legs.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.legs.wins ** 2 / 100) + 1) * (2 / player.legs.modifications) * ((player.legs.tier ** 2) / 16));
					break;
					
					case 4:
					if (player.offhand.id == 4 && player.offhand.type == 1) {
						var degradeAmount = 1;
						if (lootReward.tier < 4) {
							degradeAmount ++;
						}
						if (lootReward.tier <= 1) {
							degradeAmount ++;
						}
						player.offhand.defenseBonus -= degradeAmount;
					
						if (player.offhand.tier > 0) {
							if (Math.random() < (1 - scrapChance) / player.offhand.tier) {
								player.offhand.tier--;
								player.offhand.identifier = "[" + tierList[player.offhand.tier] + " Tier" + player.offhand.identifier.split("Tier")[1];
								var tierDegrade = true;
							}
						}
						
						player.offhand.modifications ++;
						player.offhand.cost = Math.floor(player.offhand.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
					}
					else {
						var degradeAmount = 1;
						if (lootReward.tier < 4) {
							degradeAmount ++;
						}
						if (lootReward.tier <= 1) {
							degradeAmount ++;
						}
						player.body.defenseBonus -= degradeAmount;
					
						if (player.body.tier > 0) {
							if (Math.random() < (1 - scrapChance) / player.body.tier) {
								player.body.tier--;
								player.body.identifier = "[" + tierList[player.body.tier] + " Tier" + player.body.identifier.split("Tier")[1];
								var tierDegrade = true;
							}
						}
						
						player.body.modifications ++;
						player.body.cost = Math.floor(player.body.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.body.wins ** 2 / 100) + 1) * (2 / player.body.modifications) * ((player.body.tier ** 2) / 16));
					}
					break
				}
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;

				encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their armour using the reward but fails, damaging their own armour (-" + degradeAmount + " Defense), proceeding onwards...\n\n"
				if (tierDegrade) {
					encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their armour using the reward but critically fails, severely damaging their own armour (-" + degradeAmount + " Defense, -1 Tier), proceeding onwards...\n\n"	
				}
				if (currentMerchant.active) {
					switch (currentMerchant.type) {
						case 0:
						encounterType = 30
						encounter(30)
						break;
					
						case 1:
						encounterType = 35
						encounter(35)
						break;
						
						case 2:
						encounterType = 37
						encounter(37)
						break;
						
						case 3:
						encounterType = 39
						encounter(39)
						break;
					
						case 4:
						encounterType = 41
						encounter(41)
						break;
					}
				}
				else {
					turn = 1
					room ++;
					encounterOccured = false;
					awaitChoice = false;
					turnStart(true);
				}
				break;
				
				case 2:
				var degradeAmount = 3;
				if (lootReward.tier < 4) {
					degradeAmount -= 3;
				}
				if (lootReward.tier <= 1) {
					degradeAmount -= 3;
				}
				player.health -= degradeAmount;
				player.relic.healthBonus -= degradeAmount;
				
				if (player.relic.tier > 0) {
					if (Math.random() < (1 - scrapChance) / player.relic.tier) {
						player.relic.tier--;
						player.relic.identifier = "[" + tierList[player.relic.tier] + " Tier" + player.relic.identifier.split("Tier")[1];
						if (player.relic.tier == 0) {
							player.health -= player.relic.healthBonus;
							player.relic.healthBonus = 0;
						}
						var tierDegrade = true;
					}
				}
				
				player.relic.modifications ++;
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				player.relic.cost = Math.floor(player.relic.healthBonus * ((0.5 + 1) ** 1.4) * ((player.relic.wins ** 2 / 100) + 1) * (2 / player.relic.modifications) * ((player.relic.tier ** 2) / 16));

				encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their relic using the reward but fails, damaging their own relic (-" + degradeAmount + " Health/Max Health), proceeding onwards...\n\n"
				if (tierDegrade) {
					encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their relic using the reward but critically fails, severely damaging their own relic (-" + degradeAmount + " Health/Max Health, -1 Tier), proceeding onwards...\n\n"
				}
				if (currentMerchant.active) {
					encounterType = 30
					encounter(30)
				}
				else {
					turn = 1
					room ++;
					encounterOccured = false;
					awaitChoice = false;
					turnStart(true);
				}
				break;
				}
			}
			break;
			
			case 2:
			console.log(getTimeStamp() + "Took Reward, (replacing secondary)...");
			if (lootReward.type == 0 || (lootReward.type == 1 && lootReward.id == 4)) {
				switch (lootReward.type) {
					case 0:
					
					if (player.secondaryWeapon.name != "Empty") {
						player.storedItems.push(player.secondaryWeapon);
						if (player.storedItems.length > player.storedItemsCapacity) {
							player.storedItems = player.storedItems.sort(compareValues('cost'));
							player.storedItems.shift();
						}
					}
					
					if (player.secondaryWeapon.twohanded) {
						player.secondaryOffhand = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[Weapon - Unarmed - Requires One Hand]",modifications:1,tier:4,empty:true,durability:[0,0],imgID:{lootclass:"equipment",type:"none",variant:0}};
					}
					if (lootReward.twohanded) {
						player.secondaryOffhand = {name:"Occupied By Weapon",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[Weapon - " + weaponTypes[lootReward.id] + " - Requires Two Hands]",modifications:1,tier:4,empty:true,durability:[0,0],imgID:{lootclass:"equipment",type:"none",variant:0}};
					}
					player.secondaryWeapon = lootReward;
					if (lootReward.demonic) {
						player.healthCore -= lootReward.healthBonus;
					}
					player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
					if (player.health > player.maxHealth) {
						player.health = player.maxHealth;
					}
					if (lootReward.demonic) {
						encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment and feels strangely bound to it, proceeding downwards...\n\n"
					}
					else {
						encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment, proceeding downwards...\n\n"
					}
					if (currentMerchant.active) {
						switch (currentMerchant.type) {
							case 0:
							encounterType = 30
							encounter(30)
							break;
					
							case 1:
							encounterType = 35
							encounter(35)
							break;
							
							case 2:
							encounterType = 37
							encounter(37)
							break;
							
							case 3:
							encounterType = 39
							encounter(39)
							break;
					
							case 4:
							encounterType = 41
							encounter(41)
							break;
						}
					}
					else {
						turn = 1
						room ++;
						encounterOccured = false;
						awaitChoice = false;
						turnStart(true,true);
					}
					break;
					
					case 1:
					if (player.secondaryOffhand.name != "Empty" || player.secondaryOffhand.name != "Occupied By Weapon") {
						player.storedItems.push(player.secondaryOffhand);
						if (player.storedItems.length > player.storedItemsCapacity) {
							player.storedItems = player.storedItems.sort(compareValues('cost'));
							player.storedItems.shift();
						}
					}
					
					player.secondaryOffhand = lootReward;
					if (player.secondaryWeapon.twohanded) {
					player.secondaryWeapon = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[Weapon - Unarmed - Requires One Hand]",modifications:1,tier:4,empty:true,durability:[0,0]};
					}
					if (lootReward.demonic) {
						player.healthCore -= lootReward.healthBonus;
					}
					player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
					if (player.health > player.maxHealth) {
						player.health = player.maxHealth;
					}
					if (lootReward.demonic) {
						encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment and feels strangely bound to it, proceeding downwards...\n\n"
					}
					else {
						encounterResult = "TOOK THE REWARD\n\n" + player.name + " takes the new piece of equipment, proceeding downwards...\n\n"
					}
					if (currentMerchant.active) {
						switch (currentMerchant.type) {
							case 0:
							encounterType = 30
							encounter(30)
							break;
					
							case 1:
							encounterType = 35
							encounter(35)
							break;
							
							case 2:
							encounterType = 37
							encounter(37)
							break;
							
							case 3:
							encounterType = 39
							encounter(39)
							break;
					
							case 4:
							encounterType = 41
							encounter(41)
							break;
						}
					}
					else {
						turn = 1
						room ++;
						encounterOccured = false;
						awaitChoice = false;
						turnStart(true,true);
					}
					break;
				}
			}
			else {
				var output = rewardResult;
				if (!lootReward.twohanded && !player.weapon.twohanded && lootReward.type == 0) {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE] \nReplace Current Offhand (" + player.offhand.name + ", " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - [HAHA])\nReplace Current Secondary Equipment - [LIKE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (scrapChance * 100)) + "% chance degrade your respective item) - [WOW]\n\nEQUIPMENT\nHead: " + player.head.name + " - " + player.head.defenseBonus + " Defense - " + player.head.modifications + " Modifications\nBody: " + player.body.name + " - " + player.body.defenseBonus + " Defense - " + player.body.modifications + " Modifications\nArms: " + player.arms.name + " - " + player.arms.defenseBonus + " Defense - " + player.arms.modifications + " Modifications\nLegs: " + player.legs.name + " - " + player.legs.defenseBonus + " Defense - " + player.legs.modifications + " Modifications\nWeapon: " + player.weapon.name + " - " + player.weapon.attackBonus + " Attack - " + player.weapon.modifications + " Modifications\nOffhand: " + player.offhand.name + " - " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - " + player.offhand.modifications + " Modifications\nRelic: " + player.relic.name + " - " + player.relic.healthBonus + " Additional Health - " + player.relic.modifications + " Modifications\nGold - " + runGold;	
				}
				else {
					var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nReplace Current Secondary Equipment - [LIKE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (scrapChance * 100)) + "% chance degrade your respective item) - [WOW]\n\nEQUIPMENT\nHead: " + player.head.name + " - " + player.head.defenseBonus + " Defense - " + player.head.modifications + " Modifications\nBody: " + player.body.name + " - " + player.body.defenseBonus + " Defense - " + player.body.modifications + " Modifications\nArms: " + player.arms.name + " - " + player.arms.defenseBonus + " Defense - " + player.arms.modifications + " Modifications\nLegs: " + player.legs.name + " - " + player.legs.defenseBonus + " Defense - " + player.legs.modifications + " Modifications\nWeapon: " + player.weapon.name + " - " + player.weapon.attackBonus + " Attack - " + player.weapon.modifications + " Modifications\nOffhand: " + player.offhand.name + " - " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - " + player.offhand.modifications + " Modifications\nRelic: " + player.relic.name + " - " + player.relic.healthBonus + " Additional Health - " + player.relic.modifications + " Modifications\nGold - " + runGold;
				}
				retryEncounter(output,comment);
			}
			break;
			
			case 6:
			console.log(getTimeStamp() + "Took Reward to sell...");
			player.storedItems.push(lootReward);
			if (player.storedItems.length > player.storedItemsCapacity) {
				player.storedItems = player.storedItems.sort(compareValues('cost'));
				encounterResult = "TOOK THE REWARD TO SELL\n\n" + player.name + " takes the reward to sell later should they find a Merchant, discarding their " + player.storedItems[0].name + " (approx worth " + Math.floor(player.storedItems[0].cost / 2) + " gold) to make space, proceeding onwards...\n\n"
				player.storedItems.shift();
			}
			else {
				encounterResult = "TOOK THE REWARD TO SELL\n\n" + player.name + " takes the reward, placing it into their pack to sell later should they find a Merchant, proceeding onwards...\n\n"
			}
			if (currentMerchant.active) {
				switch (currentMerchant.type) {
					case 0:
					encounterType = 30
					encounter(30)
					break;
					
					case 1:
					encounterType = 35
					encounter(35)
					break;
					
					case 2:
					encounterType = 37
					encounter(37)
					break;
					
					case 3:
					encounterType = 39
					encounter(39)
					break;
					
					case 4:
					encounterType = 41
					encounter(41)
					break;
				}
			}
			else {
				turn = 1
				room ++;
				encounterOccured = false;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 0:
			var output = rewardResult;
			if (!lootReward.twohanded && !player.weapon.twohanded && lootReward.type == 0) {
				var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE] \nReplace Current Offhand (" + player.offhand.name + ", " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - [HAHA])\nReplace Current Secondary Equipment - [LIKE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (scrapChance * 100)) + "% chance degrade your respective item) - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();	
			}
			else if (lootReward.type == 0 || (lootReward.type == 1 && lootReward.id == 4)) {
				var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nReplace Current Secondary Equipment - [LIKE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (100 * scrapChance)) + "% chance degrade your respective item) - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();
			}
			else {
				var comment = "Keep Current Equipment - [ANGRY] \nReplace Current Equipment - [LOVE]\nScrap the Loot (" + (scrapChance * 100) + "% chance improve your respective item, " + Math.floor(100 - (scrapChance * 100)) + "% chance degrade your respective item) - [WOW]\nKeep the Loot to Sell (approx value = " + Math.floor(lootReward.cost / 2) + " Gold) - [SAD]\n\n" + getPlayerInfo();
			}
			retryEncounter(output,comment);
			break;
		}
		break;
		
		case 9:
		switch (encounterChoice) {
			case 5:
			case 0:
			var output = "DUNGEON EXPLORER ON " + getLocation() + "\n\nAs " + player.name + " enters this " + dungeon[stage].roomName.toLowerCase() + " they notice another Dungeon Explorer has already slain the enemy and now holds the reward in their hands, a " + lootReward.name + " (" + lootReward.identifier + ", +" + lootReward.attackBonus + " Attack, +" + lootReward.defenseBonus + " Defense, +" + lootReward.healthBonus + " Health/Max Health), perhaps they would be open to some sort of trade for the item, or maybe some other action would suffice...\n\nCheck comments for available moves!";
			var comment = "Attempt to purchase the " + lootReward.name + " from the Explorer - [LIKE]\nAttempt to take the " + lootReward.name + " from the Explorer - [ANGRY]\nDiscuss combat techniques with the Explorer - [WOW]\nLeave the Explorer be - [HAHA]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
			
			case 1:
			//fight
			enemy = generatePlayerEnemy();
			enemy.head = shopItem(1,2,0);
			enemy.body = shopItem(1,2,1);
			enemy.arms = shopItem(1,2,2);
			enemy.legs = shopItem(1,2,3);
			enemy.weapon = shopItem(1,1,enemy.weapon.id);
			if (enemy.weapon.twohanded) {
				enemy.offhand = {name:"Occupied By Weapon",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[Weapon - " + weaponTypes[enemy.weapon.id] + " - Requires Two Hands]",modifications:1,tier:4,cost:0,wins:1,empty:true,durability:[0,0],imgID:{lootclass:"equipment",type:"none",variant:0}};
			}
			else {
				if (enemy.classIDPlayer == 2 || (Math.random() > 0.5 && enemy.classIDPlayer != 1)) {
					enemy.offhand = shopItem(1,2,4);
				}
				else {
					enemy.offhand = shopItem(1,1,enemy.weapon.id);
				}
			}
			
			enemy.maxHealth = enemy.healthCore + enemy.head.healthBonus + enemy.body.healthBonus + enemy.arms.healthBonus + enemy.legs.healthBonus + enemy.relic.healthBonus + enemy.weapon.healthBonus + enemy.offhand.healthBonus;
			enemy.attack = enemy.attackCore + enemy.head.attackBonus + enemy.body.attackBonus + enemy.arms.attackBonus + enemy.legs.attackBonus + enemy.relic.attackBonus + enemy.weapon.attackBonus + enemy.offhand.attackBonus;
			enemy.defense = enemy.defenseCore + enemy.head.defenseBonus + enemy.body.defenseBonus + enemy.arms.defenseBonus + enemy.legs.defenseBonus + enemy.relic.defenseBonus + enemy.weapon.defenseBonus + enemy.offhand.defenseBonus;
			
			enemy.health = enemy.maxHealth;
			
			turn = 1
			encounterResult = "ATTACKED THE EXPLORER\n\n" + player.name + " sees an opportunity to take the " + lootReward.name + " from the Explorer by force, beginning fight...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			attacked = true;
			turnStart(true);
			break;
			
			case 2:
			//buy
			var Cost = lootReward.cost;
			if (runGold >= lootReward.cost) {
				runGold -= lootReward.cost;
				turnSummary = "PURCHASED ITEM\n\nAfter some haggling the Explorer accepts " + player.name + "'s offer, Purchased " + lootReward.name + "\n-" + Cost + " Gold!\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				turn = 1
				room ++;
				encounterResult = "NOT ENOUGH GOLD\n\nDespite " + player.name + "'s fair offer and excellent bargaining skills, they were still turned away by the Explorer due to their lack of gold\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 4:
			enemy = generatePlayerEnemy();
			if (Math.random() < 0.25) {
				learnMove = classMoves[enemy.classIDPlayer];
				encounterResult = "SHARED MOVES WITH THE EXPLORER\n\n" + player.name + " discusses combat techniques with " + enemy.name + "...\n\n";
				enemy.health = -1;
				encounterType = 20;
				encounter(20);	
			}
			else {
				enemy.health = -1;
				turn = 1
				room ++;
				encounterResult = "COULD NOT SHARE MOVES WITH THE EXPLORER\n\n" + player.name + " attempts to discuss combat techniques with " + enemy.name + ", but the Explorer was unwilling to share their knowledge, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);	
			}
			break;
			
			case 3:
			//leave
			turn = 1
			room ++;
			encounterResult = "LEFT THE EXPLORER\n\n" + player.name + " decides the leave the Explorer and the " + lootReward.name + " be, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
		}
		break;
		
		case 10:
		switch(encounterChoice) {
			case 3:
			case 4:
			case 2:
			case 0:
			var output = "FALLEN HERO SHRINE ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find nothing but the shrine of a former dungeon Explorer, " + fallenHero.name + ". " + player.name + " could pay their respects to their fellow Explorer, although the Explorer in question would have no use for their equipment anymore...\n\nCheck comments for available moves!";
			var comment = "Pay your respects to the " + fallenHero.name + " - [LIKE]\nAttempt to loot " + fallenHero.name + "'s Shrine - [ANGRY]" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
			
			case 1:
			var chance = Math.random();
			console.log(chance);
			if (chance < 0.25) {
				//loot shrine and no loot
				turn = 1
				room ++;
				encounterResult = "FOUND NOTHING WITHIN THE SHRINE\n\n" + player.name + " cracks open " + fallenHero.name + "'s Shrine, finding little but rags and rusted metal. Leaving behind the useless junk, " + player.name + " proceeds onwards...\n\n";
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else if (chance < 0.75) {
				//loot shrine and gain loot and gain curse
				player.healthCore = Math.floor(player.healthCore * 0.9);
				player.health = Math.floor(player.health * 0.9);
				player.attackCore = Math.floor(player.attackCore * 0.9);
				player.defenseCore = Math.floor(player.defenseCore * 0.9);
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				if (!fallenHero.ranReward) {
					var lootClass = Math.floor(Math.random() * 3);
						switch (lootClass) {
							case 0:
							lootReward = fallenHero.weapon;
							lootReward.name = fallenHero.firstName + "'s " + lootReward.name;
							
							if (!lootReward.tier) {
								lootReward.tier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
							}
							if (lootReward.twohanded) {
								lootReward.identifier = "[" + tierList[lootReward.tier] + " Tier Weapon - " + weaponTypes[lootReward.type] + " - Requires Two Hands]";
							}
							else {
								lootReward.identifier = "[" + tierList[lootReward.tier] + " Tier Weapon - " + weaponTypes[lootReward.type] + " - Requires One Hand]";
							}
							if (!lootReward.modifications) {
								lootReward.modifications = Math.floor(Math.random() * 3 + 2);
							}
							if (!lootReward.cost) {
								lootReward.cost = Math.floor(lootReward.defenseBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / lootReward.modifications) * ((lootReward.tier ** 2) / 16));
							}
							
							var reward = lootReward;
							break;
						
							case 1:
							var armourType = Math.floor(Math.random() * 4);
							switch (armourType) {
								case 0:
								lootReward = fallenHero.head;
								lootReward.name = fallenHero.firstName + "'s " + lootReward.name;
								
								if (!lootReward.tier) {
									lootReward.tier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
								}
								
								lootReward.identifier = "[" + tierList[lootReward.tier] + " Tier Armour - Head]";
								
								if (!lootReward.modifications) {
									lootReward.modifications = Math.floor(Math.random() * 3 + 2);
								}
								if (!lootReward.cost) {
									lootReward.cost = Math.floor(lootReward.defenseBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / lootReward.modifications) * ((lootReward.tier ** 2) / 16));
								}
								
								var reward = lootReward;
								break;
							
								case 1:
								lootReward = fallenHero.body;
								lootReward.name = fallenHero.firstName + "'s " + lootReward.name;
								
								if (!lootReward.tier) {
									lootReward.tier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
								}
								
								lootReward.identifier = "[" + tierList[lootReward.tier] + " Tier Armour - Body]";
								
								if (!lootReward.modifications) {
									lootReward.modifications = Math.floor(Math.random() * 3 + 2);
								}
								if (!lootReward.cost) {
									lootReward.cost = Math.floor(lootReward.defenseBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / lootReward.modifications) * ((lootReward.tier ** 2) / 16));
								}
								
								var reward = lootReward;
								break;
							
								case 2:
								lootReward = fallenHero.arms;
								lootReward.name = fallenHero.firstName + "'s " + lootReward.name;
								
								if (!lootReward.tier) {
									lootReward.tier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
								}
								if (!lootReward.identifier) {
									lootReward.identifier = "[" + tierList[lootReward.tier] + " Tier Armour - Arms]"
								}
								if (!lootReward.modifications) {
									lootReward.modifications = Math.floor(Math.random() * 3 + 2);
								}
								if (!lootReward.cost) {
									lootReward.cost = Math.floor(lootReward.defenseBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / lootReward.modifications) * ((lootReward.tier ** 2) / 16));
								}
								
								var reward = lootReward;
								break;
							
								case 3:
								lootReward = fallenHero.legs;
								lootReward.name = fallenHero.firstName + "'s " + lootReward.name;
								
								if (!lootReward.tier) {
									lootReward.tier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
								}
								if (!lootReward.identifier) {
									lootReward.identifier = "[" + tierList[lootReward.tier] + " Tier Armour - Legs]"
								}
								if (!lootReward.modifications) {
									lootReward.modifications = Math.floor(Math.random() * 3 + 2);
								}
								if (!lootReward.cost) {
									lootReward.cost = Math.floor(lootReward.defenseBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / lootReward.modifications) * ((lootReward.tier ** 2) / 16));
								}
								
								var reward = lootReward;
								break;
							}
							break;
							
							case 2:
							lootReward = fallenHero.relic;
							lootReward.name = fallenHero.firstName + "'s " + lootReward.name;
							if (!lootReward.tier) {
								lootReward.tier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
							}
							if (!lootReward.identifier) {
								lootReward.identifier = "[" + tierList[lootReward.tier] + " Tier Relic]"
							}
							if (!lootReward.modifications) {
								lootReward.modifications = Math.floor(Math.random() * 3 + 2);
							}
							if (!lootReward.cost) {
								lootReward.cost = Math.floor(lootReward.healthBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / lootReward.modifications) * ((lootReward.tier ** 2) / 16));
							}
							var reward = lootReward;
							break;
						}
					}
					else {
						lootReward = generateLoot({});
						lootReward.name = fallenHero.firstName + "'s " + lootReward.name;
						var reward = lootReward;
					}
				awaitChoice = true;
				turnSummary = "LOOTED THE SHRINE\n\n" + player.name + " cracks open " + fallenHero.name + "'s Shrine, and within they find " + lootReward.name + ", a cold chill runs through " + player.name + "'s body (Desecrator's Curse [-10% to all Core Stats])...\n\n"
				encounterType = 8;
				encounter(8);
			}
			else {
				//loot shrine and gain curse and fallen fight
				player.healthCore = Math.floor(player.healthCore * 0.9);
				player.health = Math.floor(player.health * 0.9);
				player.attackCore = Math.floor(player.attackCore * 0.9);
				player.defenseCore = Math.floor(player.defenseCore * 0.9);
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				enemy = fallenHero;
				console.log(enemy.health);
				turn = 1
				encounterResult = enemy.name.toUpperCase() + " AWAKENS\n\n" + player.name + " cracks open " + enemy.name + "'s Shrine, but to their surprise they find the fallen hero within, reanimated and furious, a cold wave washes over " + player.name + " (Desecrator's Curse [-10% to all Core Stats]), and the fight begins...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				attacked = true;
				turnStart(true);
			}
			break;
			
			case 5:
			var chance = Math.random();
			console.log(chance);
			if (chance < 0.15) {
				//pay respects and be healed
				var originalHealth = player.health;
				player.health = player.maxHealth;
				var playerHealthDelta = player.health - originalHealth;
				turn = 1
				wins += 1;
				room ++;
				encounterResult = "PAYED RESPECTS TO " + fallenHero.name.toUpperCase() + " AND WAS HEALED\n\n" + player.name + " closes their eyes and lays a hand on " + fallenHero.name + "'s Shrine, standing in silence for a few moments. Opening their eyes, " + player.name + " realizes that all of their previous wounds have miraculously healed over, perhaps the spirit of " + fallenHero.name + " is watching over (Recovered " + playerHealthDelta + " health), proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else if (chance < 0.3) {
				//pay respects and gain blessing
				player.healthCore = Math.floor((player.healthCore * 1.1) + 0.5);
				player.attackCore = Math.floor((player.attackCore * 1.1) + 0.5);
				player.defenseCore = Math.floor((player.defenseCore * 1.1) + 0.5);
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;

				turn = 1
				wins += 1;
				room ++;
				encounterResult = "PAYED RESPECTS TO " + fallenHero.name.toUpperCase() + " AND WAS BLESSED\n\n" + player.name + " closes their eyes and lays a hand on " + fallenHero.name + "'s Shrine, standing in silence for a few moments. As " + player.name + " opens their eyes, they feel revitalized and empowered (Hero's Blessing [+10% to all Core Stats]), perhaps the spirit of " + fallenHero.name + " is watching over, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				//pay respects and nothing happens
				turn = 1
				wins += 1;
				room ++;
				encounterResult = "PAYED RESPECTS TO " + fallenHero.name.toUpperCase() + "\n\n" + player.name + " closes their eyes and lays a hand on " + fallenHero.name + "'s Shrine, standing in silence for a few moments. " + player.name + " opens their eyes and sets off, hoping that " + fallenHero.name + "'s spirit is at peace, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
		}
		break;
		
		case 11:
		switch (encounterChoice) {
			case 0:
			case 4:
			if (!player.canSeeIntents) {
				var output = "BLACKSMITH ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to discover a lone blacksmith hammering away at their anvil. Upon realizing the Explorer in the " + dungeon[stage].roomName.toLowerCase()+ ", the smith offers " + player.name + " their services, tapping what seems to be a sign on their makeshift stall. Despite not being able to read the sign's contents, The Explorer could try and utilize The Smith's services...\n\nCheck comments for available moves!";
				var comment = "??? - [LIKE]\n??? - [LOVE]\n??? - [HAHA]\nDecline The Smith - [ANGRY]\n\n" + getPlayerInfo();
			}
			else {
				var output = "BLACKSMITH ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to discover a lone blacksmith hammering away at their anvil. Upon realizing the Explorer in the " + dungeon[stage].roomName.toLowerCase()+ ", the smith offers " + player.name + " their services, pointing towards the sign on their makeshift stall. The Explorer reads the offers, noting the flat " + (50 * (stage + 1)) + " Gold fee...\n\nCheck comments for available moves!";
				var comment = smithActions[0].description + " - [LIKE]\n" + smithActions[1].description + " - [LOVE]\n" + smithActions[2].description + " - [HAHA]\nDecline The Smith - [ANGRY]\n\n" + getPlayerInfo();
			}
			retryEncounter(output, comment);
			break;
			
			case 1:
			//decline
			console.log(getTimeStamp() + "Purchased Nothing...");
			turn = 1
			room ++;
			encounterResult = "DECLINED THE SMITH\n\n" + player.name + " declined the smith's offer, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 2:
			case 3:
			case 5:
			//upgrade 0
			if (runGold >= ((stage + 1) * 50)) {
				runGold -= ((stage + 1) * 50);
				arr = [0,0,0,2,0,1,0];
				choice = arr[encounterChoice];
				switch (smithActions[choice].method) {
					case 1:
					player.weapon.attackBonus++;
					player.weapon.name = "Sharpened " + player.weapon.name;
					player.weapon.cost = Math.floor(player.weapon.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.weapon.wins ** 2 / 100) + 1) * (2 / player.weapon.modifications) * ((player.weapon.tier ** 2) / 16));
					break;
					
					case 2:
					player.weapon.modifications = 1;
					player.weapon.name = "Reworked " + player.weapon.name;
					player.weapon.cost = Math.floor(player.weapon.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.weapon.wins ** 2 / 100) + 1) * (2 / player.weapon.modifications) * ((player.weapon.tier ** 2) / 16));
					break;
					
					case 3:
					player.weapon.tier++;
					player.weapon.identifier = "[" + tierList[player.weapon.tier] + player.weapon.identifier.slice(2);
					player.weapon.name = "Reforged " + player.weapon.name;
					player.weapon.cost = Math.floor(player.weapon.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.weapon.wins ** 2 / 100) + 1) * (2 / player.weapon.modifications) * ((player.weapon.tier ** 2) / 16));
					break;
					
					case 4:
					player.head.defenseBonus++;
					player.head.name = "Hardened " + player.head.name;
					player.head.cost = Math.floor(player.head.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.head.wins ** 2 / 100) + 1) * (2 / player.head.modifications) * ((player.head.tier ** 2) / 16));
					break;
					
					case 5:
					player.head.modifications = 1;
					player.head.name = "Reworked " + player.head.name;
					player.head.cost = Math.floor(player.head.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.head.wins ** 2 / 100) + 1) * (2 / player.head.modifications) * ((player.head.tier ** 2) / 16));
					break;
					
					case 6:
					player.head.tier++;
					player.head.identifier = "[" + tierList[player.head.tier] + player.head.identifier.slice(2);
					player.head.name = "Reforged " + player.head.name;
					player.head.cost = Math.floor(player.head.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.head.wins ** 2 / 100) + 1) * (2 / player.head.modifications) * ((player.head.tier ** 2) / 16));
					break;
					
					case 7:
					player.body.defenseBonus++;
					player.body.name = "Hardened " + player.body.name;
					player.body.cost = Math.floor(player.body.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.body.wins ** 2 / 100) + 1) * (2 / player.body.modifications) * ((player.body.tier ** 2) / 16));
					break;
					
					case 8:
					player.body.modifications = 1;
					player.body.name = "Reworked " + player.body.name;
					player.body.cost = Math.floor(player.body.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.body.wins ** 2 / 100) + 1) * (2 / player.body.modifications) * ((player.body.tier ** 2) / 16));
					break;
					
					case 9:
					player.body.tier++;
					player.body.identifier = "[" + tierList[player.body.tier] + player.body.identifier.slice(2);
					player.body.name = "Reforged " + player.body.name;
					player.body.cost = Math.floor(player.body.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.body.wins ** 2 / 100) + 1) * (2 / player.body.modifications) * ((player.body.tier ** 2) / 16));
					break;
					
					case 10:
					player.arms.defenseBonus++;
					player.arms.name = "Hardened " + player.arms.name;
					player.arms.cost = Math.floor(player.arms.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.arms.wins ** 2 / 100) + 1) * (2 / player.arms.modifications) * ((player.arms.tier ** 2) / 16));
					break;
					
					case 11:
					player.arms.modifications = 1;
					player.arms.name = "Reworked " + player.arms.name;
					player.arms.cost = Math.floor(player.arms.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.arms.wins ** 2 / 100) + 1) * (2 / player.arms.modifications) * ((player.arms.tier ** 2) / 16));
					break;
					
					case 12:
					player.arms.tier++;
					player.arms.identifier = "[" + tierList[player.arms.tier] + player.arms.identifier.slice(2);
					player.arms.name = "Reforged " + player.arms.name;
					player.arms.cost = Math.floor(player.arms.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.arms.wins ** 2 / 100) + 1) * (2 / player.arms.modifications) * ((player.arms.tier ** 2) / 16));
					break;
					
					case 13:
					player.legs.defenseBonus++;
					player.legs.name = "Hardened " + player.legs.name;
					player.legs.cost = Math.floor(player.legs.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.legs.wins ** 2 / 100) + 1) * (2 / player.legs.modifications) * ((player.legs.tier ** 2) / 16));
					break;
					
					case 14:
					player.legs.modifications = 1;
					player.legs.name = "Reworked " + player.legs.name;
					player.legs.cost = Math.floor(player.legs.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.legs.wins ** 2 / 100) + 1) * (2 / player.legs.modifications) * ((player.legs.tier ** 2) / 16));
					break;
					
					case 15:
					player.legs.tier++;
					player.legs.identifier = "[" + tierList[player.legs.tier] + player.legs.identifier.slice(2);
					player.legs.name = "Reforged " + player.legs.name;
					player.legs.cost = Math.floor(player.legs.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.legs.wins ** 2 / 100) + 1) * (2 / player.legs.modifications) * ((player.legs.tier ** 2) / 16));
					break;
					
					case 16:
					player.relic.healthBonus += 4;
					player.relic.name = "Hardened " + player.relic.name;
					player.relic.cost = Math.floor(player.relic.healthBonus * ((0.5 + 1) ** 1.4) * ((player.relic.wins ** 2 / 100) + 1) * (2 / player.relic.modifications) * ((player.relic.tier ** 2) / 16));
					break;
					
					case 17:
					player.relic.modifications = 1;
					player.relic.name = "Reworked " + player.relic.name;
					player.relic.cost = Math.floor(player.relic.healthBonus * ((0.5 + 1) ** 1.4) * ((player.relic.wins ** 2 / 100) + 1) * (2 / player.relic.modifications) * ((player.relic.tier ** 2) / 16));
					break;
					
					case 18:
					player.relic.tier++;
					player.relic.identifier = "[" + tierList[player.relic.tier] + player.relic.identifier.slice(2);
					player.relic.name = "Reforged " + player.relic.name;
					player.relic.cost = Math.floor(player.relic.healthBonus * ((0.5 + 1) ** 1.4) * ((player.relic.wins ** 2 / 100) + 1) * (2 / player.relic.modifications) * ((player.relic.tier ** 2) / 16));
					break;
					
					case 19:
					player.offhand.defenseBonus++;
					player.offhand.name = "Hardened " + player.offhand.name;
					player.offhand.cost = Math.floor(player.offhand.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
					break;
					
					case 20:
					player.offhand.modifications = 1;
					player.offhand.name = "Reworked " + player.offhand.name;
					player.offhand.cost = Math.floor(player.offhand.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
					break;
					
					case 21:
					player.offhand.tier++;
					player.offhand.identifier = "[" + tierList[player.offhand.tier] + player.offhand.identifier.slice(2);
					player.offhand.name = "Reforged " + player.offhand.name;
					player.offhand.cost = Math.floor(player.offhand.defenseBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
					break;
				}
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				turn = 1
				room ++;
				encounterResult = "UPGRADED EQUIPMENT\n\nThe smith gets to work improving " + player.name + "'s " + smithActions[choice].equipment + ", toiling and hammering away until it is vastly improved " + smithActions[choice].result + ", proceeding onwards\n\n";
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				turn = 1
				room ++;
				encounterResult = "NOT ENOUGH GOLD\n\n" + player.name + " was turned away by the smith due to their lack of gold, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
		}
		break;
		
		case 12:
		switch (encounterChoice) {
			case 0:
			case 3:
			case 4:
			encounterSummary = "DEMONIC SUMMONING SIGIL ACTIVATED\n\nAs " + player.name + " steps onto the sigil the faint red glow turns to burining purple, cursed flames erupt from the sigil's rim, and from the fire comes forth " + enemy.name + "...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Attempt to escape " + enemy.name + " - [LIKE]\nAttempt to worship " + enemy.name + " - [LOVE]\nAttempt to fight " + enemy.name + " - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment)
			break;
			
			case 1:
			//fight demon
			turn = 1
			encounterResult = "ATTACKED " + enemy.name.toUpperCase() + "\n\n" + player.name + " sees " + enemy.name + " as a mere obstacle, beginning fight...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			attacked = true;
			turnStart(true);
			break;
			
			case 2:
			//escape demon
			if (Math.random() < 0.25) {
				//escaped
				console.log(getTimeStamp() + "escaped demon");
				turn = 1
				room ++;
				encounterResult = "ESCAPED " + enemy.name.toUpperCase() + "\n\nUnwilling to fight or bargain with " + enemy.name + ", " + player.name + " attempts to run past the demon. Chains burst from the " + dungeon[stage].roomName.toLowerCase()+ "'s floor, shooting past " + player.name + " as they try to trap the Explorer, but to no avail, as the Explorer manages to escape " + enemy.name + "'s trap successfully, proceeding onwards...\n\n"
				enemy.health = -1;
				encounterOccured = false;
				awaitChoice = false;
				turnStart(true);
				
			}
			else {
				//captured
				encounterDeathMessage = "TRIED TO ESCAPE " + enemy.name.toUpperCase() + "\n\nUnwilling to fight or bargain with " + enemy.name + ", " + player.name + " attempts to run past the demon. Chains burst from the " + dungeon[stage].roomName.toLowerCase()+ "'s floor, ensnaring " + player.name + "'s legs and wrapping their way around the poor Explorer as they drag them through the flames and into a fate worse than death...\n\n";
				encounterCauseOfDeath = "captured and enslaved by " + enemy.name;
				loss('','',1)
			}
			break;
			
			case 5:
			//worship demon
			console.log(getTimeStamp() + "worshipped demon");
			switch(Math.floor(Math.random() * 2)) {
				case 0:
				//Black Heart Relic
				turn = 1
				room ++;
				encounterResult = "WORSHIPPED " + enemy.name.toUpperCase() + "\n\nThe demon cackles as " + player.name + " lays themself down before it, it demands a sacrifice, and " + player.name + " obliges, tearing out their own heart to fulfil the demon's wishes. The flames turn black as they whirl around the Explorer, taking the bleeding heart from their hands and filling the void in their chest with a black stone. The demon returns to the flames, and " + player.name + " is left alone with their new heart (Soul-stripped [Health Core reduced to zero, Attack Core and Defense Core increaded by 2, gained the relic '" + player.firstName + "'s Black Heart'(" + Math.floor(player.maxHealth * 0.75) + " Health/Max Health)]), proceeding onwards...\n\n"
				player.relic = {name:player.firstName + "'s Black Heart",attackBonus:0,defenseBonus:0,healthBonus:Math.floor(player.maxHealth * 0.75),type:2,id:0,identifier:"[C Tier Relic]",modifications:1,demonic:true,tier:4,cost:0,wins:0,durability:[6,4],imgID:{lootclass:"relics",type:"artifact",variant:9}};
				player.healthCore = 0;
				player.attackCore = Number(player.attackCore) + 2;
				player.defenseCore = Number(player.defenseCore) + 2;
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				player.abilities.push({name:"Heartless",description:"Deal extra damage against Explorer and Human-type enemies",id:14,typeName:"[Demonic]"})
				player.abilityText = "[Class] " + playerClasses[player.playerClass].activeAbility;
				for (i = 0; i < player.abilities.length; i++) {
					player.abilityText += "\n" + player.abilities[i].typeName + " " + player.abilities[i].name + "\n" + player.abilities[i].description
				}
				
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				enemy.health = -1;
				encounterOccured = false;
				awaitChoice = false;
				turnStart(true);
				break;
				
				case 1:
				//Worship Failure
				turn = 1
				encounterResult = "WORSHIPPED " + enemy.name.toUpperCase() + "\n\n" + player.name + " bows before the demon, slashing open their hand as an offerring to the being. It takes the blood offer and laughs at the pathetic Explorer, swelling in size and power as it readies itself, beginning fight...\n\n"
				enemy.attack = Math.floor(enemy.attack * 1.75)
				enemy.defense = Math.floor(enemy.defense * 1.75)
				enemy.maxHealth = Math.floor(enemy.maxHealth * 2)
				enemy.health = enemy.maxHealth
				encounterOccured = true;
				awaitChoice = false;
				attacked = true;
				turnStart(true);
				break;
				
				case 2:
				
				
				break;
				
				case 3:
				
				
				break;
				
				case 4:
				
				
				break;
			}
			break;
		}
		break;
		
		case 13:
		switch (encounterChoice) {
			case 0:
			case 3:
			case 4:
			case 5:
			encounterSummary = "CURSED BOOK FOUND\n\nAs " + player.name + " explores The Library, they come across a dusty book atop a black pedestal. Within the tome could be some ancient forbidden knowledge, perhaps it is worth reading, or perhaps not...\n\nCheck comments for available moves!";
			var output = encounterSummary;
			var comment = "Read the book - [LIKE]\nPut the book back - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment)
			break;
			
			case 2:
			//read book
			console.log(getTimeStamp() + "Read the book");
			chance = Math.random();
			if (chance < 0.25 && player.canSeeIntents) {
				encounterResult = "READ THE CURSED TOME\n\n" + player.name + " opens the book, reading it's texts, analyzing it's diagrams, attempting to comprehend the powers it details. The books words begin to burn " + player.name + "'s eyes as they leave their mark on them, bringing new power to the Explorer, but as they close the book and attempt to find the pedestal in their newly black world, " + player.name + " wonders to themselves at what cost has this new power come (Forbidden Knowledge - [+2 Core Attack, +2 Core Defense, -10 Core Health, Can No Longer See Enemy Intents]), They stumble to the exit...\n\n"
				player.attackCore += 2;
				player.defenseCore += 2;
				player.healthCore -= 10;
				
				player.canSeeIntents = false;
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else if (chance < 0.5 && player.canSeeIntents) {
				learnMove = demonicMoves[player.playerClass][Math.floor(Math.random() * 6)];
				console.log(learnMove)
				encounterResult = "READ THE CURSED TOME\n\n" + player.name + " opens the book, reading it's texts, analyzing it's diagrams, attempting to comprehend the powers it details. Slowly it begins to make sense to them, they practice the techniques mentioned within the book and, to their disbelief, find a new and forbidden power within themself...\n\n";
				encounterType = 20;
				encounter(20);
				return;
			}
			else if (chance < 0.75) {
				enemy = generateMiniBoss(8);
				enemy.name = bookTitle;
				enemy.xp *= 10;
				turn = 1
				encounterResult = "READ THE CURSED TOME\n\n" + player.name + "opens the book, reading it's texts, analyzing it's diagrams, attempting to comprehend the powers it details. The scripture begins to blur as they read, and as they reach the halfway point a sinister diagram spans the centrefold. An evil eye projects upwards as the tome begins to levitate, glyphs glow red and fly from the pages, and before the Explorer floats ...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				attacked = true;
				turnStart(true);
			}
			else if (player.canSeeIntents) {
				encounterResult = "READ THE CURSED TOME\n\n" + player.name + " opens the book, reading it's texts, analyzing it's diagrams, attempting to comprehend the powers it details, but they are unable too, and leave The Library with nothing but the faintest feeling that they had almost lost something very important, proceeding onwards...\n\n"
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				encounterResult = "READ THE CURSED TOME\n\n" + player.name + " opens the book, but is unable to read it as they have been blinded. " + player.name + " leaves The Library with nothing, proceeding onwards...\n\n"
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 1:
			//put book back
			console.log(getTimeStamp() + "Put the book back");
			turn = 1
			room ++;
			encounterResult = "PUT THE CURSED BOOK BACK\n\n" + player.name + " cautiously places the book back atop the pedestal, unwilling to expose themself to whatever might have been within, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
		}
		break;
		
		case 14:
		if (player.canSeeIntents) {
			switch (encounterChoice) {
				case 0:	
				var output = "FOUNTAIN ON " + getLocation() + "\n\nAs " + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find it completely empty, save for a small stone fountain in the centre. At it's edge reads a message carved into the stone, it reads 'If ye are in true need, taketh these waters and be cleaned'...\n\nCheck comments for available moves!";
				var comment = "Touch the Water (???) - [LIKE]\nDrink the Water (???) - [LOVE]\nToss a Coin (???) - [HAHA]\nLeave the Fountain - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
				break;
				
				case 1:
				console.log(getTimeStamp() + "Left the Fountain");
				turn = 1
				room ++;
				encounterResult = "LEFT THE FOUNTAIN\n\nFearing it to be a trap, " + player.name + " steps past the fountain, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
				
				case 2:
				console.log(getTimeStamp() + "Touched the Water");
				turn = 1
				room ++;
				if (player.health < 0.3 * player.maxHealth) {
					encounterResult = "TOUCHED THE WATER\n\n" + player.name + " places their hand into the water, and before their eyes old wounds begin to heal. They splash the water over their injuries (+25 Health) and proceed onwards...\n\n"
					player.health += 25;
					if (player.health > player.maxHealth) {
						player.health = player.maxHealth;
					}
				}
				else {
					encounterResult = "TOUCHED THE WATER\n\n" + player.name + " places their hand into the water, but quickly retracts it begins to sting (-5 Health), proceeding onwards...\n\n";
					player.health -= 5;
					if (player.health <= 0) {
						encounterDeathMessage = "TOUCHED THE WATER\n\n" + player.name + " places their hand into the water, but quickly tries to retracts it begins to eat away their hand. They are horrified to see that it will not let them leave, and the fountain slowly pulls them in...\n\n";
						encounterCauseOfDeath = "dissolved by The Fountain";
						loss('','',1)
					}
				}
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
				
				case 3:
				console.log(getTimeStamp() + "Tossed a coin into the Fountain");
				turn = 1
				room ++;
				if (runGold > 0) {
					if (runGold <= 100) {
						runGold -= 1;
						encounterResult = "TOSSED COIN INTO THE FOUNTAIN\n\n" + player.name + " pulls out their gold and throws a piece into the fountain and waits. They are about to leave when the fountain begins to drain, revealing several more pieces of gold. " + player.name + " takes them all, proceeding onwards...\n\n"
						runGold *= 2;
					}
					else {
						runGold -= 1;
						encounterResult = "TOSSED COIN INTO THE FOUNTAIN\n\n" + player.name + " pulls out their gold and throws a piece into the fountain and waits. Nothing happens, proceeding onwards...\n\n"
					}
				}
				else {
					encounterResult = "NO GOLD TO TOSS\n\n" + player.name + " heavily considers throwing a piece of gold into the fountain, but they have none to throw, proceeding onwards...\n\n"
				}
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
				
				case 5:
				console.log(getTimeStamp() + "Drank the Water");
				turn = 1
				room ++;
				if (player.health < 30) {
					if (player.relic.demonic) {
						player.relic.healthBonus += 30;
					}
					else {
						player.healthCore += 30;
					}
					player.health += 30;
					encounterResult = "DRANK THE WATER\n\n" + player.name + " takes a drink from the fountain, their throat begins to burn, invigorating the Explorer with a newfound strength and will to proceed (+30 Health/Max Health)\n\n"
				}
				else {
					player.healthCore -= 10;
					encounterResult = "DRANK THE WATER\n\n" + player.name + " takes a drink from the fountain, their throat begins to burn as the water passes down into their body, somewhat mellowing down as it reaches their stomach. Though significantly less painful, the burning never ceases (-10 Health/Max Health), proceeding onwards...\n\n"
					if (player.health > player.maxHealth) {
						player.health = player.maxHealth
					}
					if (player.health <= 0) {
						encounterDeathMessage = "DRANK THE WATER\n\n" + player.name + " takes a drink from the fountain, their throat begins to burn as the water passes down into their body. The burning intensifies as it flows deeper, and " + player.name + " collapses in pain as their internal organs are consumed by fire...\n\n";
						encounterCauseOfDeath = "burnt alive from the inside";
						loss('','',1)
					}
				}
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth
				}
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
			}
		}
		else {
			switch (encounterChoice) {
				case 0:		
				var output = "FOUNTAIN ON " + getLocation() + "\n\nAs " + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find it completely empty, save for a small stone fountain in the centre they almost trip over. At it's edge " + player.name + "'s hands come across a message carved into the stone, they can make out the words, '...are...need...waters...cleaned'...\n\nCheck comments for available moves!";
				var comment = "Touch the Water (???) - [LIKE]\nDrink the Water (???) - [LOVE]\nToss a Coin (???) - [HAHA]\nSplash Water onto Eyes (???) - [WOW]\nLeave the Fountain - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
				break;
				
				case 1:
				console.log(getTimeStamp() + "Left the Fountain");
				turn = 1
				room ++;
				encounterResult = "LEFT THE FOUNTAIN\n\nFearing it to be a trap, " + player.name + " stumbles past the fountain, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
				
				case 2:
				console.log(getTimeStamp() + "Touched the Water");
				turn = 1
				room ++;
				if (player.health < 0.3 * player.maxHealth) {
					encounterResult = "TOUCHED THE WATER\n\n" + player.name + " places their hand into the water, and before their eyes old wounds begin to heal. They splash the water over their injuries (+25 Health) and proceed onwards...\n\n"
					player.health += 25;
					if (player.health > player.maxHealth) {
						player.health = player.maxHealth;
					}
				}
				else {
					encounterResult = "TOUCHED THE WATER\n\n" + player.name + " places their hand into the water, but quickly retracts it begins to sting (-5 Health), proceeding onwards...\n\n";
					player.health -= 5;
					if (player.health <= 0) {
						encounterDeathMessage = "TOUCHED THE WATER\n\n" + player.name + " places their hand into the water, but quickly tries to retracts it begins to eat away their hand. They are horrified to see that it will not let them leave, and the fountain slowly pulls them in...\n\n";
						encounterCauseOfDeath = "dissolved by The Fountain";
						loss('','',1)
					}
				}
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
				
				case 3:
				console.log(getTimeStamp() + "Tossed a coin into the Fountain");
				turn = 1
				room ++;
				if (runGold > 0) {
					if (runGold <= 100) {
						runGold -= 1;
						encounterResult = "TOSSED COIN INTO THE FOUNTAIN\n\n" + player.name + " pulls out their gold and throws a piece into the fountain and waits. They are about to leave when the fountain begins to drain, revealing several more pieces of gold. " + player.name + " takes them all, proceeding onwards...\n\n"
						runGold *= 2;
					}
					else {
						runGold -= 1;
						encounterResult = "TOSSED COIN INTO THE FOUNTAIN\n\n" + player.name + " pulls out their gold and throws a piece into the fountain and waits. Nothing happens, proceeding onwards...\n\n"
					}
				}
				else {
					encounterResult = "NO GOLD TO TOSS\n\n" + player.name + " heavily considers throwing a piece of gold into the fountain, but they have none to throw, proceeding onwards...\n\n"
				}
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
				
				case 4:
				console.log(getTimeStamp() + "Splashed the Water onto eyes");
				turn = 1
				room ++;
				player.canSeeIntents = true;
				encounterResult = "SPLASHED WATER ONTO EYES\n\n" + player.name + " dips their hands into the fountain and splashes it's water onto their unseeing eyes. A burning sensation quickly spreads to their face, the Explorer writhes in agony. And then it stops. Sight returns to the Explorer for the first time since their encounter in The Library\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
				
				case 5:
				console.log(getTimeStamp() + "Drank the Water");
				turn = 1
				room ++;
				if (player.health < 30) {
					if (player.relic.demonic) {
						player.relic.healthBonus += 30;
					}
					else {
						player.healthCore += 30;
					}
					player.health += 30;
					encounterResult = "DRANK THE WATER\n\n" + player.name + " takes a drink from the fountain, their throat begins to burn, invigorating the Explorer with a newfound strength and will to proceed (+30 Health/Max Health)\n\n"
				}
				else {
					player.healthCore -= 10;
					encounterResult = "DRANK THE WATER\n\n" + player.name + " takes a drink from the fountain, their throat begins to burn as the water passes down into their body, somewhat mellowing down as it reaches their stomach. Though significantly less painful, the burning never ceases (-10 Health/Max Health), proceeding onwards...\n\n"
					if (player.health > player.maxHealth) {
						player.health = player.maxHealth
					}
					if (player.health <= 0) {
						encounterDeathMessage = "DRANK THE WATER\n\n" + player.name + " takes a drink from the fountain, their throat begins to burn as the water passes down into their body. The burning intensifies as it flows deeper, and " + player.name + " collapses in pain as their internal organs are consumed by fire...\n\n";
						encounterCauseOfDeath = "burnt alive from the inside";
						loss('','',1)
					}
				}
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth
				}
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
				break;
			}
		}
		break;
		
		case 15:
		switch (encounterChoice) {
			case 0:
			case 2:
			case 3:
			case 4:
			
			break;
			
			case 1:
			wins += 10;
			enemy = generateBoss();
			wins -= 10;
			enemy.name = "The Gatekeeper";
			enemy.firstName = "The Gatekeeper";
			enemy.finalBoss = true;
			turn = 1
			encounterResult = "REFUSED\n\n" + player.name + " takes another step towards the figure, they will not be deterred. The towering figure shifts it's stance once more, poised to strike.\n'Then face your doom'\n" + player.name + " readies themself, battle begins...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			attacked = true;
			turnStart(true);
			break;
			
			case 5:
			encounterDeathMessage = "ACCEPTED\n\n" + player.name + " steps backward, the figure backs down. A thin rim of blue fire forms around the stone doorway from which they came before. The figure resumes it's position in front of the black Gate, gesturing for the Explorer to step through the flaming doorway. The Explorer obliges, and without a second thought they step through the door and into oblivion...\n\n";
			encounterCauseOfDeath = "Turned away at The Gate"
			endOfRun();
			break;
		}
		break;
		
		case 16:
		switch (encounterChoice) {
			case 0:
			case 2:
			case 4:
			var output = "POOL OF HONEY ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find a large pool of golden honey. Several worker bees can be seen taking and depositing the fluid at the pool's edge, but despite this risk it would likely be worthwhile to sample it...\n\nCheck comments for available moves!";
			var comment = "Attempt to sneakily take some honey - [LOVE]\nAttempt to distract the bees and draw them away - [HAHA] \nLeave the pool alone - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment)
			break;
			
			case 1:
			turn = 1
			room ++;
			encounterResult = "LEFT THE POOL\n\nUpon further contemplation, " + player.name + " decides they would rather not risk getting torn apart by giant bees for a few mouthfuls of honey, so instead they leave the pool and the bees alone, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 3:
			if (Math.random() < 0.25) {
				turn = 1
				room ++;
				var originalHealth = player.health;
				player.health += Math.floor(player.maxHealth * 0.25);
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				var playerHealthDelta = player.health - originalHealth;
				player.relic.healthBonus += 5;
				player.health += 5;
				
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				
				encounterResult = "SUCCESSFULLY DISTRACTED THE BEES\n\n" + player.name + " seizes the opportunity, breaks off a piece of the wall, and tosses it in the general direction of the bees and away from the pool. They swarm upon it, leaving " + player.name + " free to take some honey from the edge (+" + playerHealthDelta + " Health). Upon leaving the pool, the Explorer notices that their relic must have accidentally been dipped into it, improving it slightly (+5 Health/Max Health), proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				player.health -= 20;
				encounterResult = "FAILED TO DISTRACT THE BEES\n\n" + player.name + " seizes the opportunity, and breaks off a piece of the wall to distract the bees with, but the wax wall collapses on the Explorer (-5 Health). Furthermore, the bees turn their attention to the sudden disturbance and, upon seeing " + player.name + " on the ground, they quickly swarm upon the unfortunate Explorer, who barely manages to escape the enraged swarm (-15 Health), they take a moment to catch their breath before proceeding onwards...\n\n"
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth
				}
				if (player.health <= 0) {
					encounterDeathMessage = "FAILED TO DISTRACT THE BEES\n\n" + player.name + " seizes the opportunity, and breaks off a piece of the wall to distract the bees with, but the wax wall collapses on the Explorer (-5 Health). Furthermore, the bees turn their attention to the sudden disturbance and, upon seeing " + player.name + " on the ground, they quickly swarm upon the unfortunate Explorer, who is struck back down by the enraged swarm (-15 Health), and helplessly screams as the bees tear them apart...\n\n"
					encounterCauseOfDeath = "torn apart by bees";
					loss('','',1);
					return;
				}
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 5:
			if (Math.random() < 0.75 || player.playerClass == 1) {
				turn = 1
				room ++;
				var originalHealth = player.health;
				player.health += Math.floor(player.maxHealth * 0.25);
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				var playerHealthDelta = player.health - originalHealth;
				encounterResult = "SUCCESSFULLY SNUCK THROUGH THE BEES\n\n" + player.name + " seizes the opportunity and begins to sneak past the bees. They seem to preoccipied with their work to notice the Explorer anyway, leaving " + player.name + " free to take some honey from the edge (+" + playerHealthDelta + " Health), proceeding onwards...\n\n"
				if (player.playerClass == 1) {
					encounterResult = "SUCCESSFULLY SNUCK THROUGH THE BEES\n\n" + player.name + " seizes the opportunity and begins to sneak past the bees. Luckily for the Explorer sneaking is a skill they are adept in, leaving " + player.name + " free to take some honey from the edge (+" + playerHealthDelta + " Health), proceeding onwards...\n\n"
				}
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				enemy = generateEnemy();
				turn = 1
				encounterResult = "CAUGHT BY A BEE\n\n" + player.name + " seizes the opportunity and begins to sneak past the bees. They seem to preoccipied with their work to notice the Explorer anyway, except for one which catches sight of " + player.name + " and quickly rushes towards them, beginning fight...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				attacked = true;
				turnStart(true);
			}
			break;
		}
		break;
		
		case 17:
		var traps = [2,5,3]
		var trapType = traps[Math.floor(Math.random() * traps.length)];
		switch (encounterChoice) {
			case 0:
			case 1:
			case 4:
			var output = "HIDDEN TRAP ON " + getLocation() + "\n\n" + player.name + " walks into this room to hear a click at their feet, and they look down to see they have activated some hidden trap! With only seconds to spare, the Explorer must quickly decide what to do...\n\nCheck comments for available moves!";
			var comment = "Jump - [LIKE]\nDuck - [LOVE] \nDodge - [HAHA]\n\n" + getPlayerInfo();
			retryEncounter(output,comment)
			break;
			
			case 2:
			if (trapType == 2) {
				player.health -= 30;
				encounterResult = "STRUCK BY SWINGING BLADE\n\n" + player.name + " jumps away from the trigger, and right into an enormous piece of metal hurtling towards their body. The Explorer manages to evade most of the blade, but the parts they couldn't avoid inflict severe damage upon the Explorer (-30 Health). Luckily it wasn't enough to end their life, " + player.name + " tells themself, proceeding onwards...\n\n"
				if (player.health <= 0) {
					encounterDeathMessage = "STRUCK BY SWINGING BLADE\n\n" + player.name + " jumps away from the trigger, and right into an enormous piece of metal hurtling towards their body. Unable to dodge the trap due to their injuries, the blade cleaves " + player.name + " cleanly in half, and the floor turns red as both halves of the Explorer bleed out...\n\n"
					encounterCauseOfDeath = "chopped in half by swinging blade";
					loss('','',1);
					return;
				}
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				switch (trapType) {
					case 3:
					//pit
					encounterResult = "EVADED THE PIT\n\n" + player.name + " jumps well clear of the trap as the ground beneath them begins to collapse. They land on the other side of the newly revealed pit, filled with what looks to be a writhing mass of snakes. The Explorer is very glad to not have fallen into that, proceeding onwards...\n\n"
					break;
					
					case 5:
					//darts
					encounterResult = "EVADED THE DARTS\n\n" + player.name + " jumps towards the nearest cover they can find, barely managing to jump over the first wave of several razor sharp darts whizzing past. They wait a few moments behind a half-built brick wall for the rain of blades to cease, before proceeding onwards, glad to not have been hit...\n\n"
					break;
				}
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 3:
			if (trapType == 5) {
				player.health -= 30;
				encounterResult = "FELL INTO PIT OF SNAKES\n\n" + player.name + " crouches down as fast as they can, attempting to avoid the trap, but the ground gives way and the Explorer finds themself in a pit of snakes! They scramble their way out of the pit, sustaining several bites in the progress (-30 Health), but luckily it wasn't enough to end their life, " + player.name + " tells themself, proceeding onwards...\n\n"
				if (player.health <= 0) {
					encounterDeathMessage = "FELL INTO PIT OF SNAKES\n\n" + player.name + " crouches down as fast as they can, attempting to avoid the trap, but the ground gives way and the Explorer finds themself in a pit of snakes! They try to climb their way out of the pit, but their past injuries have made them slow, snakes pile onto them, and slowly " + player.name + " is pulled into the pit...\n\n"
					encounterCauseOfDeath = "devoured by a pit of snakes";
					loss('','',1);
					return;
				}
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				switch (trapType) {
					case 2:
					//blade
					encounterResult = "EVADED THE SWINGING BLADE\n\n" + player.name + " drops to the ground as a heavy iron blade swings right over them, the tip just barely skimming their armour. They wait for a while, believing the blade will swing back the other way, but it never does, proceeding onwards...\n\n"
					break;
					
					case 5:
					//darts
					encounterResult = "EVADED THE DARTS\n\n" + player.name + " quickly drops to the ground as the first wave of several razor sharp darts whistle right overhead. They stay as flat as they can as more and more darts fire, and only when they have stopped for good does the Explorer get up to continue onwards, glad to not have been hit...\n\n"
					break;
				}
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 3:
			if (trapType == 3) {
				player.health -= 30;
				encounterResult = "CAUGHT BY RAZOR-SHARP DARTS\n\n" + player.name + " attempts to run for the exit, but is caught by wave after wave afer wave of small razor-sharp darts. Most of them bounce off or befome embedded in their armour, but the Explorer feels the excruciating sting of the darts that rip through their flesh (-30 Health). Luckily it wasn't enough to end their life, " + player.name + " tells themself, proceeding onwards...\n\n"
				if (player.health <= 0) {
					encounterDeathMessage = "CAUGHT BY RAZOR-SHARP DARTS\n\n" + player.name + " attempts to run for the exit, but is caught by wave after wave afer wave of small razor-sharp darts. Most of them bounce off or befome embedded in their armour, but the Explorer feels the excruciating sting of the darts that rip through their flesh. A few of the darts reopen " + player.name + "'s old wounds, but before the Explorer realizes the damage done it is too late for them, and they bleed out on The Dungeon floor...\n\n"
					encounterCauseOfDeath = "shredded by razor-sharp darts";
					loss('','',1);
					return;
				}
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				switch (trapType) {
					case 2:
					//blade
					encounterResult = "EVADED THE SWINGING BLADE\n\n" + player.name + " dashes towards the wall, barely reaching it as a large metal blade swings through the middle of the room. They edge their way to the exit ahead, fearful that the blade may swing back, but it never does, proceeding onwards...\n\n"
					break;
					
					case 5:
					//pit
					encounterResult = "EVADED THE PIT\n\n" + player.name + " dashes well clear of the trap as the ground beneath them begins to collapse. They look back to find themselves on the other side of the newly revealed pit, filled with what looks to be a writhing mass of snakes. The Explorer is very glad to not have fallen into that, proceeding onwards...\n\n"
					break;
				}
				turn = 1
				room ++;
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
		}
		break;

		case 18:
		switch (encounterChoice) {
			case 0:
			case 3:
			case 4:
			var output = "VAULT DOOR ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find a large and very heavy looking iron door. Inscribed on the door are two symbols; one of a sword and one of a shield. The warm blue glow of the inscriptions invites you to touch one...\n\nCheck comments for available moves!";
			var comment = "Touch the Sword Symbol - [LIKE]\nTouch the Shield Symbol - [LOVE] \nLeave the Door alone - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment);
			break;
			
			case 1:
			//leave vault alone
			
			break;
			
			case 2:
			//sword
			if (player.defense > player.attack) {
				turn = 1
				room ++;
				encounterResult = "VAULT DOOR REMAINS LOCKED\n\n" + player.name + " tensely places their hand on the Sword Symbol, and as their hand touches the metal surface the glow of both the symbols subsides, and the door remains locked, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				var goldGain = Math.floor((wins + 1) * (Math.random() + 1) * 5);
				runGold += goldGain;
				encounterResult = "VAULT DOOR OPENS\n\n" + player.name + " tensely places their hand on the Sword Symbol, and as their hand touches the metal surface both of the symbols glow brighter and the door slides open, revealing " + goldGain + " gold and another door...\n\n"
				encounterType = 19;
				encounter(19);
			}
			break;
			
			case 5:
			//shield
			if (player.attack > player.defense) {
				turn = 1
				room ++;
				encounterResult = "VAULT DOOR REMAINS LOCKED\n\n" + player.name + " tensely places their hand on the Shield Symbol, and as their hand touches the metal surface the glow of both the symbols subsides, and the door remains locked, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			else {
				var goldGain = Math.floor((wins + 1) * (Math.random() + 1) * 5);
				runGold += goldGain;
				encounterResult = "VAULT DOOR OPENS\n\n" + player.name + " tensely places their hand on the Shield Symbol, and as their hand touches the metal surface both of the symbols glow brighter and the door slides open, revealing " + goldGain + " gold and another door...\n\n"
				encounterType = 19;
				encounter(19);
			}
			break;
		}
		break;
		
		case 19:
		switch (encounterChoice) {
			case 0:
			case 4:
			var output = "VAULT DOOR ON " + getLocation() + "\n\n" + player.name + " enters this " + dungeon[stage].roomName.toLowerCase()+ " to find a large and very heavy looking iron door. Inscribed on the door are two symbols; one of a sword and one of a shield. The warm blue glow of the inscriptions invites you to touch one...\n\nCheck comments for available moves!";
			var comment = "Touch the Sword Symbol - [LIKE]\nTouch the Shield Symbol - [LOVE] \nLeave the Door alone - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment);
			break;
			
			case 1:
			//leave vault alone
			
			break;
			
			case 2:
			//fire
			if (player.playerClass == 0 || player.playerClass == 5) {
				var goldGain = Math.floor((wins + 1) * (Math.random() + 1) * 5);
				runGold += goldGain;
				encounterResult = "VAULT DOOR OPENS\n\n" + player.name + " tensely places their hand on the Sword Symbol, and as their hand touches the metal surface both of the symbols glow brighter and the door slides open, revealing " + goldGain + " gold and another door...\n\n"
				encounterType = 19;
				encounter(19);
			}
			else {
				turn = 1
				room ++;
				encounterResult = "VAULT DOOR REMAINS LOCKED\n\n" + player.name + " tensely places their hand on the Sword Symbol, and as their hand touches the metal surface the glow of both the symbols subsides, and the door remains locked, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 3:
			//plant
			if (player.playerClass == 2 || player.playerClass == 4) {
				var goldGain = Math.floor((wins + 1) * (Math.random() + 1) * 5);
				runGold += goldGain;
				encounterResult = "VAULT DOOR OPENS\n\n" + player.name + " tensely places their hand on the Sword Symbol, and as their hand touches the metal surface both of the symbols glow brighter and the door slides open, revealing " + goldGain + " gold and another door...\n\n"
				encounterType = 19;
				encounter(19);
			}
			else {
				turn = 1
				room ++;
				encounterResult = "VAULT DOOR REMAINS LOCKED\n\n" + player.name + " tensely places their hand on the Sword Symbol, and as their hand touches the metal surface the glow of both the symbols subsides, and the door remains locked, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 5:
			//water
			if (player.playerClass == 1 || player.playerClass == 3) {
				var goldGain = Math.floor((wins + 1) * (Math.random() + 1) * 5);
				runGold += goldGain;
				encounterResult = "VAULT DOOR OPENS\n\n" + player.name + " tensely places their hand on the Sword Symbol, and as their hand touches the metal surface both of the symbols glow brighter and the door slides open, revealing " + goldGain + " gold and another door...\n\n"
				encounterType = 19;
				encounter(19);
			}
			else {
				turn = 1
				room ++;
				encounterResult = "VAULT DOOR REMAINS LOCKED\n\n" + player.name + " tensely places their hand on the Sword Symbol, and as their hand touches the metal surface the glow of both the symbols subsides, and the door remains locked, proceeding onwards...\n\n"
				encounterOccured = true;
				awaitChoice = false;
				turnStart(true);
			}
			break;
		}
		break;
		
		case 20:
		switch (encounterChoice) {
			case 2:
			case 3:
			case 4:
			case 6:
			case 0:
			var output = "NEW COMBAT MOVE\n\n" + player.name + " is able to learn a new move: " + learnMove.name + " (" + learnMove.description + ")\nThis move will occupy the " + moveSlots[learnMove.slot] + " slot\n\nCheck comments for available moves!";
			var comment = "Learn the Move - [LOVE]\nIgnore the Move - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment);
			break;
			
			case 1:
			turn = 1
			room ++;
			encounterResult = "DID NOT LEARN THE MOVE\n\n" + player.name + " decides to not learn the new combat move, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 5:
			player.learntMoves.push(learnMove);
			
			i = 0;
			while (i < player.learntMoves.length) {
				move = player.learntMoves[i];
				if (move.reqWeaponID) {
					if (move.reqWeaponID == player.weapon.id) {
						if (player.weapon.twohanded && move.reqTwoHanded) {
							player.moves[move.slot] = move;
						}
						else if (!player.weapon.twohanded && move.reqOneHanded) {
							player.moves[move.slot] = move;
						}
						else if (!move.reqTwoHanded && !move.reqOneHanded) {
							player.moves[move.slot] = move;
						}
					}
				}
				else if (player.offhand.type == 1 && player.offhand.id == 4 && move.reqShield) {
					player.moves[move.slot] = move;
				} 
				else {
					player.moves[move.slot] = move;
				}
				i++;
			}
			
			turn = 1
			room ++;
			encounterResult = "LEARNT THE MOVE\n\n" + player.name + " learns the new combat move, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
		}
		break;
		
		case 25:
		
		break;	
		
		case 26:
		if (player.moves[playerAction].upgradeable) {
			if (player.moves[playerAction].classMove) {
				player.movelevels[5][player.moves[playerAction].classID]++;
				encounterResult = "MOVE UPGRADED\n\n" + player.moves[playerAction].name + " => ";
				player.moves[playerAction] = moves[5][player.moves[playerAction].classID][player.movelevels[5][player.moves[playerAction].classID]];
				encounterResult += player.moves[playerAction].name + " (" + player.moves[playerAction].description + ")";
			}
			else {
				player.movelevels[player.weapon.id][playerAction]++;
				encounterResult = "MOVE UPGRADED\n\n" + player.moves[playerAction].name + " => ";
				player.moves[playerAction] = moves[player.weapon.id][playerAction][player.movelevels[player.weapon.id][playerAction]];
				encounterResult += player.moves[playerAction].name + " (" + player.moves[playerAction].description + ")";
			}
			
			if (didGainLootEquipment) {
				encounterResult += "\n\n"
				awaitChoice = false;
				encounterType = 8;
				encounter(8);
				reward = true;
			}
			else {
				encounterResult += ", proceeding onwards..."
				turn = 1
				room ++;
				encounterOccured = false;
				awaitChoice = false;
				turnStart(true);
			}
			break;
		}
		else {
			var output = "LEVEL UP\n\n" + player.name + " is able to upgrade one of their moves!\n\nCheck comments for available moves!";
			var comment = "";
			i = 0;
			while (i < 4) {
				if (player.moves[i + 1].upgradeable && !player.moves[i + 1].classMove) {
					comment += "Upgrade " + player.moves[i + 1].name + " (" + player.moves[i + 1].description + ") => " + moves[player.weapon.id][i + 1][player.movelevels[player.weapon.id][i + 1] + 1].name + " (" + moves[player.weapon.id][i + 1][player.movelevels[player.weapon.id][i + 1] + 1].description + ") - " + moveSlots[i + 1] + "\n";
				}
				else if (player.moves[i + 1].upgradeable && player.moves[i + 1].classMove) {
					comment += "Upgrade " + player.moves[i + 1].name + " (" + player.moves[i + 1].description + ") => " + moves[5][player.playerClass][player.movelevels[5][i + 1] + 1].name + " (" + moves[5][player.playerClass][player.movelevels[5][i] + 1].description + ") - " + moveSlots[i + 1] + "\n";	
				}
				i++;
			}
			comment += "\n" + getPlayerInfo();
			retryEncounter(output,comment);
		}
		break;
		
		case 27:
		if (player.consumables[playerAction - 2]) {
			awaitChoice = false;
			useConsumable(playerAction - 2);
		}
		else {
			var output = "SELECT CONSUMABLE\n\n" + player.name + " checks their supply of consumables, deciding which one to use...\n\nCheck comments for available moves!";
			var comment = "";
			i = 0;
			while (i < player.consumables.length) {
				comment += "Use " + player.consumables[i].name + " (" + player.consumables[i].description + ") - " + moveSlots[i + 2] + "\n";
				i++;
			}
			comment += "\n" + getPlayerInfo();
			retryEncounter(output,comment)
		}
		break;
		
		case 28:
		switch (encounterChoice) {
			case 2:
			var scrapChanceStr = "" + ((11 - player.weapon.modifications) / 10);
			scrapChance = Number(scrapChanceStr.slice(0,4));
			if (scrapChance > 1) {
				scrapChance = 1;
			}
			if (Math.random() < scrapChance) {
				console.log(getTimeStamp() + "Reward Scrap Successful...");
				var improveAmount = 1;
				if (lootReward.tier > 4) {
					improveAmount ++;
				}
				if (lootReward.tier >= 7) {
					improveAmount ++;
				}
				player.weapon.attackBonus += improveAmount;
				
				if (player.weapon.tier < 10) {
					if (Math.random() < (1 - scrapChance) / (11 - player.weapon.tier)) {
						player.weapon.tier++;
						player.weapon.identifier = "[" + tierList[player.weapon.tier] + " Tier" + player.weapon.identifier.split("Tier")[1];
						var tierImprove = true;
					}
				}
				
				player.weapon.modifications ++;
				
				player.weapon.cost = Math.floor(player.weapon.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.weapon.wins ** 2 / 100) + 1) * (2 / player.weapon.modifications) * ((player.weapon.tier ** 2) / 16));
				
				encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to enhance their weapon (+" + improveAmount + " Attack), proceeding onwards...\n\n"
				if (tierImprove) {
					encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to significantly enhance their weapon (+" + improveAmount + " Attack, +1 Tier), proceeding onwards...\n\n"
				}
			}
			else {
				console.log(getTimeStamp() + "Reward Scrap Failed...");
				var degradeAmount = 1;
				if (lootReward.tier < 4) {
					degradeAmount ++;
				}
				if (lootReward.tier <= 1) {
					degradeAmount ++;
				}
				player.weapon.attackBonus -= degradeAmount;
				if (player.weapon.tier > 0) {
					if (Math.random() < (1 - scrapChance) / player.weapon.tier) {
						player.weapon.tier--;
						player.weapon.identifier = "[" + tierList[player.weapon.tier] + " Tier" + player.weapon.identifier.split("Tier")[1];
						var tierDegrade = true;
					}
				}
				
				player.weapon.modifications ++;
				
				player.weapon.cost = Math.floor(player.weapon.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.weapon.wins ** 2 / 100) + 1) * (2 / player.weapon.modifications) * ((player.weapon.tier ** 2) / 16));
				
				encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their weapon using the reward but fails, damaging their own weapon (-" + degradeAmount + " Attack), proceeding onwards...\n\n"
				if (tierDegrade) {
					encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their weapon using the reward but critically fails, severely damaging their own weapon (-" + degradeAmount + " Attack, -1 Tier), proceeding onwards...\n\n"
				}
			}
			break;
			
			case 5:
			if (!player.weapon.twohanded && player.offhand.type == 0) {
				var scrapChanceStr = "" + ((11 - player.offhand.modifications) / 10);
				scrapChance = Number(scrapChanceStr.slice(0,4));
				if (scrapChance > 1) {
					scrapChance = 1;
				}
				if (Math.random() < scrapChance) {
					console.log(getTimeStamp() + "Reward Scrap Successful...");
					var improveAmount = 1;
					if (lootReward.tier > 4) {
						improveAmount ++;
					}
					if (lootReward.tier >= 7) {
						improveAmount ++;
					}
					player.offhand.attackBonus += improveAmount;
					
					if (player.offhand.tier < 10) {
						if (Math.random() < (1 - scrapChance) / (11 - player.offhand.tier)) {
							player.offhand.tier++;
							player.offhand.identifier = "[" + tierList[player.offhand.tier] + " Tier" + player.offhand.identifier.split("Tier")[1];
							var tierImprove = true;
						}
					}
				
					player.offhand.modifications ++;
				
					player.offhand.cost = Math.floor(player.offhand.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
				
					encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to enhance their weapon (+" + improveAmount + " Attack), proceeding onwards...\n\n"
					if (tierImprove) {
						encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to significantly enhance their weapon (+" + improveAmount + " Attack, +1 Tier), proceeding onwards...\n\n"
					}
				}
				else {
					console.log(getTimeStamp() + "Reward Scrap Failed...");
					var degradeAmount = 1;
					if (lootReward.tier < 4) {
						degradeAmount ++;
					}
					if (lootReward.tier <= 1) {
						degradeAmount ++;
					}
					player.offhand.attackBonus -= degradeAmount;
					if (player.offhand.tier > 0) {
						if (Math.random() < (1 - scrapChance) / player.offhand.tier) {
							player.offhand.tier--;
							player.offhand.identifier = "[" + tierList[player.offhand.tier] + " Tier" + player.offhand.identifier.split("Tier")[1];
							var tierDegrade = true;
						}
					}
				
					player.offhand.modifications ++;
				
					player.offhand.cost = Math.floor(player.offhand.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.offhand.wins ** 2 / 100) + 1) * (2 / player.offhand.modifications) * ((player.offhand.tier ** 2) / 16));
			
					encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their weapon using the reward but fails, damaging their own weapon (-" + degradeAmount + " Attack), proceeding onwards...\n\n"
					if (tierDegrade) {
						encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their weapon using the reward but critically fails, severely damaging their own weapon (-" + degradeAmount + " Attack, -1 Tier), proceeding onwards...\n\n"
					}
				}
			}
			break;
			
			case 3:
			if (player.secondaryWeapon) {
				var scrapChanceStr = "" + ((11 - player.secondaryWeapon.modifications) / 10);
				scrapChance = Number(scrapChanceStr.slice(0,4));
				if (scrapChance > 1) {
					scrapChance = 1;
				}
				if (Math.random() < scrapChance) {
					console.log(getTimeStamp() + "Reward Scrap Successful...");
					var improveAmount = 1;
					if (lootReward.tier > 4) {
						improveAmount ++;
					}
					if (lootReward.tier >= 7) {
						improveAmount ++;
					}
					player.secondaryWeapon.attackBonus += improveAmount;
					
					if (player.secondaryWeapon.tier < 10) {
						if (Math.random() < (1 - scrapChance) / (11 - player.secondaryWeapon.tier)) {
							player.secondaryWeapon.tier++;
							player.secondaryWeapon.identifier = "[" + tierList[player.secondaryWeapon.tier] + " Tier" + player.secondaryWeapon.identifier.split("Tier")[1];
							var tierImprove = true;
						}
					}
				
					player.secondaryWeapon.modifications ++;
				
					player.secondaryWeapon.cost = Math.floor(player.secondaryWeapon.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.secondaryWeapon.wins ** 2 / 100) + 1) * (2 / player.secondaryWeapon.modifications) * ((player.secondaryWeapon.tier ** 2) / 16));
				
					encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to enhance their weapon (+" + improveAmount + " Attack), proceeding onwards...\n\n"
					if (tierImprove) {
						encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to significantly enhance their weapon (+" + improveAmount + " Attack, +1 Tier), proceeding onwards...\n\n"
					}
				}
				else {
					console.log(getTimeStamp() + "Reward Scrap Failed...");
					var degradeAmount = 1;
					if (lootReward.tier < 4) {
						degradeAmount ++;
					}
					if (lootReward.tier <= 1) {
						degradeAmount ++;
					}
					player.secondaryWeapon.attackBonus -= degradeAmount;
					if (player.secondaryWeapon.tier > 0) {
						if (Math.random() < (1 - scrapChance) / player.secondaryWeapon.tier) {
							player.secondaryWeapon.tier--;
							player.secondaryWeapon.identifier = "[" + tierList[player.secondaryWeapon.tier] + " Tier" + player.secondaryWeapon.identifier.split("Tier")[1];
							var tierDegrade = true;
						}
					}
				
					player.secondaryWeapon.modifications ++;
				
					player.secondaryWeapon.cost = Math.floor(player.secondaryWeapon.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.secondaryWeapon.wins ** 2 / 100) + 1) * (2 / player.secondaryWeapon.modifications) * ((player.secondaryWeapon.tier ** 2) / 16));
			
					encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their weapon using the reward but fails, damaging their own weapon (-" + degradeAmount + " Attack), proceeding onwards...\n\n"
					if (tierDegrade) {
						encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their weapon using the reward but critically fails, severely damaging their own weapon (-" + degradeAmount + " Attack, -1 Tier), proceeding onwards...\n\n"
					}
				}
			}
			break;
			
			case 4:
			if (player.secondaryOffhand && !player.secondaryWeapon.twohanded) {
				if (player.secondaryOffhand.type == 0) {
					var scrapChanceStr = "" + ((11 - player.secondaryOffhand.modifications) / 10);
					scrapChance = Number(scrapChanceStr.slice(0,4));
					if (scrapChance > 1) {
						scrapChance = 1;
					}
					
					if (Math.random() < scrapChance) {
						console.log(getTimeStamp() + "Reward Scrap Successful...");
						var improveAmount = 1;
						if (lootReward.tier > 4) {
							improveAmount ++;
						}
						if (lootReward.tier >= 7) {
							improveAmount ++;
						}
						player.secondaryOffhand.attackBonus += improveAmount;
						
						if (player.secondaryOffhand.tier < 10) {
							if (Math.random() < (1 - scrapChance) / (11 - player.secondaryOffhand.tier)) {
								player.secondaryOffhand.tier++;
								player.secondaryOffhand.identifier = "[" + tierList[player.secondaryOffhand.tier] + " Tier" + player.secondaryOffhand.identifier.split("Tier")[1];
								var tierImprove = true;
							}
						}
				
						player.secondaryOffhand.modifications ++;
				
						player.secondaryOffhand.cost = Math.floor(player.secondaryOffhand.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.secondaryOffhand.wins ** 2 / 100) + 1) * (2 / player.secondaryOffhand.modifications) * ((player.secondaryOffhand.tier ** 2) / 16));
				
						encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to enhance their weapon (+" + improveAmount + " Attack), proceeding onwards...\n\n"
						if (tierImprove) {
							encounterResult = "SUCCESSFULLY SCRAPPED THE REWARD\n\n" + player.name + " uses the rewards useful components to significantly enhance their weapon (+" + improveAmount + " Attack, +1 Tier), proceeding onwards...\n\n"
						}
					}
					else {
						console.log(getTimeStamp() + "Reward Scrap Failed...");
						var degradeAmount = 1;
						if (lootReward.tier < 4) {
							degradeAmount ++;
						}
						if (lootReward.tier <= 1) {
							degradeAmount ++;
						}
						player.secondaryOffhand.attackBonus -= degradeAmount;
						if (player.secondaryOffhand.tier > 0) {
							if (Math.random() < (1 - scrapChance) / player.secondaryOffhand.tier) {
								player.secondaryOffhand.tier--;
								player.secondaryOffhand.identifier = "[" + tierList[player.secondaryOffhand.tier] + " Tier" + player.secondaryOffhand.identifier.split("Tier")[1];
								var tierDegrade = true;
							}
						}
				
						player.secondaryOffhand.modifications ++;
				
						player.secondaryOffhand.cost = Math.floor(player.secondaryOffhand.attackBonus * 4 * ((0.5 + 1) ** 1.4) * ((player.secondaryOffhand.wins ** 2 / 100) + 1) * (2 / player.secondaryOffhand.modifications) * ((player.secondaryOffhand.tier ** 2) / 16));
			
						encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their weapon using the reward but fails, damaging their own weapon (-" + degradeAmount + " Attack), proceeding onwards...\n\n"
						if (tierDegrade) {
							encounterResult = "FAILED TO SCRAP THE REWARD\n\n" + player.name + " attempts to improve their weapon using the reward but critically fails, severely damaging their own weapon (-" + degradeAmount + " Attack, -1 Tier), proceeding onwards...\n\n"
						}
					}
				}
			}
			break;
			
			case 0,1:
			var output = "SCRAPPING WEAPON\n\n" + player.name + " decides which weapon to enhance...\n\nCheck comments for available moves!";
			var scrapChanceStr = "" + ((11 - player.weapon.modifications) / 10);
			scrapChance = Number(scrapChanceStr.slice(0,4));
			if (scrapChance > 1) {
				scrapChance = 1;
			}
			if (player.weapon.twohanded || player.offhand.type != 0) {
				var comment = "Enhance Weapon (" + scrapChance * 100 + "% Success Chance) - [LIKE]";
			}
			else {
				var comment = "Enhance Weapon (" + scrapChance * 100 + "% Success Chance) - [LIKE]";
				
				var scrapChanceStr = "" + ((11 - player.offhand.modifications) / 10);
				scrapChance = Number(scrapChanceStr.slice(0,4));
				if (scrapChance > 1) {
					scrapChance = 1;
				}
				
				comment += "\nEnhance Offhand (" + scrapChance * 100 + "% Success Chance) - [LOVE]"
			}
			if (player.secondaryWeapon) {
				var scrapChanceStr = "" + ((11 - player.secondaryWeapon.modifications) / 10);
				scrapChance = Number(scrapChanceStr.slice(0,4));
				if (scrapChance > 1) {
					scrapChance = 1;
				}
				
				comment += "\nEnhance Secondary Weapon (" + scrapChance * 100 + "% Success Chance) - [HAHA]"
			}
			if (player.secondaryOffhand) {
				if (player.secondaryOffhand.type == 0 && !player.secondaryWeapon.twohanded) {
					var scrapChanceStr = "" + ((11 - player.secondaryOffhand.modifications) / 10);
					scrapChance = Number(scrapChanceStr.slice(0,4));
					if (scrapChance > 1) {
						scrapChance = 1;
					}
				
					comment += "\nEnhance Secondary Offhand (" + scrapChance * 100 + "% Success Chance) - [WOW]"
				}
			}
			comment += "\n\n" + getPlayerInfo();
			retryEncounter(output,comment);
			return;
			break;
		}
		player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
		player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
		player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
		
		if (currentMerchant.active) {
			switch (currentMerchant.type) {
				case 0:
				encounterType = 30
				encounter(30)
				break;
				
				case 1:
				encounterType = 35
				encounter(35)
				break;
				
				case 2:
				encounterType = 37
				encounter(37)
				break;
				
				case 3:
				encounterType = 39
				encounter(39)
				break;
					
				case 4:
				encounterType = 41
				encounter(41)
				break;
			}
		}
		else {
			turn = 1
			room ++;
			encounterOccured = false;
			awaitChoice = false;
			turnStart(true);
		}
		break;
		
		case 29:
		switch (encounterChoice) {
			case 2:
			for (i = 0; i < levelSkip; i++) {
				room++;
				if (dungeon[stage].floors[floor][room].roomType == 1) {
					room = 1;
					floor++;
					if (floor + 1 > dungeon[stage].floors.length) {
						floor = dungeon[stage].floors.length - 1;
					}
				}
				if (dungeon[stage].floors[floor][room].roomType == 2) {
					wins += 2;
				}
			}
			encounterResult = "PORTAL SIGIL ACTIVATED\n\nThe " + dungeon[stage].roomName.toLowerCase()+ " around " + player.name + " dissolves, they realize they are falling, and falling, and falling, until they hit the ground, the illusion fades and they find themselves in a completely new section of The Dungeon (Advanced deeper into The Dungeon), proceeding onwards...\n\n"
			encounterOccured = true;
			turn = 1
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 1:
			encounterResult = "STEPPED OFF PORTAL SIGIL\n\nThe " + dungeon[stage].roomName.toLowerCase()+ " around " + player.name + " snaps back as they step off the sigil, and with a crimson glow it shoots a beam of energy into the air. The after-burst of demonic energy hits the Explorer (-30 Health), proceeding onwards...\n\n"
			player.health -= 30;
			if (player.health <= 0) {
				encounterDeathMessage = "STEPPED OFF PORTAL SIGIL\n\nThe " + dungeon[stage].roomName.toLowerCase()+ " around " + player.name + " snaps back as they step off the sigil, and with a crimson glow it shoots a beam of energy into the air. The after-burst of demonic energy hits the Explorer (-30 Health), but the force was too much for " + player.name + ", and upon the floor of The Dungeon they take their final breath...\n\n"
				encounterCauseOfDeath = "killed after activating a Portal Sigil";
				loss('','',1)
			}
			else {
				turn = 1
				room ++;
				encounterOccured = true;
				turn = 1
				awaitChoice = false;
				turnStart(true);
			}
			break;
			
			case 0,3,4,5,6:
			
			break;
		}
		break;
		
		case 30:
		switch (encounterChoice) {
			case 2:
			if (currentMerchant.shop[0].sold) {
				output = "The Merchant gestures to his remaining items...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 1...");
				if (runGold >= currentMerchant.shop[0].cost) {
					runGold -= currentMerchant.shop[0].cost;
					lootReward = currentMerchant.shop[0];
					currentMerchant.shop[0] = {sold:true};
					currentMerchant.sellModifier += 3;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Merchant, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Merchant points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 30;
					encounter(30)
				}
			}
			break;
			
			case 5:
			if (currentMerchant.shop[1].sold) {
				output = "The Merchant gestures to his remaining items...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 2...");
				if (runGold >= currentMerchant.shop[1].cost) {
					runGold -= currentMerchant.shop[1].cost;
					lootReward = currentMerchant.shop[1];
					currentMerchant.shop[1] = {sold:true};
					currentMerchant.sellModifier += 2;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Merchant, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Merchant points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 30;
					encounter(30)
				}
			}
			break;
			
			case 3:
			if (currentMerchant.shop[2].sold) {
				output = "The Merchant gestures to his remaining items...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 3...");
				if (runGold >= currentMerchant.shop[2].cost) {
					runGold -= currentMerchant.shop[2].cost;
					lootReward = currentMerchant.shop[2];
					currentMerchant.shop[2] = {sold:true};
					currentMerchant.sellModifier += 1;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Merchant, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Merchant points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 30;
					encounter(30)
				}
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING ELSE\n\n" + player.name + " farewells The Merchant and continues on their way.\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0,1:
			output = "The Merchant gestures to his remaining items...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			output += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 31:
		switch (encounterChoice) {
			case 2:
			//weapons
			if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {
				var output = player.name + " gestures to their own equipment, indicating that they may like to:";
				var comment = ""
				if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
				else {
					output += "\n\nSell a weapon";
					comment += "Sell Weapons - [LIKE]\n";
				}
				if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
				else {
					output += "\n\nSell some of their armour";
					comment += "Sell Armour - [LOVE]\n";
				}
				if (!player.relic.empty) {
					output += "\n\nSell their Relic (Relic Base Worth: " + player.relic.cost + ", Sell Price: " + Math.floor((player.relic.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell Relic - [HAHA]\n";
				}
				output += "\n\nCheck comments for available moves!"
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				encounterType = 32;
				encounter(32);
			}
			break;
			
			case 5:
			//armour
			if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {
				var output = player.name + " gestures to their own equipment, indicating that they may like to:";
				var comment = ""
				if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
				else {
					output += "\n\nSell a weapon";
					comment += "Sell Weapons - [LIKE]\n";
				}
				if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
				else {
					output += "\n\nSell some of their armour";
					comment += "Sell Armour - [LOVE]\n";
				}
				if (!player.relic.empty) {
					output += "\n\nSell their Relic (Relic Base Worth: " + player.relic.cost + ", Sell Price: " + Math.floor((player.relic.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell Relic - [HAHA]\n";
				}
				output += "\n\nCheck comments for available moves!"
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				encounterType = 33;
				encounter(33);
			}
			break;
			
			case 3:
			//sell relic
			if (player.relic.empty) {
				var output = player.name + " gestures to their own equipment, indicating that they may like to:";
				var comment = ""
				if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
				else {
					output += "\n\nSell a weapon";
					comment += "Sell Weapons - [LIKE]\n";
				}
				if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
				else {
					output += "\n\nSell some of their armour";
					comment += "Sell Armour - [LOVE]\n";
				}
				if (!player.relic.empty) {
					output += "\n\nSell their Relic (Relic Base Worth: " + player.relic.cost + ", Sell Price: " + Math.floor((player.relic.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell Relic - [HAHA]\n";
				}
				output += "\n\nCheck comments for available moves!"
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.relic.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD RELIC\n\n" + player.name + " hands over their " + player.relic.name + " in exchange for " + sellPrice + " Gold!\n\n";
				
				player.relic = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:2,id:0,identifier:"[C Tier Relic]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
			
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
			
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 1:
			//cancel
			switch (currentMerchant.type) {
				case 0:
				encounterResult = player.name + " looks back at the items The Merchant has on offer.\n\n";
				encounterType = 30;
				encounter(30)
				break;
				
				case 1:
				encounterResult = player.name + " looks back at the weapons The Weaponer has on offer.\n\n";
				encounterType = 35;
				encounter(35)
				break;
				
				case 2:
				encounterResult = player.name + " looks back at the armour pieces The Armourer has on offer.\n\n";
				encounterType = 37
				encounter(37)
				break;
				
				case 3:
				encounterResult = player.name + " looks back at the relics The Relificer has on offer.\n\n";
				encounterType = 39
				encounter(39)
				break;
					
				case 4:
				encounterResult = player.name + " looks back at the items The Exoticist has on offer.\n\n";
				encounterType = 41
				encounter(41)
				break;
			}
			
			break;
			
			case 0,4,6:
			//invalid
			var output = player.name + " gestures to their own equipment, indicating that they may like to:";
			var comment = ""
			if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
			else {
				output += "\n\nSell a weapon";
				comment += "Sell Weapons - [LIKE]\n";
			}
			if (player.weapon.empty && player.offhand.empty && player.secondaryWeapon.empty && player.secondaryOffhand.empty) {}
			else {
				output += "\n\nSell some of their armour";
				comment += "Sell Armour - [LOVE]\n";
			}
			if (!player.relic.empty) {
				output += "\n\nSell their Relic (Relic Base Worth: " + player.relic.cost + ", Sell Price: " + Math.floor((player.relic.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell Relic - [HAHA]\n";
			}
			output += "\n\nCheck comments for available moves!"
			comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment);
			break;
		}
		break;
		
		case 32:
		switch (encounterChoice) {
			case 2:
			if (player.weapon.empty) {
				var output = player.name + " pulls out their weapons, indicating which they would like to sell...";
				var comment = "";
				if (player.weapon.empty) {}
				else {
					output += "\n\nTheir " + player.weapon.name + " (Weapon Base Worth: " + player.weapon.cost + ", Sell Price: " + Math.floor((player.weapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.weapon.name + " - [LIKE]\n"
				}
				if (player.offhand.empty) {}
				else {
					output += "\n\nTheir " + player.offhand.name + " (Weapon Base Worth: " + player.offhand.cost + ", Sell Price: " + Math.floor((player.offhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.offhand.name + " - [LOVE]\n"
				}
				if (player.secondaryWeapon.empty) {}
				else {
					output += "\n\nTheir " + player.secondaryWeapon.name + " (Weapon Base Worth: " + player.secondaryWeapon.cost + ", Sell Price: " + Math.floor((player.secondaryWeapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.secondaryWeapon.name + " - [HAHA]\n"
				}
				if (player.secondaryOffhand.empty) {}
				else {
					output += "\n\nTheir " + player.secondaryOffhand.name + " (Weapon Base Worth: " + player.secondaryOffhand.cost + ", Sell Price: " + Math.floor((player.secondaryOffhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.secondaryOffhand.name + " - [WOW]\n"
				}
				output += "\n\nCheck comments for available moves!";
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.weapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD WEAPON\n\n" + player.name + " hands over their " + player.weapon.name + " in exchange for " + sellPrice + " Gold!\n\n";
				if (player.weapon.twohanded) {
					player.offhand = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[C Tier Weapon - Unarmed - Requires One Hand]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
				}
				player.weapon = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[C Tier Weapon - Unarmed - Requires One Hand]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
				
				player.moves[1] = moves[player.weapon.id][1][player.movelevels[player.weapon.id][1]];
				player.moves[2] = moves[player.weapon.id][2][player.movelevels[player.weapon.id][2]];
				player.moves[3] = moves[player.weapon.id][3][player.movelevels[player.weapon.id][3]];
				player.moves[4] = moves[player.weapon.id][4][player.movelevels[player.weapon.id][4]];
				player.moves[5] = moves[player.weapon.id][5];
			
				var playerClassMove = moves[5][player.playerClass][player.movelevels[5][player.playerClass]];
				if (player.weapon.id == playerClassMove.reqWeaponID) {
					if (player.weapon.twohanded && playerClassMove.reqTwoHanded) {
						player.moves[playerClassMove.slot] = playerClassMove;
					}
					else if (!player.weapon.twohanded && playerClassMove.reqOneHanded) {
						player.moves[playerClassMove.slot] = playerClassMove;
					}
					else if (!playerClassMove.reqTwoHanded && !playerClassMove.reqOneHanded) {
						player.moves[playerClassMove.slot] = playerClassMove;
					}
				}
				if (player.offhand.type == 1 && player.offhand.id == 4 && playerClassMove.reqShield) {
					player.moves[playerClassMove.slot] = playerClassMove;
				} 
			
				i = 0;
				while (i < player.learntMoves.length) {
					move = player.learntMoves[i];
					if (move.reqWeaponID) {
						if (move.reqWeaponID == player.weapon.id) {
							if (player.weapon.twohanded && move.reqTwoHanded) {
								player.moves[move.slot] = move;
							}
							else if (!player.weapon.twohanded && move.reqOneHanded) {
								player.moves[move.slot] = move;
							}
							else if (!move.reqTwoHanded && !move.reqOneHanded) {
								player.moves[move.slot] = move;
							}
						}
					}
					else if (player.offhand.type == 1 && player.offhand.id == 4 && move.reqShield) {
						player.moves[move.slot] = move;
					}
					else if (!move.reqWeaponID && move.reqShield) {
						player.moves[move.slot] = move;
					}
					i++;
				}
			
				if (player.weapon.moveAbility) {
					player.moves[player.weapon.moveAbility.slot] = player.weapon.moveAbility;
				}
					
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;

				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 5:
			if (player.offhand.empty) {
				var output = player.name + " pulls out their weapons, indicating which they would like to sell...";
				var comment = "";
				if (player.weapon.empty) {}
				else {
					output += "\n\nTheir " + player.weapon.name + " (Weapon Base Worth: " + player.weapon.cost + ", Sell Price: " + Math.floor((player.weapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.weapon.name + " - [LIKE]\n"
				}
				if (player.offhand.empty) {}
				else {
					output += "\n\nTheir " + player.offhand.name + " (Weapon Base Worth: " + player.offhand.cost + ", Sell Price: " + Math.floor((player.offhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.offhand.name + " - [LOVE]\n"
				}
				if (player.secondaryWeapon.empty) {}
				else {
					output += "\n\nTheir " + player.secondaryWeapon.name + " (Weapon Base Worth: " + player.secondaryWeapon.cost + ", Sell Price: " + Math.floor((player.secondaryWeapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.secondaryWeapon.name + " - [HAHA]\n"
				}
				if (player.secondaryOffhand.empty) {}
				else {
					output += "\n\nTheir " + player.secondaryOffhand.name + " (Weapon Base Worth: " + player.secondaryOffhand.cost + ", Sell Price: " + Math.floor((player.secondaryOffhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.secondaryOffhand.name + " - [WOW]\n"
				}
				output += "\n\nCheck comments for available moves!";
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.offhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD WEAPON\n\n" + player.name + " hands over their " + player.offhand.name + " in exchange for " + sellPrice + " Gold!\n\n";
				
				player.offhand = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[C Tier Weapon - Unarmed - Requires One Hand]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
			
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
			
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 3:
			if (player.secondaryWeapon.empty) {
				var output = player.name + " pulls out their weapons, indicating which they would like to sell...";
				var comment = "";
				if (player.weapon.empty) {}
				else {
					output += "\n\nTheir " + player.weapon.name + " (Weapon Base Worth: " + player.weapon.cost + ", Sell Price: " + Math.floor((player.weapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.weapon.name + " - [LIKE]\n"
				}
				if (player.offhand.empty) {}
				else {
					output += "\n\nTheir " + player.offhand.name + " (Weapon Base Worth: " + player.offhand.cost + ", Sell Price: " + Math.floor((player.offhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.offhand.name + " - [LOVE]\n"
				}
				if (player.secondaryWeapon.empty) {}
				else {
					output += "\n\nTheir " + player.secondaryWeapon.name + " (Weapon Base Worth: " + player.secondaryWeapon.cost + ", Sell Price: " + Math.floor((player.secondaryWeapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.secondaryWeapon.name + " - [HAHA]\n"
				}
				if (player.secondaryOffhand.empty) {}
				else {
					output += "\n\nTheir " + player.secondaryOffhand.name + " (Weapon Base Worth: " + player.secondaryOffhand.cost + ", Sell Price: " + Math.floor((player.secondaryOffhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.secondaryOffhand.name + " - [WOW]\n"
				}
				output += "\n\nCheck comments for available moves!";
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.secondaryWeapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD WEAPON\n\n" + player.name + " hands over their " + player.secondaryWeapon.name + " in exchange for " + sellPrice + " Gold!\n\n";
				
				if (player.secondaryWeapon.twohanded) {
					player.secondaryOffhand = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[C Tier Weapon - Unarmed - Requires One Hand]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
				}
				player.secondaryWeapon = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[C Tier Weapon - Unarmed - Requires One Hand]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
			
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
			
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 4:
			if (player.secondaryOffhand.empty) {
				var output = player.name + " pulls out their weapons, indicating which they would like to sell...";
				var comment = "";
				if (player.weapon.empty) {}
				else {
					output += "\n\nTheir " + player.weapon.name + " (Weapon Base Worth: " + player.weapon.cost + ", Sell Price: " + Math.floor((player.weapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.weapon.name + " - [LIKE]\n"
				}
				if (player.offhand.empty) {}
				else {
					output += "\n\nTheir " + player.offhand.name + " (Weapon Base Worth: " + player.offhand.cost + ", Sell Price: " + Math.floor((player.offhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.offhand.name + " - [LOVE]\n"
				}
				if (player.secondaryWeapon.empty) {}
				else {
					output += "\n\nTheir " + player.secondaryWeapon.name + " (Weapon Base Worth: " + player.secondaryWeapon.cost + ", Sell Price: " + Math.floor((player.secondaryWeapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.secondaryWeapon.name + " - [HAHA]\n"
				}
				if (player.secondaryOffhand.empty) {}
				else {
					output += "\n\nTheir " + player.secondaryOffhand.name + " (Weapon Base Worth: " + player.secondaryOffhand.cost + ", Sell Price: " + Math.floor((player.secondaryOffhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.secondaryOffhand.name + " - [WOW]\n"
				}
				output += "\n\nCheck comments for available moves!";
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.secondaryOffhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD WEAPON\n\n" + player.name + " hands over their " + player.secondaryOffhand.name + " in exchange for " + sellPrice + " Gold!\n\n";
				
				player.secondaryOffhand = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[C Tier Weapon - Unarmed - Requires One Hand]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
			
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
			
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 1:
			encounterResult = player.name + " looks back at their other items.\n\n";
			encounterType = 31;
			encounter(31)
			break;
			
			case 0,6:
			var output = player.name + " pulls out their weapons, indicating which they would like to sell...";
			var comment = "";
			if (player.weapon.empty) {}
			else {
				output += "\n\nTheir " + player.weapon.name + " (Weapon Base Worth: " + player.weapon.cost + ", Sell Price: " + Math.floor((player.weapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.weapon.name + " - [LIKE]\n"
			}
			if (player.offhand.empty) {}
			else {
				output += "\n\nTheir " + player.offhand.name + " (Weapon Base Worth: " + player.offhand.cost + ", Sell Price: " + Math.floor((player.offhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.offhand.name + " - [LOVE]\n"
			}
			if (player.secondaryWeapon.empty) {}
			else {
				output += "\n\nTheir " + player.secondaryWeapon.name + " (Weapon Base Worth: " + player.secondaryWeapon.cost + ", Sell Price: " + Math.floor((player.secondaryWeapon.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.secondaryWeapon.name + " - [HAHA]\n"
			}
			if (player.secondaryOffhand.empty) {}
			else {
				output += "\n\nTheir " + player.secondaryOffhand.name + " (Weapon Base Worth: " + player.secondaryOffhand.cost + ", Sell Price: " + Math.floor((player.secondaryOffhand.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.secondaryOffhand.name + " - [WOW]\n"
			}
			output += "\n\nCheck comments for available moves!";
			comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment);
			break;
		}
		break;
		
		case 33:
		switch (encounterChoice) {
			case 2:
			if (player.head.empty) {
				var output = player.name + " motions towards their armour, indicating which they would like to sell...";
				var comment = "";
				if (player.head.empty) {}
				else {
					output += "\n\nTheir " + player.head.name + " (Weapon Base Worth: " + player.head.cost + ", Sell Price: " + Math.floor((player.head.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.head.name + " - [LIKE]\n"
				}
				if (player.body.empty) {}
				else {
					output += "\n\nTheir " + player.body.name + " (Weapon Base Worth: " + player.body.cost + ", Sell Price: " + Math.floor((player.body.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.body.name + " - [LOVE]\n"
				}
				if (player.arms.empty) {}
				else {
					output += "\n\nTheir " + player.arms.name + " (Weapon Base Worth: " + player.arms.cost + ", Sell Price: " + Math.floor((player.arms.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.arms.name + " - [HAHA]\n"
				}
				if (player.legs.empty) {}
				else {
					output += "\n\nTheir " + player.legs.name + " (Weapon Base Worth: " + player.legs.cost + ", Sell Price: " + Math.floor((player.legs.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.legs.name + " - [WOW]\n"
				}
				output += "\n\nCheck comments for available moves!";
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.head.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD ARMOUR\n\n" + player.name + " hands over their " + player.head.name + " in exchange for " + sellPrice + " Gold!\n\n";
				player.head = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:1,id:0,identifier:"[C Tier Armour - Head]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
					
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;

				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 5:
			if (player.body.empty) {
				var output = player.name + " motions towards their armour, indicating which they would like to sell...";
				var comment = "";
				if (player.head.empty) {}
				else {
					output += "\n\nTheir " + player.head.name + " (Weapon Base Worth: " + player.head.cost + ", Sell Price: " + Math.floor((player.head.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.head.name + " - [LIKE]\n"
				}
				if (player.body.empty) {}
				else {
					output += "\n\nTheir " + player.body.name + " (Weapon Base Worth: " + player.body.cost + ", Sell Price: " + Math.floor((player.body.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.body.name + " - [LOVE]\n"
				}
				if (player.arms.empty) {}
				else {
					output += "\n\nTheir " + player.arms.name + " (Weapon Base Worth: " + player.arms.cost + ", Sell Price: " + Math.floor((player.arms.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.arms.name + " - [HAHA]\n"
				}
				if (player.legs.empty) {}
				else {
					output += "\n\nTheir " + player.legs.name + " (Weapon Base Worth: " + player.legs.cost + ", Sell Price: " + Math.floor((player.legs.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.legs.name + " - [WOW]\n"
				}
				output += "\n\nCheck comments for available moves!";
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.body.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD ARMOUR\n\n" + player.name + " hands over their " + player.body.name + " in exchange for " + sellPrice + " Gold!\n\n";
				
				player.body = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:1,id:1,identifier:"[C Tier Armour - Body]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
			
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
			
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 3:
			if (player.arms.empty) {
				var output = player.name + " motions towards their armour, indicating which they would like to sell...";
				var comment = "";
				if (player.head.empty) {}
				else {
					output += "\n\nTheir " + player.head.name + " (Weapon Base Worth: " + player.head.cost + ", Sell Price: " + Math.floor((player.head.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.head.name + " - [LIKE]\n"
				}
				if (player.body.empty) {}
				else {
					output += "\n\nTheir " + player.body.name + " (Weapon Base Worth: " + player.body.cost + ", Sell Price: " + Math.floor((player.body.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.body.name + " - [LOVE]\n"
				}
				if (player.arms.empty) {}
				else {
					output += "\n\nTheir " + player.arms.name + " (Weapon Base Worth: " + player.arms.cost + ", Sell Price: " + Math.floor((player.arms.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.arms.name + " - [HAHA]\n"
				}
				if (player.legs.empty) {}
				else {
					output += "\n\nTheir " + player.legs.name + " (Weapon Base Worth: " + player.legs.cost + ", Sell Price: " + Math.floor((player.legs.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.legs.name + " - [WOW]\n"
				}
				output += "\n\nCheck comments for available moves!";
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.arms.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD WEAPON\n\n" + player.name + " hands over their " + player.arms.name + " in exchange for " + sellPrice + " Gold!\n\n";
				player.arms = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:1,id:2,identifier:"[C Tier Armour - Arms]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
			
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
			
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 4:
			if (player.legs.empty) {
				var output = player.name + " motions towards their armour, indicating which they would like to sell...";
				var comment = "";
				if (player.head.empty) {}
				else {
					output += "\n\nTheir " + player.head.name + " (Weapon Base Worth: " + player.head.cost + ", Sell Price: " + Math.floor((player.head.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.head.name + " - [LIKE]\n"
				}
				if (player.body.empty) {}
				else {
					output += "\n\nTheir " + player.body.name + " (Weapon Base Worth: " + player.body.cost + ", Sell Price: " + Math.floor((player.body.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.body.name + " - [LOVE]\n"
				}
				if (player.arms.empty) {}
				else {
					output += "\n\nTheir " + player.arms.name + " (Weapon Base Worth: " + player.arms.cost + ", Sell Price: " + Math.floor((player.arms.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.arms.name + " - [HAHA]\n"
				}
				if (player.legs.empty) {}
				else {
					output += "\n\nTheir " + player.legs.name + " (Weapon Base Worth: " + player.legs.cost + ", Sell Price: " + Math.floor((player.legs.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
					comment += "Sell " + player.legs.name + " - [WOW]\n"
				}
				output += "\n\nCheck comments for available moves!";
				comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output,comment);
			}
			else {
				var sellPrice = Math.floor((player.legs.cost / 2) * ((currentMerchant.sellModifier / 5) + 1));
				runGold += sellPrice
				
				encounterResult = "SOLD ARMOUR\n\n" + player.name + " hands over their " + player.legs.name + " in exchange for " + sellPrice + " Gold!\n\n";
				
				player.legs = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:0,id:3,identifier:"[C Tier Armour - Legs]",imgID:{type:"none",variant:0},base:1,modifications:1,tier:4,cost:0,wins:0,empty:true,durability:[0,0]}
			
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
			
				if (player.health > player.maxHealth) {
					player.health = player.maxHealth;
				}
				
				encounterType = 31;
				encounter(31);
			}
			break;
			
			case 1:
			encounterResult = player.name + " looks back at their other items.\n\n";
			encounterType = 31;
			encounter(31)
			break;
			
			case 0,6:
			var output = player.name + " motions towards their armour, indicating which they would like to sell...";
			var comment = "";
			if (player.head.empty) {}
			else {
				output += "\n\nTheir " + player.head.name + " (Weapon Base Worth: " + player.head.cost + ", Sell Price: " + Math.floor((player.head.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.head.name + " - [LIKE]\n"
			}
			if (player.body.empty) {}
			else {
				output += "\n\nTheir " + player.body.name + " (Weapon Base Worth: " + player.body.cost + ", Sell Price: " + Math.floor((player.body.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.body.name + " - [LOVE]\n"
			}
			if (player.arms.empty) {}
			else {
				output += "\n\nTheir " + player.arms.name + " (Weapon Base Worth: " + player.arms.cost + ", Sell Price: " + Math.floor((player.arms.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.arms.name + " - [HAHA]\n"
			}
			if (player.legs.empty) {}
			else {
				output += "\n\nTheir " + player.legs.name + " (Weapon Base Worth: " + player.legs.cost + ", Sell Price: " + Math.floor((player.legs.cost / 2) * ((currentMerchant.sellModifier / 5) + 1)) + ")";
				comment += "Sell " + player.legs.name + " - [WOW]\n"
			}
			output += "\n\nCheck comments for available moves!";
			comment += "Cancel - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output,comment);
			break;
		}
		break;
		
		case 34:
		switch (encounterChoice) {
			case 2:
			console.log(getTimeStamp() + "Purchased Shop Item 1...");
			if (runGold >= currentMerchant.shop[0].cost) {
				runGold -= currentMerchant.shop[0].cost;
				lootReward = currentMerchant.shop[0];
				currentMerchant.shop[0] = {sold:true};
				currentMerchant.sellModifier += 3;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the weapon from The Weaponer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Weaponer points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 35;
				encounter(35)
			}
			
			break;
			
			case 5:
			console.log(getTimeStamp() + "Purchased Shop Item 2...");
			if (runGold >= currentMerchant.shop[1].cost) {
				runGold -= currentMerchant.shop[1].cost;
				lootReward = currentMerchant.shop[1];
				currentMerchant.shop[1] = {sold:true};
				currentMerchant.sellModifier += 2;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the weapon from The Weaponer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Weaponer points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 35;
				encounter(35)
			}
			break;
			
			case 3:
			console.log(getTimeStamp() + "Purchased Shop Item 3...");
			if (runGold >= currentMerchant.shop[2].cost) {
				runGold -= currentMerchant.shop[2].cost;
				lootReward = currentMerchant.shop[2];
				currentMerchant.shop[2] = {sold:true};
				currentMerchant.sellModifier += 1;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the weapon from The Weaponer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Weaponer points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 35;
				encounter(35)
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING\n\n" + player.name + " declined The Weaponer's offer\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 4:
			enemy = generateMiniBoss(1);
			enemy.name = "The Weaponer";
			enemy.firstName = "The Weaponer";
			enemy.goldPotential *= 2;
			switch (Math.floor(Math.random() * 3)) {
				case 0:
				lootReward = currentMerchant.shop[0];
				break;
				
				case 1:
				lootReward = currentMerchant.shop[1];
				break;
				
				case 2:
				lootReward = currentMerchant.shop[2];
				break;
			}
			enemy.attack = 5;
			
			enemy.attack += currentMerchant.shop[0].attackBonus;
			enemy.attack += currentMerchant.shop[1].attackBonus;
			enemy.attack += currentMerchant.shop[2].attackBonus;
			
			enemy.defense = 5;
			
			enemy.defense += currentMerchant.shop[0].defenseBonus;
			enemy.defense += currentMerchant.shop[1].defenseBonus;
			enemy.defense += currentMerchant.shop[2].defenseBonus;
			
			enemy.maxHealth += currentMerchant.shop[0].healthBonus;
			enemy.maxHealth += currentMerchant.shop[1].healthBonus;
			enemy.maxHealth += currentMerchant.shop[2].healthBonus;
			
			enemyTempDefense = enemy.defense;
			
			enemy.health = enemy.maxHealth;
			
			enemy.ranReward = false;
			currentMerchant.active = false;
			turn = 1
			encounterResult = "ATTEMPTED TO ROB THE WEAPONER\n\n" + player.name + " seizes an opportunity, drawing their weapon and advancing towards The Weaponer. In an instant, their target arms themselves with the items from the table and leaps towards " + player.name + ", beginning fight...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			attacked = true;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0:
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "WEAPONER ON " + getLocation() + "\n\nOn this floor it appears a merchant specializing in weapons has set up shop deep within The Dungeon peddling his wares. After purchasing " + player.name + "'s spare items he points towards the three different weapons in front of him...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA]  \nSell Items - [SAD]\nAttempt to Rob The Weaponer - [WOW] \nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 35:
		switch (encounterChoice) {
			case 2:
			if (currentMerchant.shop[0].sold) {
				output = "The Weaponer gestures to his remaining weapons...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 1...");
				if (runGold >= currentMerchant.shop[0].cost) {
					runGold -= currentMerchant.shop[0].cost;
					lootReward = currentMerchant.shop[0];
					currentMerchant.shop[0] = {sold:true};
					currentMerchant.sellModifier += 3;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the weapon from The Weaponer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Weaponer points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 35;
					encounter(35)
				}
			}
			break;
			
			case 5:
			if (currentMerchant.shop[1].sold) {
				output = "The Weaponer gestures to his remaining weapons...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 2...");
				if (runGold >= currentMerchant.shop[1].cost) {
					runGold -= currentMerchant.shop[1].cost;
					lootReward = currentMerchant.shop[1];
					currentMerchant.shop[1] = {sold:true};
					currentMerchant.sellModifier += 2;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the weapon from The Weaponer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Weaponer points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 35;
					encounter(35)
				}
			}
			break;
			
			case 3:
			if (currentMerchant.shop[2].sold) {
				output = "The Weaponer gestures to his remaining weapons...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 3...");
				if (runGold >= currentMerchant.shop[2].cost) {
					runGold -= currentMerchant.shop[2].cost;
					lootReward = currentMerchant.shop[2];
					currentMerchant.shop[2] = {sold:true};
					currentMerchant.sellModifier += 1;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the weapon from The Weaponer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Weaponer points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 35;
					encounter(35)
				}
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING ELSE\n\n" + player.name + " farewells The Weaponer and continues on their way.\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0,1:
			output = "The Weaponer gestures to his remaining weapons...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			output += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 36:
		switch (encounterChoice) {
			case 2:
			console.log(getTimeStamp() + "Purchased Shop Item 1...");
			if (runGold >= currentMerchant.shop[0].cost) {
				runGold -= currentMerchant.shop[0].cost;
				lootReward = currentMerchant.shop[0];
				currentMerchant.shop[0] = {sold:true};
				currentMerchant.sellModifier += 3;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the armour piece from The Armourist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Armourist points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 37;
				encounter(37)
			}
			
			break;
			
			case 5:
			console.log(getTimeStamp() + "Purchased Shop Item 2...");
			if (runGold >= currentMerchant.shop[1].cost) {
				runGold -= currentMerchant.shop[1].cost;
				lootReward = currentMerchant.shop[1];
				currentMerchant.shop[1] = {sold:true};
				currentMerchant.sellModifier += 2;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the armour piece from The Armourist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Armourist points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 37;
				encounter(37)
			}
			break;
			
			case 3:
			console.log(getTimeStamp() + "Purchased Shop Item 3...");
			if (runGold >= currentMerchant.shop[2].cost) {
				runGold -= currentMerchant.shop[2].cost;
				lootReward = currentMerchant.shop[2];
				currentMerchant.shop[2] = {sold:true};
				currentMerchant.sellModifier += 1;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the armour piece from The Armourist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Armourist points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 37;
				encounter(37)
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING\n\n" + player.name + " declined The Armourist's offer\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 4:
			enemy = generateMiniBoss(2);
			enemy.name = "The Armourist";
			enemy.firstName = "The Armourist";
			enemy.goldPotential *= 2;
			switch (Math.floor(Math.random() * 3)) {
				case 0:
				lootReward = currentMerchant.shop[0];
				break;
				
				case 1:
				lootReward = currentMerchant.shop[1];
				break;
				
				case 2:
				lootReward = currentMerchant.shop[2];
				break;
			}
			enemy.attack = 5;
			
			enemy.attack += currentMerchant.shop[0].attackBonus;
			enemy.attack += currentMerchant.shop[1].attackBonus;
			enemy.attack += currentMerchant.shop[2].attackBonus;
			
			enemy.defense = 5;
			
			enemy.defense += currentMerchant.shop[0].defenseBonus;
			enemy.defense += currentMerchant.shop[1].defenseBonus;
			enemy.defense += currentMerchant.shop[2].defenseBonus;
			
			enemy.maxHealth += currentMerchant.shop[0].healthBonus;
			enemy.maxHealth += currentMerchant.shop[1].healthBonus;
			enemy.maxHealth += currentMerchant.shop[2].healthBonus;
			
			enemy.health = enemy.maxHealth;
			
			enemyTempDefense = enemy.defense;
			
			enemy.ranReward = false;
			currentMerchant.active = false;
			turn = 1
			encounterResult = "ATTEMPTED TO ROB THE ARMOURIST\n\n" + player.name + " seizes an opportunity, drawing their weapon and advancing towards The Armourist. In an instant, their target arms themselves with the items from the table and leaps towards " + player.name + ", beginning fight...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			attacked = true;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0:
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "ARMOURIST ON " + getLocation() + "\n\nOn this floor it appears a merchant specializing in armour pieces has set up shop deep within The Dungeon peddling his wares. After purchasing " + player.name + "'s spare items he points towards the three different weapons in front of him...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nSell Items - [SAD]\nAttempt to Rob The Weaponer - [WOW] \nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 37:
		switch (encounterChoice) {
			case 2:
			if (currentMerchant.shop[0].sold) {
				output = "The Armourist gestures to his remaining armour pieces...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 1...");
				if (runGold >= currentMerchant.shop[0].cost) {
					runGold -= currentMerchant.shop[0].cost;
					lootReward = currentMerchant.shop[0];
					currentMerchant.shop[0] = {sold:true};
					currentMerchant.sellModifier += 3;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the armour piece from The Armourist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Armourist points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 37;
					encounter(37)
				}
			}
			break;
			
			case 5:
			if (currentMerchant.shop[1].sold) {
				output = "The Armourist gestures to his remaining armour pieces...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 2...");
				if (runGold >= currentMerchant.shop[1].cost) {
					runGold -= currentMerchant.shop[1].cost;
					lootReward = currentMerchant.shop[1];
					currentMerchant.shop[1] = {sold:true};
					currentMerchant.sellModifier += 2;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the armour piece from The Armourist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Armourist points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 37;
					encounter(37)
				}
			}
			break;
			
			case 3:
			if (currentMerchant.shop[2].sold) {
				output = "The Armourist gestures to his remaining armour pieces...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 3...");
				if (runGold >= currentMerchant.shop[2].cost) {
					runGold -= currentMerchant.shop[2].cost;
					lootReward = currentMerchant.shop[2];
					currentMerchant.shop[2] = {sold:true};
					currentMerchant.sellModifier += 1;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the armour piece from The Armourist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Armourist points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 37;
					encounter(37)
				}
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING ELSE\n\n" + player.name + " farewells The Armourist and continues on their way.\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0,1:
			output = "The Armourist gestures to his remaining armour pieces...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			output += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 38:
		switch (encounterChoice) {
			case 2:
			console.log(getTimeStamp() + "Purchased Shop Item 1...");
			if (runGold >= currentMerchant.shop[0].cost) {
				runGold -= currentMerchant.shop[0].cost;
				lootReward = currentMerchant.shop[0];
				currentMerchant.shop[0] = {sold:true};
				currentMerchant.sellModifier += 3;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the relic from The Relificer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Relificer points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 39;
				encounter(39)
			}
			
			break;
			
			case 5:
			console.log(getTimeStamp() + "Purchased Shop Item 2...");
			if (runGold >= currentMerchant.shop[1].cost) {
				runGold -= currentMerchant.shop[1].cost;
				lootReward = currentMerchant.shop[1];
				currentMerchant.shop[1] = {sold:true};
				currentMerchant.sellModifier += 2;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the relic from The Relificer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Relificer points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 39;
				encounter(39)
			}
			break;
			
			case 3:
			console.log(getTimeStamp() + "Purchased Shop Item 3...");
			if (runGold >= currentMerchant.shop[2].cost) {
				runGold -= currentMerchant.shop[2].cost;
				lootReward = currentMerchant.shop[2];
				currentMerchant.shop[2] = {sold:true};
				currentMerchant.sellModifier += 1;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the relic from The Relificer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Relificer points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 39;
				encounter(39)
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING\n\n" + player.name + " declined The Relificer's offer\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 4:
			enemy = generateMiniBoss(3);
			enemy.name = "The Relificer";
			enemy.firstName = "The Relificer";
			enemy.goldPotential *= 2;
			switch (Math.floor(Math.random() * 3)) {
				case 0:
				lootReward = currentMerchant.shop[0];
				break;
				
				case 1:
				lootReward = currentMerchant.shop[1];
				break;
				
				case 2:
				lootReward = currentMerchant.shop[2];
				break;
			}
			enemy.attack = 5;
			
			enemy.attack += currentMerchant.shop[0].attackBonus;
			enemy.attack += currentMerchant.shop[1].attackBonus;
			enemy.attack += currentMerchant.shop[2].attackBonus;
			
			enemy.defense = 5;
			
			enemy.defense += currentMerchant.shop[0].defenseBonus;
			enemy.defense += currentMerchant.shop[1].defenseBonus;
			enemy.defense += currentMerchant.shop[2].defenseBonus;
			
			enemy.maxHealth += currentMerchant.shop[0].healthBonus;
			enemy.maxHealth += currentMerchant.shop[1].healthBonus;
			enemy.maxHealth += currentMerchant.shop[2].healthBonus;
			
			enemy.health = enemy.maxHealth;
			
			enemyTempDefense = enemy.defense;
			
			enemy.ranReward = false;
			currentMerchant.active = false;
			turn = 1
			encounterResult = "ATTEMPTED TO ROB THE RELIFICER\n\n" + player.name + " seizes an opportunity, drawing their weapon and advancing towards The Relificer. In an instant, their target arms themselves with the items from the table and leaps towards " + player.name + ", beginning fight...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			attacked = true;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0:
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "RELIFICER ON " + getLocation() + "\n\nOn this floor it appears a merchant specializing in relics has set up shop deep within The Dungeon peddling her wares. After purchasing " + player.name + "'s spare items she points towards the three different weapons in front of her...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nSell Items - [SAD]\nAttempt to Rob The Weaponer - [WOW] \nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 39:
		switch (encounterChoice) {
			case 2:
			if (currentMerchant.shop[0].sold) {
				output = "The Relificer gestures to her remaining relics...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 1...");
				if (runGold >= currentMerchant.shop[0].cost) {
					runGold -= currentMerchant.shop[0].cost;
					lootReward = currentMerchant.shop[0];
					currentMerchant.shop[0] = {sold:true};
					currentMerchant.sellModifier += 3;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the relic from The Relificer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Relificer points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 39;
					encounter(39)
				}
			}
			break;
			
			case 5:
			if (currentMerchant.shop[1].sold) {
				output = "The Relificer gestures to her remaining relics...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 2...");
				if (runGold >= currentMerchant.shop[1].cost) {
					runGold -= currentMerchant.shop[1].cost;
					lootReward = currentMerchant.shop[1];
					currentMerchant.shop[1] = {sold:true};
					currentMerchant.sellModifier += 2;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the relic from The Relificer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Relificer points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 39;
					encounter(39)
				}
			}
			break;
			
			case 3:
			if (currentMerchant.shop[2].sold) {
				output = "The Relificer gestures to her remaining relics...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 3...");
				if (runGold >= currentMerchant.shop[2].cost) {
					runGold -= currentMerchant.shop[2].cost;
					lootReward = currentMerchant.shop[2];
					currentMerchant.shop[2] = {sold:true};
					currentMerchant.sellModifier += 1;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the relic from The Relificer, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Relificer points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 39;
					encounter(39)
				}
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING ELSE\n\n" + player.name + " farewells The Relificer and continues on their way.\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0,1:
			output = "The Relificer gestures to her remaining relics...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			output += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 40:
		switch (encounterChoice) {
			case 2:
			console.log(getTimeStamp() + "Purchased Shop Item 1...");
			if (runGold >= currentMerchant.shop[0].cost) {
				runGold -= currentMerchant.shop[0].cost;
				lootReward = currentMerchant.shop[0];
				currentMerchant.shop[0] = {sold:true};
				currentMerchant.sellModifier += 2;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the item from The Exoticist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Exoticist points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 41;
				encounter(41)
			}
			
			break;
			
			case 5:
			console.log(getTimeStamp() + "Purchased Shop Item 2...");
			if (runGold >= currentMerchant.shop[1].cost) {
				runGold -= currentMerchant.shop[1].cost;
				lootReward = currentMerchant.shop[1];
				currentMerchant.shop[1] = {sold:true};
				currentMerchant.sellModifier += 2;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the relic from The Exoticist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Exoticist points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 41;
				encounter(41)
			}
			break;
			
			case 3:
			console.log(getTimeStamp() + "Purchased Shop Item 3...");
			if (runGold >= currentMerchant.shop[2].cost) {
				runGold -= currentMerchant.shop[2].cost;
				lootReward = currentMerchant.shop[2];
				currentMerchant.shop[2] = {sold:true};
				currentMerchant.sellModifier += 2;
				turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the relic from The Exoticist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
				awaitChoice = true;
				encounterType = 8;
				encounter(8);
			}
			else {
				encounterResult = "NOT ENOUGH GOLD\n\nThe Exoticist points out that " + player.name + " does not have enough gold for that item.\n\n"
				encounterType = 41;
				encounter(41)
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING\n\n" + player.name + " declined The Exoticist's offer\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 4:
			enemy = generateMiniBoss(4);
			enemy.name = "The Exoticist";
			enemy.firstName = "The Exoticist";
			enemy.goldPotential *= 2;
			switch (Math.floor(Math.random() * 3)) {
				case 0:
				lootReward = currentMerchant.shop[0];
				break;
				
				case 1:
				lootReward = currentMerchant.shop[1];
				break;
				
				case 2:
				lootReward = currentMerchant.shop[2];
				break;
			}
			enemy.attack = 5;
			
			enemy.attack += currentMerchant.shop[0].attackBonus;
			enemy.attack += currentMerchant.shop[1].attackBonus;
			enemy.attack += currentMerchant.shop[2].attackBonus;
			
			enemy.defense = 5;
			
			enemy.defense += currentMerchant.shop[0].defenseBonus;
			enemy.defense += currentMerchant.shop[1].defenseBonus;
			enemy.defense += currentMerchant.shop[2].defenseBonus;
			
			enemy.maxHealth += currentMerchant.shop[0].healthBonus;
			enemy.maxHealth += currentMerchant.shop[1].healthBonus;
			enemy.maxHealth += currentMerchant.shop[2].healthBonus;
			
			enemy.health = enemy.maxHealth;
			
			enemyTempDefense = enemy.defense;
			
			enemy.ranReward = false;
			currentMerchant.active = false;
			turn = 1
			encounterResult = "ATTEMPTED TO ROB THE EXOTICIST\n\n" + player.name + " seizes an opportunity, drawing their weapon and advancing towards The Exoticist. In an instant, their target arms themselves with the items from the table and leaps towards " + player.name + ", beginning fight...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			attacked = true;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0:
			console.log(getTimeStamp() + "Invalid Choice...");
			var output = "EXOTICIST ON " + getLocation() + "\n\nOn this floor it appears a merchant specializing in rare items has set up shop deep within The Dungeon peddling her wares. After purchasing " + player.name + "'s spare items she points towards the three different items in front of her...\n\n" + currentMerchant.shop[0].name + " (" + currentMerchant.shop[0].cost + " gold)\n" + currentMerchant.shop[0].identifier + "\n" + currentMerchant.shop[0].attackBonus + " Attack\n" + currentMerchant.shop[0].defenseBonus + " Defense\n" + currentMerchant.shop[0].healthBonus + " Health/Max Health\n" + currentMerchant.shop[0].modifications + " Modifications\n\n" + currentMerchant.shop[1].name + " (" + currentMerchant.shop[1].cost + " gold)\n" + currentMerchant.shop[1].identifier + "\n" + currentMerchant.shop[1].attackBonus + " Attack\n" + currentMerchant.shop[1].defenseBonus + " Defense\n" + currentMerchant.shop[1].healthBonus + " Health/Max Health\n" + currentMerchant.shop[1].modifications + " Modifications\n\n" + currentMerchant.shop[2].name + " (" + currentMerchant.shop[2].cost + " gold)\n" + currentMerchant.shop[2].identifier + "\n" + currentMerchant.shop[2].attackBonus + " Attack\n" + currentMerchant.shop[2].defenseBonus + " Defense\n" + currentMerchant.shop[2].healthBonus + " Health/Max Health\n" + currentMerchant.shop[2].modifications + " Modifications\n\nCurrent Gold = " + runGold + "\nHowever, the shop seems to be relatively undefended, perhaps there is another option...\n\nCheck comments for available moves!";
			var comment = "Purchase " + currentMerchant.shop[0].name + " - [LIKE] \nPurchase " + currentMerchant.shop[1].name + " - [LOVE] \nPurchase " + currentMerchant.shop[2].name + " - [HAHA] \nSell Items - [SAD]\nAttempt to Rob The Weaponer - [WOW] \nPurchase nothing - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 41:
		switch (encounterChoice) {
			case 2:
			if (currentMerchant.shop[0].sold) {
				output = "The Exoticist gestures to her remaining items...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 1...");
				if (runGold >= currentMerchant.shop[0].cost) {
					runGold -= currentMerchant.shop[0].cost;
					lootReward = currentMerchant.shop[0];
					currentMerchant.shop[0] = {sold:true};
					currentMerchant.sellModifier += 3;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Exoticist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Exoticist points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 41;
					encounter(41)
				}
			}
			break;
			
			case 5:
			if (currentMerchant.shop[1].sold) {
				output = "The Exoticist gestures to her remaining items...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 2...");
				if (runGold >= currentMerchant.shop[1].cost) {
					runGold -= currentMerchant.shop[1].cost;
					lootReward = currentMerchant.shop[1];
					currentMerchant.shop[1] = {sold:true};
					currentMerchant.sellModifier += 2;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Exoticist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Exoticist points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 41;
					encounter(41)
				}
			}
			break;
			
			case 3:
			if (currentMerchant.shop[2].sold) {
				output = "The Exoticist gestures to her remaining items...\n\n";
				var comment = "";
				var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
				for (i = 0; i < currentMerchant.shop.length; i++) {
					if (!currentMerchant.shop[i].sold) {
						output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
						comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
					}
				}
				output += "Check comments for available moves!"
				comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
				retryEncounter(output, comment);
			}
			else {
				console.log(getTimeStamp() + "Purchased Shop Item 3...");
				if (runGold >= currentMerchant.shop[2].cost) {
					runGold -= currentMerchant.shop[2].cost;
					lootReward = currentMerchant.shop[2];
					currentMerchant.shop[2] = {sold:true};
					currentMerchant.sellModifier += 1;
					turnSummary = "PURCHASED THE " + lootReward.name.toUpperCase() + "\n\n" + player.name + " purchases the piece of equipment from The Exoticist, who happily takes their gold (-" + lootReward.cost + " Gold) in exchange for the item.\n\n"
					awaitChoice = true;
					encounterType = 8;
					encounter(8);
				}
				else {
					encounterResult = "NOT ENOUGH GOLD\n\nThe Exoticist points out that " + player.name + " does not have enough gold for that item.\n\n"
					encounterType = 41;
					encounter(41)
				}
			}
			break;
			
			case 1:
			console.log(getTimeStamp() + "Purchased Nothing...");
			currentMerchant.active = false;
			turn = 1
			room ++;
			encounterResult = "PURCHASED NOTHING ELSE\n\n" + player.name + " farewells The Exoticist and continues on their way.\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 6:
			encounterType = 31;
			encounter(31);
			break;
			
			case 0,1:
			output = "The Exoticist gestures to her remaining items...\n\n";
			var comment = "";
			var itemSlots = ["[LIKE]","[LOVE]","[HAHA]"]
			for (i = 0; i < currentMerchant.shop.length; i++) {
				if (!currentMerchant.shop[i].sold) {
					output  += currentMerchant.shop[i].name + " (" + currentMerchant.shop[i].cost + " gold)\n" + currentMerchant.shop[i].identifier + "\n" + currentMerchant.shop[i].attackBonus + " Attack\n" + currentMerchant.shop[i].defenseBonus + " Defense\n" + currentMerchant.shop[i].healthBonus + " Health/Max Health\n" + currentMerchant.shop[i].modifications + " Modifications\n\n"
					comment += "Purchase " + currentMerchant.shop[i].name + " - " + itemSlots[i] + "\n"
				}
			}
			output += "Check comments for available moves!"
			comment += "Sell Items - [SAD]\nPurchase nothing else - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment);
			break;
		}
		break;
		
		case 42:
		switch (encounterChoice) {
			case 2:
			//half armour
			player.defenseVar = Math.floor((player.defense - player.defenseCore) / 2) * -1
			encounterResult = "SWAM TO THE ISLAND\n\n" + player.name + " sheds half of their armour (" + player.defenseVar + " Defense) and begins the swim. As they reach the halfway point The Lake turns to thunder without warning, and the Explorer barely manages to navigate the growing waves. With a great effort they dive below the surface into the somewhat calmer waters, and eventually they reach The Island...\n\n"
			encounterType = 44;
			encounter(44);
			break;
			
			case 5:
			//full armour
			if (Math.random() > 0.75) {
				//fail
				encounterType = 43;
				encounter(43);
			}
			else {
				//success
				encounterResult = "SWAM TO THE ISLAND\n\n" + player.name + " begins the swim. As they reach the halfway point The Lake turns to thunder without warning, and the Explorer barely manages to navigate the growing waves. With a great effort they dive below the surface into the somewhat calmer waters, and eventually they reach The Island...\n\n"
				encounterType = 44;
				encounter(44);
			}
			break;
			
			case 1:
			//ignore
			turn = 1
			room ++;
			switch (Math.floor(Math.random() * 3)) {
				case 0:
				encounterResult = "STAYED OUT OF THE LAKE\n\n" + player.name + " decides they'd rather not risk their life for the mysterious island, which seems to have vanished into the fog, proceeding onwards...\n\n"
				break;
				
				case 1:
				encounterResult = "STAYED OUT OF THE LAKE\n\n" + player.name + " decides they'd rather not risk their life for the mysterious island, which mocks the Explorer as they depart, proceeding onwards...\n\n"
				break;
				
				case 2:
				encounterResult = "STAYED OUT OF THE LAKE\n\n" + player.name + " decides they'd rather not risk their life for the mysterious island, and as they turn away they hear the sharp cry of something else hidden in the lake. They breathe a sigh of relief, glad to have not entered the water, proceeding onwards...\n\n"
				break;
			}
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 0,3,4,6:
			var output = "HIDDEN LAKE " + getLocation() + "\n\n" + player.name + " enters the " + dungeon[stage].roomName.toLowerCase() + " to find a vast misty lake. A narrow but otherwise safe path skirts it's edge leading towards the chamber's exit, but through the fog there appears to be a small island, upon which looks to be a mysterious object. Swimming out to the island would prove to verify it's existence, but to do so safely the Explorer would have to shed most of their armour, and who knows what other secrets the fog hides...\n\nCheck comments for available moves!";
			var comment = "Swim out to The Island with half armour - [LIKE]\nSwim out to The Island with full armour - [LOVE]\nKeep to the water's edge - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment)
			break;
		}
		break;
		
		case 43:
		switch (encounterChoice) {
			case 1:
			//keep swimming
			player.health -= 30;
			if (player.health <= 0) {
				encounterDeathMessage = "KEPT SWIMMING\n\n" + player.name + " keeps swimming. They fight hard against the churning waters (-30 Health), but their previous injuries have weakened them such that they cannot continue. Water fills their helpless lungs as thrashing The Lake swallows them without resistance...\n\n"
				encounterCauseOfDeath = "drowned in The Lake";
				loss('','',1);
				return;
			}
			else {
				encounterResult = "KEPT SWIMMING\n\n" + player.name + " keeps swimming. They fight hard against the churning waters (-30 Health), and manage to reach The Island...\n\n"
			}
			encounterType = 44;
			encounter(44);
			break;
			
			case 2:
			//turn back
			turn = 1
			room ++;
			encounterResult = "TURNED BACK\n\n" + player.name + " heads back to shore, slightly battered by the storm but otherwise intact, proceeding onwards...\n\n"
			encounterOccured = true;
			awaitChoice = false;
			turnStart(true);
			break;
			
			case 3:
			//ditch body armour
			if (!player.body.empty) {
				encounterChoice = 0;
			}
			else {
				encounterResult = "DISCARDED '" + player.body.name.toUpperCase() + "'!\n\n" + player.name + " frantically removes their body armour as they struggle to remain at the surface, and watches regretfully as it sinks beneath the waves (Lost " + player.body.name + ")...\n\n"
				player.body = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:1,id:1,identifier:"[C Tier Armour - Body]",imgID:{"type":"none","variant":0},base:1,modifications:1,tier:4,cost:0,wins:1,empty:true,durability:[0,0]}
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				encounterType = 44;
				encounter(44);
			}
			break;
			
			case 4:
			//ditch arm armour
			if (!player.arms.empty) {
				encounterChoice = 0;
			}
			else {
				encounterResult = "DISCARDED '" + player.legs.name.toUpperCase() + "'!\n\n" + player.name + " frantically removes their arm armour as they struggle to remain at the surface, and watches regretfully as it sinks beneath the waves (Lost " + player.arms.name + ")...\n\n"
				player.arms = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:1,id:2,identifier:"[C Tier Armour - Arms]",imgID:{"type":"none","variant":0},base:1,modifications:1,tier:4,cost:0,wins:1,empty:true,durability:[0,0]}
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				encounterType = 44;
				encounter(44);
			}
			break;
			
			case 5:
			//ditch head armour
			if (player.head.empty) {
				encounterChoice = 0;
			}
			else {
				encounterResult = "DISCARDED '" + player.legs.name.toUpperCase() + "'!\n\n" + player.name + " frantically removes their helmet as they struggle to remain at the surface, and watches regretfully as it sinks beneath the waves (Lost " + player.head.name + ")...\n\n"
				player.head = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:1,id:0,identifier:"[C Tier Armour - head]",imgID:{"type":"none","variant":0},base:1,modifications:1,tier:4,cost:0,wins:1,empty:true,durability:[0,0]}
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				encounterType = 44;
				encounter(44);
			}
			break;
			
			case 6:
			//ditch leg armour
			if (!player.legs.empty) {
				encounterChoice = 0;
			}
			else {
				encounterResult = "DISCARDED '" + player.legs.name.toUpperCase() + "'!\n\n" + player.name + " frantically removes their leg armour as they struggle to remain at the surface, and watches regretfully as it sinks beneath the waves (Lost " + player.legs.name + ")...\n\n"
				player.legs = {name:"Empty",attackBonus:0,defenseBonus:0,healthBonus:0,type:1,id:3,identifier:"[C Tier Armour - Legs]",imgID:{"type":"none","variant":0},base:1,modifications:1,tier:4,cost:0,wins:1,empty:true,durability:[0,0]}
				player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
				player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
				player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
				encounterType = 44;
				encounter(44);
			}
			break;
			
			case 0:
			var output = "DROWNING\n\nWithout warning waves roll across The Lake like thunder as " + player.name + " reaches the halfway point. They struggle against the surge, but it only gets worse the further they stray from the shore, they struggle for air as their armour threatens to pull them under. To continue to The Island safely they would have to shed a piece, but if they turned back now they would be able to keep their gear intact, or perhaps they could risk everything and just keep swimming...\n\nCheck comments for available moves!";
			var comment = "Turn back - [LIKE]\n"
			if (!player.head.empty) {
				comment += "Discard '" + player.head.name + "' - [LOVE]\n"
			}
			if (!player.body.empty) {
				comment += "Discard '" + player.body.name + "' - [HAHA]\n"
			}
			if (!player.arms.empty) {
				comment += "Discard '" + player.arms.name + "' - [WOW]\n"
			}
			if (!player.legs.empty) {
				comment += "Discard '" + player.legs.name + "' - [SAD]\n"
			}
			comment += "Keep swimming - [ANGRY]\n\n" + getPlayerInfo();
			retryEncounter(output, comment)
			break;
		}
		break;
		
		case 44:
		switch (encounterChoice) {
			case 5:
			lootReward = generateLoot({name:"The Sword",type:0,id:0,twohanded:true,tier:7,modifications:1});
			enemy = generateBoss()
			break;
			
			case 1:
			
			break;
			
			case 0,2,3,4,6:
			
			break;
		}
		break;
	}
}

function shopItem(quality,setRewardType,setRewardID) {
	console.log(getTimeStamp() + "Generating Shop Item...");
	if (setRewardType) {
		var rewardType = (setRewardType - 1);
	}
	else {
		var rewardType = Math.floor(Math.random() * (3));
	}
	if (Math.random() < 0.5) {
			var attackRewardType = Math.floor(Math.random() * (dungeon[stage].weapons.length));
		}
		else if (setRewardID) {
			var attackRewardType = setRewardID
		}
		else {
			var attackRewardType = player.weapon.id
		}
	var attackRewardID = Math.floor(Math.random() * (dungeon[stage].weapons[attackRewardType].length));
	var attackReward = dungeon[stage].weapons[attackRewardType][attackRewardID].name;
	var defenseReward = Math.floor(Math.random() * (dungeon[stage].armour.length));
	if (setRewardID) {
		defenseReward = setRewardID;
	}
	var defenseRewardRanName = Math.floor(Math.random() * (dungeon[stage].armour[defenseReward].length));
	var defenseRewardName = dungeon[stage].armour[defenseReward][defenseRewardRanName].name;
	var healthReward = Math.floor(Math.random() * (dungeon[stage].relics.length));
	var genWins = wins;
	switch (rewardType) {
		case 0:
		var attackBonus = 1;
		if (player.weapon.attackBonus != 0) {
			if (dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded) {
				attackBonus = Math.floor(player.equipmentBase.weapon * weaponConversionMatrix[attackRewardType][1] + Math.floor(Math.random() * 2));
			}
			else {
				attackBonus = Math.floor(player.equipmentBase.weapon * weaponConversionMatrix[attackRewardType][0] + Math.floor(Math.random() * 2));
			}
		}
		if (checkAbility(player,1) && dungeon[stage].weapons[attackRewardType][attackRewardID].imgID.type == "dagger") {
			//Master of Knives ability
			attackBonus += 2;
		}
		if (checkAbility(player,7) && dungeon[stage].weapons[attackRewardType][attackRewardID].imgID.type == "sword") {
			//Skilled Swordsman ability
			attackBonus += 2;
		}
		if (checkAbility(player,8) && dungeon[stage].weapons[attackRewardType][attackRewardID].imgID.type == "bow") {
			//Expert Archer ability
			attackBonus += 2;
		}
		if (checkAbility(player,9) && dungeon[stage].weapons[attackRewardType][attackRewardID].imgID.type == "axe") {
			//Master of Heavy Weaponry ability
			attackBonus += 4;
		}
		var defenseBonus = 0;
		if (checkAbility(player,4) && attackRewardType == 2) {
			defenseBonus = 2;
		}
		var healthBonus = 0;
		var itemID = attackRewardType;
		var Modifications = Math.floor(Math.random() * 3 + 1);
		var itemTier = shopItemTiers[quality][Math.floor(Math.random() * shopItemTiers[quality].length)];
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var shopItemName = rewardPrefixes[itemTier][rewardPrefix] + attackReward;
		var cost = Math.floor(attackBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / Modifications) * ((itemTier ** 2) / 16));
		var rewardImgID = dungeon[stage].weapons[attackRewardType][attackRewardID].imgID;
		break;
		
		case 1:
		var attackBonus = 0;
		switch (defenseReward) {
				case 0:
				var defenseBonus = player.equipmentBase.head + Math.floor(Math.random() * 2);
				if (player.head.defenseBonus == 0 && defenseBonus == 0) {
					defenseBonus = 1;
				}
				break;
				
				case 1:
				var defenseBonus = player.equipmentBase.body + Math.floor(Math.random() * 2);
				if (player.body.defenseBonus == 0 && defenseBonus == 0) {
					defenseBonus = 1;
				}
				break;
				
				case 2:
				var defenseBonus = player.equipmentBase.arms + Math.floor(Math.random() * 2);
				if (player.arms.defenseBonus == 0 && defenseBonus == 0) {
					defenseBonus = 1;
				}
				break;
				
				case 3:
				var defenseBonus = player.equipmentBase.legs + Math.floor(Math.random() * 2);
				if (player.legs.defenseBonus == 0 && defenseBonus == 0) {
					defenseBonus = 1;
				}
				break;
				
				case 4:
				var defenseBonus = player.equipmentBase.offhand + Math.floor(Math.random() * 2);
				if (player.offhand.defenseBonus == 0 && defenseBonus == 0) {
					defenseBonus = 1;
				}
				break;
			}
		var healthBonus = 0;
		var itemID = defenseReward;
		var Modifications = Math.floor(Math.random() * 3 + 1);
		var itemTier = shopItemTiers[quality][Math.floor(Math.random() * shopItemTiers[quality].length)];
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var shopItemName = rewardPrefixes[itemTier][rewardPrefix] + defenseRewardName;
		var cost = Math.floor(defenseBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / Modifications) * ((itemTier ** 2) / 16));
		var rewardImgID = dungeon[stage].armour[defenseReward][defenseRewardRanName].imgID;
		break;
		
		case 2:
		var attackBonus = 0;
		var defenseBonus = 0;
		var healthBonus = player.equipmentBase.relic + Math.floor(Math.random() * 6);
		var itemID = 0;
		var Modifications = Math.floor(Math.random() * 3 + 1);
		var itemTier = shopItemTiers[quality][Math.floor(Math.random() * shopItemTiers[quality].length)];
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var shopItemName = rewardPrefixes[itemTier][rewardPrefix] + dungeon[stage].relics[healthReward].name;
		var cost = Math.floor(healthBonus * 1 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / Modifications) * ((itemTier ** 2) / 16));
		var rewardImgID = dungeon[stage].relics[healthReward].imgID;
		break;
	}
	if (rewardType == 0) {
		if (dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded) {
			var itemIdentifier = "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType] + " - " + weaponTypes[itemID] + " - Requires Two Hands]";
		}
		else {
			var itemIdentifier = "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType] + " - " + weaponTypes[itemID] + " - Requires One Hand]";
		}
		var shopItem = {name: shopItemName,attackBonus:attackBonus,defenseBonus:defenseBonus,healthBonus:healthBonus,type:rewardType,id:itemID,twohanded:dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded,cost:cost,identifier:itemIdentifier,modifications:Modifications,tier:itemTier,wins:genWins,imgID:rewardImgID,durability:tierDurability[itemTier]};
	}
	else if (rewardType == 1) {
		var shopItem = {name: shopItemName,attackBonus:attackBonus,defenseBonus:defenseBonus,healthBonus:healthBonus,type:rewardType,id:itemID,cost:cost,identifier: "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType] + " - " + armourTypes[itemID] + "]",modifications:Modifications,tier:itemTier,wins:genWins,imgID:rewardImgID,durability:tierDurability[itemTier]};
	}
	else {
		var shopItem = {name: shopItemName,attackBonus:attackBonus,defenseBonus:defenseBonus,healthBonus:healthBonus,type:rewardType,id:itemID,cost:cost,identifier: "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType] + "]",modifications:Modifications,tier:itemTier,wins:genWins,imgID:rewardImgID,durability:tierDurability[itemTier]};
	}
	return shopItem;
}

function generateLoot(lootPrefill) {
	console.log(getTimeStamp() + "Generating Loot...");
	if (lootPrefill.rewardType == null) {
		var rewardType = Math.floor(Math.random() * (3));
	}
	else {
		rewardType = lootPrefill.rewardType
	}
	if (Math.random() < 0.5) {
		var attackRewardType = Math.floor(Math.random() * (dungeon[stage].weapons.length));
	}
	else {
		var attackRewardType = player.weapon.id
	}
	var attackRewardID = Math.floor(Math.random() * (dungeon[stage].weapons[attackRewardType].length));
	var attackReward = dungeon[stage].weapons[attackRewardType][attackRewardID].name;
	var defenseReward = Math.floor(Math.random() * (dungeon[stage].armour.length));
	var defenseRewardRanName = Math.floor(Math.random() * (dungeon[stage].armour[defenseReward].length));
	var defenseRewardName = dungeon[stage].armour[defenseReward][defenseRewardRanName].name;
	var healthReward = Math.floor(Math.random() * (dungeon[stage].relics.length));
	var genWins = wins;
	if (lootPrefill.id) {
		attackRewardID = lootPrefill.id;
		defenseReward = lootPrefill.id;
		healthReward = lootPrefill.id;
	}
	switch (rewardType) {
		case 0:
		var attackBonus = 1;
		if (player.weapon.attackBonus != 0) {
			if (dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded) {
				attackBonus = Math.floor(player.equipmentBase.weapon * weaponConversionMatrix[attackRewardType][1] + Math.floor(Math.random() * 2));
			}
			else {
				attackBonus = Math.floor(player.equipmentBase.weapon * weaponConversionMatrix[attackRewardType][0] + Math.floor(Math.random() * 2));
			}
		}
		if (checkAbility(player,1) && dungeon[stage].weapons[attackRewardType][attackRewardID].imgID.type == "dagger") {
			//Master of Knives ability
			attackBonus += 2;
		}
		if (checkAbility(player,7) && dungeon[stage].weapons[attackRewardType][attackRewardID].imgID.type == "sword") {
			//Skilled Swordsman ability
			attackBonus += 2;
		}
		if (checkAbility(player,8) && dungeon[stage].weapons[attackRewardType][attackRewardID].imgID.type == "bow") {
			//Expert Archer ability
			attackBonus += 2;
		}
		if (checkAbility(player,9) && dungeon[stage].weapons[attackRewardType][attackRewardID].imgID.type == "axe") {
			//Master of Heavy Weaponry ability
			attackBonus += 4;
		}
		var defenseBonus = 0;
		if (checkAbility(player,4) && attackRewardType == 2) {
			defenseBonus += 2;
		}
		var healthBonus = 0;
		console.log(attackRewardType);
		
		if (enemy.boss) {
			var itemTier = bossItemTiers[Math.floor(Math.random() * bossItemTiers.length)];
		}
		else if (enemy.miniboss) {
			var itemTier = miniBossItemTiers[Math.floor(Math.random() * miniBossItemTiers.length)];
		}
		else {
			var itemTier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
		}
		if (lootPrefill.tier) {
			itemTier = lootPrefill.tier;
		}
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var rewardName = rewardPrefixes[itemTier][rewardPrefix] + attackReward;
		if (lootPrefill.name) {
			rewardName = lootPrefill.name;
		}
		
		player.equipmentBase.weapon++;
		var itemModifications = Math.floor(Math.random() * 3 + 2);
		if (lootPrefill.modifications) {
			itemModifications = lootPrefill.modifications;
		}
		var cost = Math.floor(attackBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / itemModifications) * ((itemTier ** 2) / 16));
		if (dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded || lootPrefill.twohanded) {
			reqTwoHands = true;
		}
		else {
			reqTwoHands = false;
		}
		if (reqTwoHands) {
		var itemIdentifier = "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType] + " - " + weaponTypes[attackRewardType] + " - Requires Two Hands]";
		}
		else {
			var itemIdentifier = "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType] + " - " + weaponTypes[attackRewardType] + " - Requires One Hand]";
		}
		
		lootReward = {name:rewardName,attackBonus:attackBonus,defenseBonus:defenseBonus,healthBonus:healthBonus,type:0,id:attackRewardType,twohanded:reqTwoHands,identifier:itemIdentifier,modifications:itemModifications,tier:itemTier,cost:cost,wins:genWins,imgID:dungeon[stage].weapons[attackRewardType][attackRewardID].imgID,durability:tierDurability[itemTier]};
		break;
		
		case 1:
		switch (defenseReward) {
			case 0:
			var defenseBonus = player.equipmentBase.head + Math.floor(Math.random() * 2);
			if (player.head.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.head++;
			break;
			
			case 1:
			var defenseBonus = player.equipmentBase.body + Math.floor(Math.random() * 2);
			if (player.body.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.body++;
			break;
			
			case 2:
			var defenseBonus = player.equipmentBase.arms + Math.floor(Math.random() * 2);
			if (player.arms.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.arms++;
			break;
			
			case 3:
			var defenseBonus = player.equipmentBase.legs + Math.floor(Math.random() * 2);
			if (player.legs.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.legs++;
			break;
			
			case 4:
			var defenseBonus = player.equipmentBase.offhand + Math.floor(Math.random() * 2);
			if (player.offhand.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.offhand++;
			break;
		}
		
		if (enemy.boss) {
			var itemTier = bossItemTiers[Math.floor(Math.random() * bossItemTiers.length)];
		}
		else if (enemy.miniboss) {
			var itemTier = miniBossItemTiers[Math.floor(Math.random() * miniBossItemTiers.length)];
		}
		else {
			var itemTier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
		}
		if (lootPrefill.tier) {
			itemTier = lootPrefill.tier;
		}
		
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var rewardName = rewardPrefixes[itemTier][rewardPrefix] + defenseRewardName;
		if (lootPrefill.name) {
			rewardName = lootPrefill.name;
		}
		
		var itemModifications = Math.floor(Math.random() * 3 + 2);
		if (lootPrefill.modifications) {
			itemModifications = lootPrefill.modifications;
		}
		
		var cost = Math.floor(defenseBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / itemModifications) * ((itemTier ** 2) / 16));
		lootReward = {name:rewardName,attackBonus:0,defenseBonus:defenseBonus,healthBonus:0,type:1,id:defenseReward,identifier: "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType] + " - " + armourTypes[defenseReward] + "]",modifications:itemModifications,tier:itemTier,cost:cost,wins:genWins,imgID:dungeon[stage].armour[defenseReward][defenseRewardRanName].imgID,durability:tierDurability[itemTier]};
		break;
		
		case 2:
		var healthBonus = player.equipmentBase.relic + Math.floor(Math.random() * 6);
		player.equipmentBase.relic += 4;
		
		if (enemy.boss) {
			var itemTier = bossItemTiers[Math.floor(Math.random() * bossItemTiers.length)];
		}
		else if (enemy.miniboss) {
			var itemTier = miniBossItemTiers[Math.floor(Math.random() * miniBossItemTiers.length)];
		}
		else {
			var itemTier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
		}
		if (lootPrefill.tier) {
			itemTier = lootPrefill.tier;
		}
		
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var rewardName = rewardPrefixes[itemTier][rewardPrefix] + dungeon[stage].relics[healthReward].name;
		if (lootPrefill.name) {
			rewardName = lootPrefill.name;
		}
		
		var itemModifications = Math.floor(Math.random() * 3 + 2);
		if (lootPrefill.modifications) {
			itemModifications = lootPrefill.modifications;
		}
		
		var cost = Math.floor(healthBonus * 1 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / itemModifications) * ((itemTier ** 2) / 16));
		
		lootReward = {name:rewardName,attackBonus:0,defenseBonus:0,healthBonus:healthBonus,type:2,id:healthReward,identifier: "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType] + "]",modifications:itemModifications,tier:itemTier,cost:cost,wins:genWins,imgID:dungeon[stage].relics[healthReward].imgID,durability:tierDurability[itemTier]};
		break;
	}
	return lootReward;
}

function generateLoot2(lootPrefill) {
	console.log(getTimeStamp() + "Generating Loot...");
	if (rewardType == null) {
		var rewardType = Math.floor(Math.random() * (4));
	}
	if (Math.random() < 0.5) {
		var attackRewardType = Math.floor(Math.random() * (dungeon[stage].weapons.length));
	}
	else {
		var attackRewardType = player.weapon.id
	}
	var attackRewardID = Math.floor(Math.random() * (dungeon[stage].weapons[attackRewardType].length));
	var attackReward = dungeon[stage].weapons[attackRewardType][attackRewardID].name;
	var defenseReward = Math.floor(Math.random() * (dungeon[stage].armour.length));
	var defenseRewardRanName = Math.floor(Math.random() * (dungeon[stage].armour[defenseReward].length));
	var defenseRewardName = dungeon[stage].armour[defenseReward][defenseRewardRanName].name;
	var healthReward = Math.floor(Math.random() * (dungeon[stage].relics.length));
	var genWins = wins;
	switch (rewardType) {
		case 0:
		var attackBonus = 1;
		if (player.weapon.attackBonus != 0) {
			if (!dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded && attackRewardID != 2) {
				//one handed melee weapon
				attackBonus = Math.floor(player.equipmentBase.weapon + Math.floor(Math.random() * 2));
			}
			else if (dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded && attackRewardID != 2) {
				//two handed melee weapon
				attackBonus = Math.floor(player.equipmentBase.weapon * 2 + Math.floor(Math.random() * 2));
			}
			else if (attackRewardID == 2 && dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded) {
				//two handed ranged weapon
				attackBonus = Math.floor(player.equipmentBase.weapon * 0.75 + Math.floor(Math.random() * 2));
			}
			else {
				//one handed ranged weapon
				attackBonus = Math.floor(player.equipmentBase.weapon * 1.5 + Math.floor(Math.random() * 2));
			}
		}
		if (checkAbility(player,1) && attackRewardID == 1 && attackRewardType == 0) {
			attackBonus++;
		}
		var defenseBonus = 0;
		if (checkAbility(player,4) && attackRewardType == 2) {
			defenseBonus = 2;
		}
		var healthBonus = 0;
		console.log(attackRewardType);
		
		if (enemy.boss) {
			var itemTier = bossItemTiers[Math.floor(Math.random() * bossItemTiers.length)];
		}
		else if (enemy.miniboss) {
			var itemTier = miniBossItemTiers[Math.floor(Math.random() * miniBossItemTiers.length)];
		}
		else {
			var itemTier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
		}
		
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var rewardName = rewardPrefixes[itemTier][rewardPrefix] + attackReward;
		
		player.equipmentBase.weapon++;
		var itemModifications = Math.floor(Math.random() * 3 + 2);
		var cost = Math.floor(attackBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / itemModifications) * ((itemTier ** 2) / 16));
		if (!moveAbility) {
			if (Math.random() < 0.05) {
				moveAbility = Math.floor(Math.random() * moves[4].length);
			}
		}
		if (moveAbility) {
			var weaponMoveAbility = moves[4][moveAbility][stage];
			rewardName += weaponMoveAbility.suffix;
			moveAbilityText = weaponMoveAbility.identifierText;
			cost = Math.random(cost * 1.5);
		}
		else {
			moveAbilityText = "";
		}
		
		if (!typeAbility) {
			if (Math.random() < 0.05)
			typeAbility = typeAbilities[Math.floor(typeAbilities.length * Math.random())]
		}
		if (typeAbility) {
			rewardName = typeAbility.prefix + rewardName;
			typeAbilityText = typeAbility.identifierText;
			cost = Math.random(cost * 1.5);
		}
		else {
			typeAbilityText = "";
		}
		
		if (dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded) {
		var itemIdentifier = "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType - 1] + " - " + weaponTypes[attackRewardType] + " - Requires Two Hands" + moveAbilityText + typeAbilityText + "]";
		}
		else {
			var itemIdentifier = "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType - 1] + " - " + weaponTypes[attackRewardType] + " - Requires One Hand" + moveAbilityText + typeAbilityText + "]";
		}
		
		lootReward = {name:rewardName,attackBonus:attackBonus,defenseBonus:defenseBonus,healthBonus:healthBonus,type:0,id:attackRewardType,twohanded:dungeon[stage].weapons[attackRewardType][attackRewardID].twohanded,identifier:itemIdentifier,modifications:itemModifications,tier:itemTier,cost:cost,wins:genWins,moveAbility:weaponMoveAbility,imgID:dungeon[stage].weapons[attackRewardType][attackRewardID].imgID};
		
		if (typeAbility) {
			switch (typeAbility.id) {
				case 0:
				lootReward.ethereal = true;
				break;
			}
		}
		
		break;
		
		case 1:
		switch (defenseReward) {
			case 0:
			var defenseBonus = player.equipmentBase.head + Math.floor(Math.random() * 2);
			if (player.head.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.head++;
			break;
			
			case 1:
			var defenseBonus = player.equipmentBase.body + Math.floor(Math.random() * 2);
			if (player.body.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.body++;
			break;
			
			case 2:
			var defenseBonus = player.equipmentBase.arms + Math.floor(Math.random() * 2);
			if (player.arms.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.arms++;
			break;
			
			case 3:
			var defenseBonus = player.equipmentBase.legs + Math.floor(Math.random() * 2);
			if (player.legs.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.legs++;
			break;
			
			case 4:
			var defenseBonus = player.equipmentBase.offhand + Math.floor(Math.random() * 2);
			if (player.offhand.defenseBonus == 0 && defenseBonus == 0) {
				defenseBonus = 1;
			}
			player.equipmentBase.offhand++;
			break;
		}
		
		if (enemy.boss) {
			var itemTier = bossItemTiers[Math.floor(Math.random() * bossItemTiers.length)];
		}
		else if (enemy.miniboss) {
			var itemTier = miniBossItemTiers[Math.floor(Math.random() * itemTiers.length)];
		}
		else {
			var itemTier = itemTiers[Math.floor(Math.random() * miniBossItemTiers.length)];
		}
		
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var rewardName = rewardPrefixes[itemTier][rewardPrefix] + defenseRewardName;
	
		var itemModifications = Math.floor(Math.random() * 3 + 2);
		var cost = Math.floor(defenseBonus * 4 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / itemModifications) * ((itemTier ** 2) / 16));
		lootReward = {name:rewardName,attackBonus:0,defenseBonus:defenseBonus,healthBonus:0,type:1,id:defenseReward,identifier: "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType - 1] + " - " + armourTypes[defenseReward] + "]",modifications:itemModifications,tier:itemTier,cost:cost,wins:genWins,imgID:dungeon[stage].armour[defenseReward][defenseRewardRanName].imgID};
		break;
		
		case 2:
		var healthBonus = player.equipmentBase.relic + Math.floor(Math.random() * 6);
		player.equipmentBase.relic += 4;
		
		if (enemy.boss) {
			var itemTier = bossItemTiers[Math.floor(Math.random() * bossItemTiers.length)];
		}
		else if (enemy.miniboss) {
			var itemTier = miniBossItemTiers[Math.floor(Math.random() * miniBossItemTiers.length)];
		}
		else {
			var itemTier = itemTiers[Math.floor(Math.random() * itemTiers.length)];
		}
		
		var rewardPrefix = Math.floor(Math.random() * (rewardPrefixes[itemTier].length));
		var rewardName = rewardPrefixes[itemTier][rewardPrefix] + dungeon[stage].relics[healthReward].name;
			
		var itemModifications = Math.floor(Math.random() * 3 + 2);
		var cost = Math.floor(healthBonus * 1 * ((Math.random() + 1) ** 1.4) * ((wins ** 2 / 100) + 1) * (2 / itemModifications) * ((itemTier ** 2) / 16));
		
		lootReward = {name:rewardName,attackBonus:0,defenseBonus:0,healthBonus:healthBonus,type:2,id:healthReward,identifier: "[" + tierList[itemTier] + " Tier " + rewardTypes[rewardType - 1] + "]",modifications:itemModifications,tier:itemTier,cost:cost,wins:genWins,imgID:dungeon[stage].relics[healthReward].imgID};
		break;
		
		case 3:
		var consumableType = Math.floor(Math.random() * 10);
		switch (consumableType) {
			case 0:
			//healing
//			lootReward.effects[0].
			break;
			
			case 1:
			//attack buff
			
			break;
			
			case 2:
			//defense buff
			break;
			
			case 3:
			//status removal
//			lootReward = presetConsumables[3][Math.floor(Math.random() * presetConsumables[3].length)];
			
			break;
			
			case 4:
			//attack
			break;
			
			case 5:
			
			break;
			
			case 6:
			
			break;
			
			case 7:
			
			break;
			
			case 8:
			
			break;
			
			case 9:
			
			break;
		}
		
//		lootReward.type = 3;
		break;
	}
	return lootReward;
}

function checkAbility (target,checkAbility) {
	for (i = 0; i < target.abilities.length; i++) {
		if (target.abilities[i].id == checkAbility) {
			return (true);
		}
	}
	return (false);
}

function victory (playerFirst) {
	levelledUp = false;
	attacked = false;
	
	player.poison = 0;
	player.madnessDuration = 0;
	player.blaze = 0;
	player.decayStrength = 0;
	player.decayDuration = 0;
	player.shock = 0;
	player.frost = 0;
	player.blindDuration = 0;
	
	player.attackVar = 0;
	player.defenseVar = 0;
	player.abilityAttackVar = 0;
	player.abilityDefenseVar = 0;
	
	player.previousMove = 0;
	
	previousEnemyAttack = 0;
	
	if (!player.head.empty) {
		player.head.durability[0] = tierDurability[player.head.tier][0];
	}
	if (!player.body.empty) {
		player.body.durability[0] = tierDurability[player.body.tier][0];
	}
	if (!player.arms.empty) {
		player.arms.durability[0] = tierDurability[player.arms.tier][0];
	}
	if (!player.legs.empty) {
		player.legs.durability[0] = tierDurability[player.legs.tier][0];
	}
	if (!player.relic.empty) {
		player.relic.durability[0] = tierDurability[player.relic.tier][0];
	}
	if (!player.weapon.empty) {
		player.weapon.durability[0] = tierDurability[player.weapon.tier][0];
	}
	if (!player.offhand.empty) {
		player.offhand.durability[0] = tierDurability[player.offhand.tier][0];
	}
	if (!player.secondaryWeapon.empty) {
		player.secondaryWeapon.durability[0] = tierDurability[player.secondaryWeapon.tier][0];
	}
	if (!player.secondaryOffhand.empty) {
		player.secondaryOffhand.durability[0] = tierDurability[player.secondaryOffhand.tier][0];
	}
	
	i = 1;
	while (i < player.moves.length) {
		if (player.moves[i].reqCharge) {
			if (player.moves[i].chargeInit) {
				player.moves[i].charge = player.moves[i].reqCharge;
			}
			else {
				player.moves[i].charge = 0;
			}
		}
	i++;
	}
	
	console.log(getTimeStamp() + "Player Victory");
	if (enemy.finalBoss) {
		//final boss stuff goes here
		if (playerFirst) {
		turnSummary = "TURN SUMMARY\n\n" + playerResult + "\n" + enemyResult + "\n\n" + player.name + " watches as the figure falls to the ground, clutching at it's chest. From it's dying breath The Gatekeeper speaks...\n'`Do you think my death will open The Gate?'\nAnd then it is standing again?\n'I may be the Keeper of The Gate, but I do not hold The Key,'\nIt steps towards the Explorer, who tries to step away, but some force has bound their legs. They look down to see thic tendrils of black fog snaking up their legs.\,'No keys remain on this side, all those who wield them are on the other, but now you are here...'\nThe Gate burns redder through the black fog, now reaching up around " + player.firstName + "'s body. The Gatekeeper passes their sword through The Gate, and it passes back, glowing slightly gold. The face of a long-lost Explorer smiles through The Gatekeeper's mask.\n'Finally...'\n'The Dungeon goes deeper...'\nBut " + player.firstName + " cannot follow. Dark thoughts invade their mind as the fog wraps itself around their head, obscuring their senses, blurring their memories. Time fades as the Explorer attempts to fight the overwhelming dark, but to no avail. Their last memories of fear vanish, replaced with a compelling desire to serve.\nTo obey\nTo guard The Gate...\n\nVICTORY?\n\n"	
		}
		else {
		turnSummary = "TURN SUMMARY\n\n" + enemyResult + "\n\n" + playerResult + "\n\n" + player.name + " watches as the figure falls to the ground, clutching at it's chest. From it's dying breath The Gatekeeper speaks...\n'`Do you think my death will open The Gate?'\nAnd then it is standing again?\n'I may be the Keeper of The Gate, but I do not hold The Key,'\nIt steps towards the Explorer, who tries to step away, but some force has bound their legs. They look down to see thic tendrils of black fog snaking up their legs.\,'No keys remain on this side, all those who wield them are on the other, but now you are here...'\nThe Gate burns redder through the black fog, now reaching up around " + player.firstName + "'s body. The Gatekeeper passes their sword through The Gate, and it passes back, glowing slightly gold. The face of a long-lost Explorer smiles through The Gatekeeper's mask.\n'Finally...'\n'The Dungeon goes deeper...'\nBut " + player.firstName + " cannot follow. Dark thoughts invade their mind as the fog wraps itself around their head, obscuring their senses, blurring their memories. Time fades as the Explorer attempts to fight the overwhelming dark, but to no avail. Their last memories of fear vanish, replaced with a compelling desire to serve.\nTo obey\nTo guard The Gate...\n\nVICTORY?\n\n"	
		}
		var monument = "HERE STANDS A MONUMENT TO " + player.name.toUpperCase() + "\n\nBECAME THE GATEKEEPER\n\nDEFEATED " + wins + " MONSTERS OF THE DUNGEON\N\N"
		deathLog(wins, monument);
		causeOfDeath = "Became The Gatekeeper";
		message = turnSummary + monument + "\n\nThe next Run will commence in one hour";
		leaderBoard(wins, player.name, causeOfDeath);
		wins = 0;
		awaitMove = false;
		awaitChoice = false;
		inFight = false;
		characterChoice = false;
		playerLevel = 1;
		turn = 1;
		runType = 0;
		runGold = 0;
		room = 0;
		floor = 0;
		stage = 0;
		fightStartMessage = '';
		turnSummary = '';
		statusMessage = '';
		enemyAction = '';
		playerAction = '';
		enemyResult = '';
		playerResult = '';
		reward = false;
		encounterOccured = false;
		player.canSeeIntents = true;
		encounterSummary = '';
		encounterDeathMessage = '';
		save();
	}
	else {
	runGold += enemy.goldPotential;
	player.xp += enemy.xp;
	if (player.xp >= Math.floor((playerLevel ** 1.5) * 10)) {
		while (player.xp >= Math.floor((playerLevel ** 1.5) * 10)) {
			player.xp -= Math.floor((playerLevel ** 1.5) * 10)
			playerLevel++;
			var levelUp = "\nLevelled up to Level " + playerLevel + "!\n+5 Max Health";
			if (player.relic.demonic) {
				player.relic.healthBonus += 5;
			}
			else {
				player.healthCore += 5;
			}
			if (playerLevel % 2 == 0) {
				player.attackCore ++;
				player.defenseCore ++;
				levelUp += "\n+1 Attack\n+1 Defense"
			}
			levelledUp = true;
			player.maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
			player.attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
			player.defense = player.defenseCore + player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;
		}
	}
	else {
		var levelUp = "\nProgress to Next Level: " + player.xp + "/" + Math.floor((playerLevel ** 1.5) * 10) + " XP";
	}
	if (enemy.boss) {
		if (enemyResult != null) {
			if (playerFirst) {
			turnSummary = "TURN SUMMARY\n\n" + playerResult + "" + enemyResult + "\n\n" + enemy.deathMessage + "\n\nVICTORY\n" + player.name + " has defeated " + enemy.name + "!\n+" + enemy.goldPotential + " GOLD\nCurrent Gold: " + runGold + "\n\n+" + enemy.xp + " XP" + levelUp + "\n\n";
			}
			else {
			turnSummary = "TURN SUMMARY\n\n" + enemyResult + "" + playerResult + "\n\n" + enemy.deathMessage + "\n\nVICTORY\n" + player.name + " has defeated " + enemy.name + "!\n+" + enemy.goldPotential + " GOLD\nCurrent Gold: " + runGold + "\n\n+" + enemy.xp + " XP" + levelUp + "\n\n";	
			}
		}
		else {
			if (playerFirst) {
			turnSummary = "TURN SUMMARY\n\n" + playerResult + "\n\n" + enemy.deathMessage + "\n\nVICTORY\n" + player.name + " has defeated " + enemy.name + "!\n+" + enemy.goldPotential + " GOLD\nCurrent Gold: " + runGold + "\n\n+" + enemy.xp + " XP" + levelUp + "\n\n";	
			}
			else {
			turnSummary = "TURN SUMMARY\n\n" + enemyResult + "" + playerResult + "\n\n" + enemy.deathMessage + "\n\nVICTORY\n" + player.name + " has defeated " + enemy.name + "!\n+" + enemy.goldPotential + " GOLD\nCurrent Gold: " + runGold + "\n\n+" + enemy.xp + " XP" + levelUp + "\n\n";
			}
		}
	}
	else {
		if (enemyResult != null) {
			if (playerFirst) {
			turnSummary = "TURN SUMMARY\n\n" + playerResult + "" + enemyResult + "\n\nVICTORY\n" + player.name + " has defeated " + enemy.name + "!\n+" + enemy.goldPotential + " GOLD\nCurrent Gold: " + runGold + "\n\n+" + enemy.xp + " XP" + levelUp + "\n\n";
			}
			else {
			turnSummary = "TURN SUMMARY\n\n" + enemyResult + "" + playerResult + "\n\nVICTORY\n" + player.name + " has defeated " + enemy.name + "!\n+" + enemy.goldPotential + " GOLD\nCurrent Gold: " + runGold + "\n\n+" + enemy.xp + " XP" + levelUp + "\n\n";	
			}
		}
		else {
			if (playerFirst) {
			turnSummary = "TURN SUMMARY\n\n" + playerResult + "\n\nVICTORY\n" + player.name + " has defeated " + enemy.name + "!\n+" + enemy.goldPotential + " GOLD\nCurrent Gold: " + runGold + "\n\n+" + enemy.xp + " XP" + levelUp + "\n\n";	
			}
			else {
			turnSummary = "TURN SUMMARY\n\n" + enemyResult + "" + playerResult + "\n\nVICTORY\n" + player.name + " has defeated " + enemy.name + "!\n+" + enemy.goldPotential + " GOLD\nCurrent Gold: " + runGold + "\n\n+" + enemy.xp + " XP" + levelUp + "\n\n";
			}
		}
	}
	
	var dropChance = Math.random();
	if (dropChance <= 1 || enemy.fallen || enemy.boss || enemy.player) {
		if (levelledUp) {
			if (!player.moves[1].upgradeable && !player.moves[2].upgradeable && !player.moves[3].upgradeable && !player.moves[4].upgradeable) {
				turn = 1;
				wins ++;
				encounterType = 8;
				encounter(8);
				reward = true;
				save();
			}
			else {
				didGainLootEquipment = true;
				turn = 1;
				wins ++;
				encounterType = 26;
				encounter(26);
				save();	
			}
		}
		else {
			turn = 1;
			wins ++;
			encounterType = 8;
			encounter(8);
			reward = true;
			save();
		}
	}
	else {
		if (levelledUp) {
			if (!player.moves[1].upgradeable && !player.moves[2].upgradeable && !player.moves[3].upgradeable && !player.moves[4].upgradeable) {
				reward = false;
				rewardResult = null;
				enemyResult = null;
				attacked = false;
				turn = 1;
				wins ++;
				room ++;
				turnStart(true);
			}
			else {
				turn = 1;
				wins ++;
				encounterType = 26;
				encounter(26);
				save();
			}
		}
		else {
			reward = false;
			rewardResult = null;
			enemyResult = null;
			attacked = false;
			turn = 1;
			wins ++;
			room ++;
			turnStart(true);
		}
	}
	}
}

function loss (PlayerResult,EnemyResult,deathType,playerFirst) {
	console.log(getTimeStamp() + "Player Loss");
	if (enemy.finalBoss) {
			console.log(PlayerResult);
			var deathMessage = player.name + " collapses to the ground on the edge of death, their consciousness begins to fade, they see the figure standing over them, watching as it slowly takes them away...";
			if (playerFirst) {
				turnSummary = "TURN SUMMARY\n\n" + PlayerResult + "\n" + EnemyResult + "\n\nDEFEAT\n\n" + deathMessage + "\n\n"
			}
			else {
				turnSummary = "TURN SUMMARY\n\n" + enemyResult + "\n\n" + playerResult + "\n\nDEFEAT\n\n" + deathMessage + "\n\n"
			}
			
			var causeOfDeath = (deathMessages[deathMessage] + " " + enemy.name);
			tombstone = "HERE LIES " + player.name.toUpperCase() + "\n\n" + causeOfDeath.toUpperCase() + "\n\nSLAIN ON " + getLocation().toUpperCase() + "\n\nDEFEATED " + wins + " MONSTERS OF THE DUNGEON\n\n"
	}
	else {
		switch (deathType) {
			case 0:
			//fight death
			var deathMessage = Math.floor(Math.random() * deathMessages.length);
			console.log(PlayerResult);
			if (playerFirst) {
			turnSummary = "TURN SUMMARY\n\n" + PlayerResult + "\n" + EnemyResult + "\n\nDEFEAT\n\n" + player.name + " was " + deathMessages[deathMessage].toLowerCase() + " " + enemy.name + "!\n\n"	
			}
			else {
			turnSummary = "TURN SUMMARY\n\n" + enemyResult + "\n\n" + playerResult + "\n\nDEFEAT\n\n" + player.name + " was " + deathMessages[deathMessage].toLowerCase() + " " + enemy.name + "!\n\n"
			}
			var causeOfDeath = (deathMessages[deathMessage] + " " + enemy.name);
			tombstone = "HERE LIES " + player.name.toUpperCase() + "\n\n" + deathMessages[deathMessage].toUpperCase() + " " + enemy.name.toUpperCase() + "\n\nSLAIN ON " + getLocation().toUpperCase() + "\n\nDEFEATED " + wins + " MONSTERS OF THE DUNGEON\n\n"
			break;
			
			case 1:
			//encounter death
			console.log(PlayerResult);
			turnSummary = encounterDeathMessage;
			var causeOfDeath = encounterCauseOfDeath;
			tombstone = "HERE LIES " + player.name.toUpperCase() + "\n\n" + encounterCauseOfDeath.toUpperCase() + "\n\nSLAIN ON " + getLocation().toUpperCase() + "\n\nDEFEATED " + wins + " MONSTERS OF THE DUNGEON\n\n"
			break;
		}
	}
	deathLog(wins, tombstone);
	message = turnSummary + tombstone + "The next Run will commence in one hour";
	leaderBoard(wins, player.name, causeOfDeath);
	wins = 0;
	awaitMove = false;
	awaitChoice = false;
	inFight = false;
	characterChoice = false;
	playerLevel = 1;
	turn = 1;
	runType = 0;
	runGold = 0;
	room = 0;
	floor = 0;
	stage = 0;
	fightStartMessage = '';
	turnSummary = '';
	statusMessage = '';
	enemyAction = '';
	playerAction = '';
	enemyResult = '';
	playerResult = '';
	reward = false;
	encounterOccured = false;
	player.canSeeIntents = true;
	encounterSummary = '';
	encounterDeathMessage = '';
	save();
}

function endOfRun () {
	console.log(getTimeStamp() + "End of Run");
	//encounter death
	console.log(PlayerResult);
	turnSummary = encounterDeathMessage;
	var causeOfDeath = encounterCauseOfDeath;
	tombstone = "HERE STANDS A MONUMENT TO " + player.name.toUpperCase() + "\n\n" + encounterCauseOfDeath.toUpperCase() + "\n\nSURVIVED " + wins + " MONSTERS OF THE DUNGEON\n\n"

	deathLog(wins, tombstone);
	message = turnSummary + tombstone + "\n\nThe next Run will commence in one hour";
	leaderBoard(wins, player.name, causeOfDeath);
	wins = 0;
	awaitMove = false;
	awaitChoice = false;
	inFight = false;
	characterChoice = false;
	playerLevel = 1;
	turn = 1;
	runType = 0;
	runGold = 0;
	room = 0;
	floor = 0;
	stage = 0;
	fightStartMessage = '';
	turnSummary = '';
	statusMessage = '';
	enemyAction = '';
	playerAction = '';
	enemyResult = '';
	playerResult = '';
	reward = false;
	encounterOccured = false;
	player.canSeeIntents = true;
	encounterSummary = '';
	encounterDeathMessage = '';
	save();
}

function leaderBoard(entryScore, entryName, causeOfDeath) {
	console.log(getTimeStamp() + "Writing to Leaderboard");
	var leaderboardEntry = {name: entryName, wins: entryScore, causeOfDeath: causeOfDeath};
	var leaderboard = JSON.parse(fs.readFileSync('./leaderboard.json'));
	if (entryScore > leaderboard[0].wins) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboard[3];
		leaderboard[3] = leaderboard[2];
		leaderboard[2] = leaderboard[1];
		leaderboard[1] = leaderboard[0];
		leaderboard[0] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[0].wins) && (entryScore > leaderboard[1].wins)) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboard[3];
		leaderboard[3] = leaderboard[2];
		leaderboard[2] = leaderboard[1];
		leaderboard[1] = leaderboardEntry;
	}
	else if ((entryScore > leaderboard[1].wins) ) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboard[3];
		leaderboard[3] = leaderboard[2];
		leaderboard[2] = leaderboard[1];
		leaderboard[1] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[1].wins) && (entryScore > leaderboard[2].wins)) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboard[3];
		leaderboard[3] = leaderboard[2];
		leaderboard[2] = leaderboardEntry;
	}
	else if (entryScore > leaderboard[2].wins) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboard[3];
		leaderboard[3] = leaderboard[2];
		leaderboard[2] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[2].wins) && (entryScore > leaderboard[3].wins)) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboard[3];
		leaderboard[3] = leaderboardEntry;
	}
	else if (entryScore > leaderboard[3].wins) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboard[3];
		leaderboard[3] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[3].wins) && (entryScore > leaderboard[4].wins)) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboardEntry;
	}
	else if (entryScore > leaderboard[4].wins) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboard[4];
		leaderboard[4] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[4].wins) && (entryScore > leaderboard[5].wins)) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboardEntry;
	}
	else if (entryScore > leaderboard[5].wins) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboard[5];
		leaderboard[5] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[5].wins) && (entryScore > leaderboard[6].wins)) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboardEntry;
	}
	else if (entryScore > leaderboard[6].wins) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboard[6];
		leaderboard[6] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[6].wins) && (entryScore > leaderboard[7].wins)) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboardEntry;
	}
	else if (entryScore > leaderboard[7].wins) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboard[7];
		leaderboard[7] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[7].wins) && (entryScore > leaderboard[8].wins)) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboardEntry;
	}
	else if (entryScore > leaderboard[8].wins) {
		leaderboard[9] = leaderboard[8];
		leaderboard[8] = leaderboardEntry;
	}
	else if ((entryScore == leaderboard[8].wins) && (entryScore > leaderboard[9].wins)) {
		leaderboard[9] = leaderboardEntry;
	}
	else if (entryScore > leaderboard[9].wins) {
		leaderboard[9] = leaderboardEntry;
	}
	leaderboardData = JSON.stringify(leaderboard);
	fs.writeFileSync('./leaderboard.json', leaderboardData);
	comment = "THE HALL OF HEROES\nCurrent Dungeon Run Leaderboard\n\n" + leaderboard[0].name + ": Survived " + leaderboard[0].wins + " Levels of The Dungeon\n" + leaderboard[0].causeOfDeath + "\n\n" + leaderboard[1].name + ": Survived " + leaderboard[1].wins + " Levels of The Dungeon\n" + leaderboard[1].causeOfDeath + "\n\n" + leaderboard[2].name + ": Survived " + leaderboard[2].wins + " Levels of The Dungeon\n" + leaderboard[2].causeOfDeath + "\n\n" + leaderboard[3].name + ": Survived " + leaderboard[3].wins + " Levels of The Dungeon\n" + leaderboard[3].causeOfDeath + "\n\n" + leaderboard[4].name + ": Survived " + leaderboard[4].wins + " Levels of The Dungeon\n" + leaderboard[4].causeOfDeath + "\n\n" + leaderboard[5].name + ": Survived " + leaderboard[5].wins + " Levels of The Dungeon\n" + leaderboard[5].causeOfDeath + "\n\n" + leaderboard[6].name + ": Survived " + leaderboard[6].wins + " Levels of The Dungeon\n" + leaderboard[6].causeOfDeath + "\n\n" + leaderboard[7].name + ": Survived " + leaderboard[7].wins + " Levels of The Dungeon\n" + leaderboard[7].causeOfDeath + "\n\n" + leaderboard[8].name + ": Survived " + leaderboard[8].wins + " Levels of The Dungeon\n" + leaderboard[8].causeOfDeath + "\n\n" + leaderboard[9].name + ": Survived " + leaderboard[9].wins + " Levels of The Dungeon\n" + leaderboard[9].causeOfDeath;
	post(message);
	return;
}
	
function deathLog(floor, death) {
	console.log(getTimeStamp() + "Writing to Death Log...");
	
	var maxHealth = player.healthCore + player.head.healthBonus + player.body.healthBonus + player.arms.healthBonus + player.legs.healthBonus + player.relic.healthBonus + player.weapon.healthBonus + player.offhand.healthBonus;
	var attack = player.attackCore + player.head.attackBonus + player.body.attackBonus + player.arms.attackBonus + player.legs.attackBonus + player.relic.attackBonus + player.weapon.attackBonus + player.offhand.attackBonus;
	var defense = player.head.defenseBonus + player.body.defenseBonus + player.arms.defenseBonus + player.legs.defenseBonus + player.relic.defenseBonus + player.weapon.defenseBonus + player.offhand.defenseBonus;

	var deathLogEntry = {name: player.name, maxHealth: maxHealth, attack: attack, defense: defense, floor: floor, deathInfo: death, firstName: player.firstName, head: player.head, body: player.body, arms: player.arms, legs: player.legs, relic: player.relic, weapon: player.weapon, offhand: player.offhand, ranReward: false};
	var deathLog = JSON.parse(fs.readFileSync('./deathlog.json'));
	deathLog.push(deathLogEntry);
	deathLogToWrite = JSON.stringify(deathLog)
	fs.writeFileSync('./deathlog.json', deathLogToWrite);

}

function post (output, comment, renderPlayer) {
	if (outputImages) {
		// Begins the sprite generation
		//need to create new player image?
		if (player) {
			assemblePlayerImage(output, comment, true);
			setTimeout(function () {renderImage(output,comment)}, 1000);
		}
		//player already assembled
		else {
			renderImage(output, comment)
		}
	}
	else {
		// Does the final output
		finalPost(output,comment);
	}
}

function finalPost (output, comment) {
	console.log(output + "\n\n" + comment);
	// The rest of this is used for Facebook posting and is thus commented out
	/*
	console.log(getTimeStamp() + "Posting...");
	FB.api('me/photos', 'post', { source: fs.createReadStream('images/blank.png'), caption: output }, function (res) {
		if(!res || res.error) {
			console.log(!res ? 'error occurred' : res.error);
			return true;
		}
		console.log(getTimeStamp() + "Posted Successfully!");
		console.log(getTimeStamp() + 'Post Id: ' + res.id);
		if (comment != null) {
			var body = comment;
			console.log(getTimeStamp() + "Posting Moves Comment...");
			FB.api(res.id + '/comments', 'post', { message: body }, function (comm) {
			if(!comm || comm.error) {
				console.log(!comm ? 'error occurred' : comm.error);
				return true;
			}
			console.log(getTimeStamp() + "Comment Posted Successfully!");
			});
		}
		userData = JSON.stringify(res.id)
		fs.writeFileSync('./previous-post-id2.json', ('2250876378571452_' + res.id));
	});
	*/
}

function postComment (postID, comment) {
	// Unused
/*	var body = comment;
	console.log(getTimeStamp() + "Posting Status Comment...");
	FB.api(postID + '/comments', 'post', { message: body }, function (res) {
	if(!res || res.error) {
		console.log(!res ? 'error occurred' : res.error);
		return;
	}
	console.log(getTimeStamp() + "Status Comment Posted Successfully!");
	});
*/
}

function save () {
	console.log(getTimeStamp() + "Saving Data...");
	userArray = [
					inFight, 
					player, 
					enemy, 
					turn, 
					attack, 
					awaitMove, 
					tempEnemyDefense, 
					tempPlayerDefense, 
					playerLevel, 
					playerXP, 
					wins, 
					runType, 
					enemyAttackType, 
					playerResult, 
					enemyResult, 
					enemyAction, 
					highestRunScore, 
					highestRunName, 
					runGold, 
					encounterType, 
					levelSkip, 
					healthLoss, 
					awaitChoice, 
					shop1, 
					shop2, 
					shop3, 
					playerClass, 
					awaitClass, 
					fightStartMessage, 
					turnSummary, 
					statusMessage, 
					reward, 
					encounterOccured, 
					encounterSummary, 
					previousEnemyAttack, 
					characterChoice, 
					player1, 
					player2, 
					player3, 
					player4, 
					player5, 
					selectedCharacter, 
					lootReward,
					playerReward,
					attacked,
					fallenHero,
					scrapChance,
					weaponUpgradeCost,
					weaponReforgeCost,
					armourUpgradeCost,
					armourReforgeCost,
					encounterDeathMessage,
					encounterCauseOfDeath,
					encounterResult,
					canSeeIntents,
					stage,
					floor,
					room,
					fallenHeroMessage,
					enemyDodge,
					playerDodge,
					learnMove,
					smithActions,
					didGainLootEquipment,
					currentMerchant,
					outputImages
				];
	userData = JSON.stringify(userArray)
	fs.writeFileSync('./savefile.json', userData);
	fs.writeFileSync('./dungeon.json', JSON.stringify(dungeon));
	hasRun = false;
}

function load () {
	console.log(getTimeStamp() + "Loading Data...");
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
	var fallenHeroMessage = userDataToLoad[58];
	enemyDodge =  userDataToLoad[59];
	playerDodge = userDataToLoad[60];
	learnMove = userDataToLoad[61];
	smithActions = userDataToLoad[62];
	didGainLootEquipment = userDataToLoad[63];
	currentMerchant = userDataToLoad[64];
	outputImages = userDataToLoad[65];
	dungeon = JSON.parse(fs.readFileSync('./dungeon.json'));
}

function assemblePlayerImage (output, comment, renderImageBool, randomEquipment) {
	// Player sprite creation
	console.log(getTimeStamp() + "Assembling Player Image");
//	Jimp.read("./images/explorer-class-images/" + player.playerClass + ".png", (err,img) => {
//		player.playerImage = img;
//	})

	if (randomEquipment) {
		playerCache = player;
		player.head.imgID = randomEquipmentImageIDs[0][Math.floor(Math.random() * randomEquipmentImageIDs[0].length)];
		player.body.imgID = randomEquipmentImageIDs[1][Math.floor(Math.random() * randomEquipmentImageIDs[1].length)];
		player.arms.imgID = randomEquipmentImageIDs[2][Math.floor(Math.random() * randomEquipmentImageIDs[2].length)];
		player.legs.imgID = randomEquipmentImageIDs[3][Math.floor(Math.random() * randomEquipmentImageIDs[3].length)];
		if (Math.random() < 0.5) {
			player.weapon.imgID = randomEquipmentImageIDs[4][Math.floor(Math.random() * randomEquipmentImageIDs[4].length)];
			player.offhand.imgID = randomEquipmentImageIDs[4][0];
		}
		else {
			player.weapon.imgID = randomEquipmentImageIDs[5][Math.floor(Math.random() * randomEquipmentImageIDs[5].length)];
			player.offhand.imgID = randomEquipmentImageIDs[6][Math.floor(Math.random() * randomEquipmentImageIDs[6].length)];
		}
		player.relic.imgID = randomEquipmentImageIDs[7][Math.floor(Math.random() * randomEquipmentImageIDs[7].length)];
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
												.write('./bin/player.png');
											if (randomEquipment) {
												player = playerCache;
												console.log(getTimeStamp() + "Generated Random Player Image!")
											}
											else {
												player.playerImage = imgbase;
											}
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
											imgbase.write('./bin/player_aura.png');
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

function renderImage (output, comment) {
	// Renders a scene, slow and messy
	if (characterChoice) {
		Jimp.read('./images/explorer-class-images/' + player1.playerClass + '.png', (err, player1img) => {
		if (err) throw err;
			Jimp.read('./images/explorer-class-images/' + player2.playerClass + '.png', (err, player2img) => {
			if (err) throw err;
				Jimp.read('./images/explorer-class-images/' + player3.playerClass + '.png', (err, player3img) => {
				if (err) throw err;
					Jimp.read('./images/locations/legacy-dungeon/background.png', (err, backgroundimg) => {
					if (err) throw err;
						backgroundimg
							.composite(player1img, -10, 25)
							.composite(player2img, 28, 25)
							.composite(player3img, 67, 25)
							.resize(811, 456, Jimp.RESIZE_NEAREST_NEIGHBOR);
							
							Jimp.read('./images/ui/encounterUI2.png', (err, ui) => {
								if (err) return;
								console.log("loaded ui");
								Jimp.read('./images/ui/blanksize2.png', (err, blank) => {
									if (err) return;
									console.log("loaded blank");
									blank
									.composite(backgroundimg, 0, 72)
									.composite(ui, 0, 0);
									Jimp.loadFont('./assets/pixeled.fnt', (err,mainFont) => {
										blank
										.quality(100)
										.write('./bin/output.png', err => console.error('write error:', err));
										finalPost(output, comment);
									});
								});
							});
					});
				});
			});
		});	
	}
	if (!player) return;
	if (awaitMove) {
			Jimp.read('./images/locations/' + dungeon[stage].theme + '/background.png', (err, backgroundimg) => {
				if (err) throw err;
				console.log("loaded background");
				Jimp.read("./bin/player.png", (err,playerIMG) => {
					console.log("loaded player");
				backgroundimg
					.composite(playerIMG, 0, 25);
					if (enemy.phases) {
						enemyimgpath = enemy.imgID + "/" + enemy.currentPhase
					}
					else {
						enemyimgpath = enemy.imgID
					}
					Jimp.read('./images/enemy-images/' + enemyimgpath + '/main.png', (err, enemyimg) => {
						console.log("loaded enemy");
						console.log('./images/enemy-images/' + enemyimgpath + '/main.png');
						if (err) {console.log(err); return;}
						backgroundimg
							.composite(enemyimg, 40, 0)
							.resize(811, 456, Jimp.RESIZE_NEAREST_NEIGHBOR);
							Jimp.read('./images/ui/combatUI2.png', (err, ui) => {
								console.log("loaded ui");
								if (err) return;
								Jimp.read('./images/ui/blanksize2.png', (err, blank) => {
									console.log("loaded blank");
									if (err) return;
									blank
									.composite(backgroundimg, 0, 72)
									.composite(ui, 0, 0);
									Jimp.loadFont('./assets/pixeled.fnt', (err,mainFont) => {
										Jimp.loadFont('./assets/pixeled-big.fnt', (err,bigFont) => {
										blank
										.print(mainFont,114,550,{text:player.name,alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
										.print(mainFont,220,-4,{text:enemy.name,alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
										.print(mainFont,415,530,{text:getLocation(),alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},170)
										.print(bigFont,22,-2,{text:"Turn " + turn,alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
										.print(bigFont,37,492,{text:"" + (player.attack + player.attackVar + player.abilityAttackVar),alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},60)
										.print(bigFont,8,536,{text:"" + (tempPlayerDefense),alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},60)
										.print(bigFont,537,-7,{text:"" + (enemy.attack),alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},60)
										.print(bigFont,506,39,{text:"" + (tempEnemyDefense),alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},60)
										var playerHealthBar = Math.floor((player.health / player.maxHealth) * 256);
										for (i = 95; i < (playerHealthBar + 95); i++) {
											for (j = 519; j < 27 + 519; j++) {
												var col = Jimp.intToRGBA(blank.getPixelColor(i,j));
												if (col.r == 106 && col.g == 106 &&col.b == 106) {
													if (playerHealthBar < 64) {
														blank.setPixelColor(Jimp.rgbaToInt(255,0,0,255),i,j)
													}
													else if (playerHealthBar < 128) {
														blank.setPixelColor(Jimp.rgbaToInt(255,255,0,255),i,j)
													}
													else {
														blank.setPixelColor(Jimp.rgbaToInt(0,255,0,255),i,j)
													}
												}
											}
										}
										
										var enemyHealthBar = Math.floor((enemy.health / enemy.maxHealth) * 256);
										for (i = 504; i > (504 - enemyHealthBar); i--) {
											for (j = 54; j < 27 + 54; j++) {
												var col = Jimp.intToRGBA(blank.getPixelColor(i,j));
												if (col.r == 106 && col.g == 106 &&col.b == 106) {
													if (enemyHealthBar < 64) {
														blank.setPixelColor(Jimp.rgbaToInt(255,0,0,255),i,j)
													}
													else if (enemyHealthBar < 128) {
														blank.setPixelColor(Jimp.rgbaToInt(255,255,0,255),i,j)
													}
													else {
														blank.setPixelColor(Jimp.rgbaToInt(0,255,0,255),i,j)
													}
												}
											}
										}
										
										blank
										.quality(100)
										.write('./bin/output.png', err => console.error('write error:', err));
									});
								});
							});
						});
					});
			});
		});
	}
	else if (awaitChoice) {
		switch (encounterType) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 6:
			case 7:
			case 9:
			case 10:
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
			case 16:
			case 17:
			case 18:
			case 19:
			case 20:
			case 21:
			case 22:
			case 23:
			case 24:
			case 25:
			case 27:
			case 28:
			case 29:
			case 30:
			case 31:
			case 32:
			case 33:
			case 34:
			case 35:
			case 36:
			case 37:
			case 38:
			case 39:
			case 40:
			case 41:
			console.log("reached render");
			Jimp.read('./images/locations/' + dungeon[stage].theme + '/background.png', (err, backgroundimg) => {
				if (err) return;
				console.log("loaded background");
				Jimp.read("./bin/player.png", (err,playerIMG) => {
					console.log("loaded player");
					if (err) return;
					Jimp.read('./images/encounters/' + encounterType + '/main.png', (err, encounterIMG) => {
						if (err) return;
						console.log("loaded encounter image");
						backgroundimg
						.composite(encounterIMG,38,0)
						.composite(playerIMG, 0, 25)
						.resize(811, 456, Jimp.RESIZE_NEAREST_NEIGHBOR);
						Jimp.read('./images/ui/encounterUI2.png', (err, ui) => {
							if (err) return;
							console.log("loaded ui");
							Jimp.read('./images/ui/blanksize2.png', (err, blank) => {
								if (err) return;
								console.log("loaded blank");
								blank
								.composite(backgroundimg, 0, 72)
								.composite(ui, 0, 0);
								Jimp.loadFont('./assets/pixeled.fnt', (err,mainFont) => {
									
									var playerHealthBar = Math.floor((player.health / player.maxHealth) * 256);
									for (i = 95; i < (playerHealthBar + 95); i++) {
										for (j = 519; j < 27 + 519; j++) {
											var col = Jimp.intToRGBA(blank.getPixelColor(i,j));
											if (col.r == 106 && col.g == 106 &&col.b == 106) {
												if (playerHealthBar < 64) {
													blank.setPixelColor(Jimp.rgbaToInt(255,0,0,255),i,j)
												}
												else if (playerHealthBar < 128) {
													blank.setPixelColor(Jimp.rgbaToInt(255,255,0,255),i,j)
												}
												else {
													blank.setPixelColor(Jimp.rgbaToInt(0,255,0,255),i,j)
												}
											}
										}
									}
									
									blank
									.print(mainFont,114,550,{text:player.name,alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
									.print(mainFont,220,-4,{text:"Random Encounter: " + encounterNames[encounterType],alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
									.print(mainFont,415,530,{text:getLocation(),alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},170)
									.quality(100)
									.write('./bin/output.png', err => console.error('write error:', err));
								});
							});
						});
					});
				});
			});
			break;
			
			case 5:
			Jimp.read('./images/locations/library/background.png', (err, backgroundimg) => {
				if (err) return;
				console.log("loaded background");
				Jimp.read("./bin/player.png", (err,playerIMG) => {
					console.log("loaded player");
					if (err) return;
						backgroundimg
						.composite(playerIMG, 0, 25)
						.resize(811, 456, Jimp.RESIZE_NEAREST_NEIGHBOR);
						Jimp.read('./images/ui/encounterUI2.png', (err, ui) => {
							if (err) return;
							console.log("loaded ui");
							Jimp.read('./images/ui/blanksize2.png', (err, blank) => {
								if (err) return;
								console.log("loaded blank");
								blank
								.composite(backgroundimg, 0, 72)
								.composite(ui, 0, 0);
								Jimp.loadFont('./assets/pixeled.fnt', (err,mainFont) => {
									
									var playerHealthBar = Math.floor((player.health / player.maxHealth) * 256);
									for (i = 95; i < (playerHealthBar + 95); i++) {
										for (j = 519; j < 27 + 519; j++) {
											var col = Jimp.intToRGBA(blank.getPixelColor(i,j));
											if (col.r == 106 && col.g == 106 &&col.b == 106) {
												if (playerHealthBar < 64) {
													blank.setPixelColor(Jimp.rgbaToInt(255,0,0,255),i,j)
												}
												else if (playerHealthBar < 128) {
													blank.setPixelColor(Jimp.rgbaToInt(255,255,0,255),i,j)
												}
												else {
													blank.setPixelColor(Jimp.rgbaToInt(0,255,0,255),i,j)
												}
											}
										}
									}
									
									blank
									.print(mainFont,114,550,{text:player.name,alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
									.print(mainFont,220,-4,{text:"Random Encounter: " + encounterNames[encounterType],alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
									.print(mainFont,415,530,{text:getLocation(),alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},170)
									.quality(100)
									.write('./bin/output.png', err => console.error('write error:', err));
							});
						});
					});
				});
			});
			break;
			
			case 8:
			
			console.log("reached render");
			Jimp.read('./images/locations/' + dungeon[stage].theme + '/background.png', (err, backgroundimg) => {
				if (err) return;
				console.log("loaded background");
				Jimp.read("./bin/player_aura.png", (err,playerIMG) => {
					console.log("loaded player");
					if (err) return;
				backgroundimg
					.composite(playerIMG, 0, 25);
					if (enemy.phases) {
						enemyimgpath = enemy.imgID + "/" + enemy.currentPhase
					}
					else {
						enemyimgpath = enemy.imgID
					}
					Jimp.read('./images/enemy-images/' + enemyimgpath + '/death.png', (err, enemyimg) => {
						if (err) return;
						console.log("loaded enemy");
						backgroundimg
							.composite(enemyimg, 40, 0);
							Jimp.read('./images/custom-player/' + lootReward.imgID.lootclass + "/" + lootReward.imgID.type + "/" + lootReward.imgID.variant + '.png', (err, lootIMG) => {
								console.log('./images/custom-player/' + lootReward.imgID.lootclass + "/" + lootReward.imgID.type + "/" + lootReward.imgID.variant + '.png')
								if (err) return;
								console.log("loaded loot");
								lootIMG
								.autocrop(Jimp.leaveBorder)
								.flip(true,false);
								Jimp.read('./images/custom-player/' + lootReward.imgID.lootclass + "/" + lootReward.imgID.type + "/" + lootReward.imgID.variant + '.png', (err, lootAura) => {
									lootAura
									.autocrop(Jimp.leaveBorder)
									.flip(true,false)
									.scale(1.4, Jimp.RESIZE_NEAREST_NEIGHBOR);
									for (i = 0; i < lootAura.bitmap.width; i++) {
										for (j = 0; j < lootAura.bitmap.height; j++) {
											var col = Jimp.intToRGBA(lootAura.getPixelColor(i,j));
											if (col.a == 255) {
												lootAura.setPixelColor(Jimp.rgbaToInt(tierAuraColour[lootReward.tier].r,tierAuraColour[lootReward.tier].g,tierAuraColour[lootReward.tier].b,255),i,j)
											}
										}
									}
									backgroundimg
									.composite(lootAura, 90 - (lootAura.bitmap.width / 2) ,50 - (lootAura.bitmap.height / 2))
									.composite(lootIMG, 90 - (lootIMG.bitmap.width / 2) ,50 - (lootIMG.bitmap.height / 2))
									.resize(811, 456, Jimp.RESIZE_NEAREST_NEIGHBOR);
									Jimp.read('./images/ui/encounterUI2.png', (err, ui) => {
										if (err) return;
										console.log("loaded ui");
										Jimp.read('./images/ui/blanksize2.png', (err, blank) => {
											if (err) return;
											console.log("loaded blank");
											blank
											.composite(backgroundimg, 0, 72)
											.composite(ui, 0, 0);
											Jimp.loadFont('./assets/pixeled.fnt', (err,mainFont) => {
												blank
												.print(mainFont,114,550,{text:player.name,alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
												.print(mainFont,220,-4,{text:"Loot Found:\n" + lootReward.name,alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
												.print(mainFont,415,530,{text:getLocation(),alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},170);
										
												var playerHealthBar = Math.floor((player.health / player.maxHealth) * 256);
												for (i = 95; i < (playerHealthBar + 95); i++) {
													for (j = 519; j < 27 + 519; j++) {
														var col = Jimp.intToRGBA(blank.getPixelColor(i,j));
														if (col.r == 106 && col.g == 106 &&col.b == 106) {
															if (playerHealthBar < 64) {
																blank.setPixelColor(Jimp.rgbaToInt(255,0,0,255),i,j)
															}
															else if (playerHealthBar < 128) {
																blank.setPixelColor(Jimp.rgbaToInt(255,255,0,255),i,j)
															}
															else {
																blank.setPixelColor(Jimp.rgbaToInt(0,255,0,255),i,j)
															}
														}
													}
												}
											
												var enemyHealthBar = Math.floor((enemy.health / enemy.maxHealth) * 256);
												for (i = 504; i > (504 - enemyHealthBar); i--) {
													for (j = 54; j < 27 + 54; j++) {
														var col = Jimp.intToRGBA(blank.getPixelColor(i,j));
														if (col.r == 106 && col.g == 106 &&col.b == 106) {
															if (enemyHealthBar < 64) {
																blank.setPixelColor(Jimp.rgbaToInt(255,0,0,255),i,j)
															}
															else if (enemyHealthBar < 128) {
																blank.setPixelColor(Jimp.rgbaToInt(255,255,0,255),i,j)
															}
															else {
																blank.setPixelColor(Jimp.rgbaToInt(0,255,0,255),i,j)
															}
														}
													}
												}
												blank
												.quality(100)
												.write('./bin/output.png', err => console.error('write error:', err));
										});
									});
								});
							});
						});
					});
				});
			});
			/*
			console.log("reached render");
			Jimp.read('./images/ui/loot-reward.png', (err, backgroundimg) => {
				if (err) return;
				console.log("loaded background");
				Jimp.read('./images/custom-player/' + lootReward.imgID.lootclass + "/" + lootReward.imgID.type + "/" + lootReward.imgID.variant + '.png', (err, lootIMG) => {
					console.log('./images/custom-player/' + lootReward.imgID.lootclass + "/" + lootReward.imgID.type + "/" + lootReward.imgID.variant + '.png')
					if (err) return;
					console.log("loaded loot");
					lootIMG
					.autocrop()
					.flip(true,false);
					backgroundimg
					.composite(lootIMG, 30 - (lootIMG.bitmap.width / 2) ,30 - (lootIMG.bitmap.height / 2))
					.resize(600, 600, Jimp.RESIZE_NEAREST_NEIGHBOR);
					Jimp.read('./images/ui/combatUI2.png', (err, ui) => {
						Jimp.loadFont('./assets/pixeled.fnt', (err,mainFont) => {
							backgroundimg
							.composite(ui,0,0)
							.print(mainFont,114,550,{text:player.name,alignmentX: Jimp.HORIZONTAL_ALIGN_LEFT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
							.print(mainFont,220,-4,{text:"Loot Found:\n" + lootReward.name,alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM},255)
							.quality(100)
							.write('./bin/output.png', err => console.error('write error:', err));
						});
					});
				});
			});
			*/
			break;
			
			case 26:
			Jimp.read('./images/ui/levelup.png', (err, levelupUI) => {
				Jimp.read('./images/custom-player/background/0.png', (err, backgroundimg) => {
					Jimp.read("./bin/player.png", (err,playerIMG) => {
						backgroundimg
						.composite(levelupUI,0,0)
						.composite(playerIMG,0,0)
						.resize(600, 600, Jimp.RESIZE_NEAREST_NEIGHBOR)
						.quality(100)
						.write('./bin/output.png');
					});
				});
			})
			break;
		}
	}
	finalPost(output, comment);
}

function compareValues(key, order='asc') {
  return function(a, b) {
    if(!a.hasOwnProperty(key) || 
       !b.hasOwnProperty(key)) {
  	  return 0; 
    }
    
    const varA = (typeof a[key] === 'string') ? 
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ? 
      b[key].toUpperCase() : b[key];
      
    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ? 
      (comparison * -1) : comparison
    );
  };
}

function getTimeStamp() {
	var d = new Date();
	return("[" + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + " " + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + "] ");
}

function getLocation () {
	var playerLocation = dungeon[stage].roomName.toUpperCase() + " " + (room) + ", " + dungeon[stage].floorName.toUpperCase() + " " + (floor + 1) + " OF " + dungeon[stage].name.toUpperCase() + " (STAGE " + (stage + 1) + ")";
	return playerLocation;
}

function getPlayerInfo () {
	var storedItemsText = "Items To Sell (" + player.storedItems.length + "/" + player.storedItemsCapacity + "): ";
	i = 0;
	while (i < player.storedItems.length) {
		if (i > 0) {
			storedItemsText += ", "
		}
		storedItemsText += player.storedItems[i].name + " (approx worth " + Math.floor(player.storedItems[i].cost / 2) + " gold)";
		i++;
	}
	var statusEffects = "Current Status Effects: ";
	if (player.blindDuration > 0) {
		if (player.blindDuration == 1) {
			statusEffects += "Blindness - " + player.blindDuration + " Turn Remaining, "
		}
		else {
			statusEffects += "Blindness - " + player.blindDuration + " Turns Remaining, "
		}
		
	}
	if (player.madnessDuration > 0) {
		if (player.madnessDuration == 1) {
			statusEffects += "Madness - " + player.madnessDuration + " Turn Remaining, "
		}
		else {
			statusEffects += "Madness - " + player.madnessDuration + " Turns Remaining, "
		}
		
	}
	if (player.frost > 0) {
		if (player.frost == 1) {
			statusEffects += "Frost - " + player.frost + " Turn Remaining, "
		}
		else {
			statusEffects += "Frost - " + player.frost + " Turns Remaining, "
		}
		
	}
	if (player.poison > 0) {
		if (player.poison == 1) {
			statusEffects += "Poison - " + player.poison + " Turn Remaining, "
		}
		else {
			statusEffects += "Poison - " + player.poison + " Turns Remaining, "
		}
		
	}
	if (player.decayDuration > 0) {
		if (player.decayDuration == 1) {
			statusEffects += "Decay - -" + player.decayStrength + " Health Per Turn - " + player.decayDuration + " Turn Remaining, "
		}
		else {
			statusEffects += "Decay - -" + player.decayStrength + " Health Per Turn - " + player.decayDuration + " Turns Remaining, "
		}
		
	}
	if (player.blaze > 0) {
		statusEffects += "Blaze - " + player.blaze + " This Turn (50% chance to extingish, 50% chance to double), "
	}
	if (player.shock > 0) {
		if (player.shock == 1) {
			statusEffects += "Shock - " + player.shock + " Turn Remaining, "
		}
		else {
			statusEffects += "Shock - " + player.shock + " Turns Remaining, "
		}
	}
	if (player.lock > 0) {
		if (player.lock == 1) {
			statusEffects += "Lock - " + player.lock + " Turn Remaining (previous move: " + player.moves[player.previousMove] + "), "
		}
		else {
			statusEffects += "Lock - " + player.lock + " Turns Remaining (previous move: " + player.moves[player.previousMove] + "), "
		}
	}
	
	console.log(player.head.durability[0])
	
	var playerInfo = "CORE STATS\nCore Health - " + player.healthCore + "\nCore Attack - " + player.attackCore + "\nCore Defense - " + player.defenseCore + "\nGold - " + runGold + "\nCurrent Level - " + playerLevel + "\nCurrent XP - " + player.xp + "/" + Math.floor((playerLevel ** 1.5) * 10) + "\n\n" + statusEffects + "\n\nEQUIPMENT\nHead: " + player.head.name + "\n" + player.head.identifier + "\n- " + player.head.defenseBonus + " Defense - " + player.head.modifications + " Modifications - Sell Value ~ " + Math.floor(player.head.cost / 2) + " Gold\n- Durability: " + player.head.durability[0] + "/" + player.head.durability[1] + "\n\nBody: " + player.body.name + "\n" + player.body.identifier + "\n- " + player.body.defenseBonus + " Defense - " + player.body.modifications + " Modifications - Sell Value ~ " + Math.floor(player.body.cost / 2) + " Gold\n- Durability: " + player.body.durability[0] + "/" + player.body.durability[1] + "\n\nArms: " + player.arms.name + "\n" + player.arms.identifier + "\n- " + player.arms.defenseBonus + " Defense - " + player.arms.modifications + " Modifications - Sell Value ~ " + Math.floor(player.arms.cost / 2) + " Gold\n- Durability: " + player.arms.durability[0] + "/" + player.arms.durability[1] + "\n\nLegs: " + player.legs.name + "\n" + player.legs.identifier + "\n- " + player.legs.defenseBonus + " Defense - " + player.legs.modifications + " Modifications - Sell Value ~ " + Math.floor(player.legs.cost / 2) + " Gold\n- Durability: " + player.legs.durability[0] + "/" + player.legs.durability[1] + "\n\nWeapon: " + player.weapon.name + "\n" + player.weapon.identifier + "\n- " + player.weapon.attackBonus + " Attack - " + player.weapon.modifications + " Modifications - Sell Value ~ " + Math.floor(player.weapon.cost / 2) + " Gold\n- Durability: " + player.weapon.durability[0] + "/" + player.weapon.durability[1] + "\n\nOffhand: " + player.offhand.name + "\n" + player.offhand.identifier + "\n- " + player.offhand.attackBonus + " Attack, " + player.offhand.defenseBonus + " Defense - " + player.offhand.modifications + " Modifications - Sell Value ~ " + Math.floor(player.offhand.cost / 2) + " Gold\n- Durability: " + player.offhand.durability[0] + "/" + player.offhand.durability[1] + "\n\nRelic: " + player.relic.name + "\n" + player.relic.identifier + "\n- " + player.relic.healthBonus + " Additional Health - " + player.relic.modifications + " Modifications - Sell Value ~ " + Math.floor(player.relic.cost / 2) + " Gold\n- Durability: " + player.relic.durability[0] + "/" + player.relic.durability[1] + "\n\nSecondary Weapon: " + player.secondaryWeapon.name + "\n" + player.secondaryWeapon.identifier + "\n- " + player.secondaryWeapon.attackBonus + " Attack - " + player.secondaryWeapon.modifications + " Modifications - Sell Value ~ " + Math.floor(player.secondaryWeapon.cost / 2) + " Gold\n- Durability: " + player.secondaryWeapon.durability[0] + "/" + player.secondaryWeapon.durability[1] + "\n\nSecondary Offhand: " + player.secondaryOffhand.name + "\n" + player.secondaryOffhand.identifier + "\n- " + player.secondaryOffhand.attackBonus + " Attack, " + player.secondaryOffhand.defenseBonus + " Defense - " + player.secondaryOffhand.modifications + " Modifications - Sell Value ~ " + Math.floor(player.secondaryOffhand.cost / 2) + " Gold\n- Durability: " + player.secondaryOffhand.durability[0] + "/" + player.secondaryOffhand.durability[1] + "\n\n" + storedItemsText;
	return playerInfo;
}

function getEnemyInfo () {
	i = 1;
	enemyMoveList = "Enemy Moves:\n";
	while (i < enemy.attacks.length) {
		if (i > 1) {
			enemyMoveList += "\n"
		}
		if (enemy.attacks[i].known) {
			enemyMoveList += enemy.attacks[i].name
		}
		else {
			enemyMoveList += "???"
		}
		i++;
	}
	
	var statusEffects = "\nCurrent Status Effects: ";
	if (enemy.poison > 0) {
		if (enemy.poison == 1) {
			statusEffects += "Poison - " + enemy.poison + " Turn Remaining, "
		}
		else {
			statusEffects += "Poison - " + enemy.poison + " Turns Remaining, "
		}
		
	}
	if (enemy.decayDuration > 0) {
		if (enemy.decayDuration == 1) {
			statusEffects += "Decay - -" + enemy.decayStrength + " Health Per Turn - " + enemy.decayDuration + " Turn Remaining, "
		}
		else {
			statusEffects += "Decay - -" + enemy.decayStrength + " Health Per Turn - " + enemy.decayDuration + " Turns Remaining, "
		}
		
	}
	if (enemy.blaze > 0) {
		statusEffects += "Blaze - " + enemy.blaze + " This Turn, "
	}
	if (enemy.shock > 0) {
		if (enemy.shock == 1) {
			statusEffects += "Shock - " + enemy.shock + " Turn Remaining, "
		}
		else {
			statusEffects += "Shock - " + enemy.shock + " Turns Remaining, "
		}
	}
	
	var typeList = "\nEnemy Types:";
	if (enemy.boss) {
		typeList += " Boss,";
	}
	else if (enemy.miniboss) {
		typeList += " Mini Boss,";
	}
	else {
		typeList += " Standard,";
	}
	if (enemy.player) {
		typeList += " Explorer,";
	}
	if (enemy.fallen) {
		typeList += " Fallen,";
	}
	if (enemy.ethereal) {
		typeList += " Ethereal,";
	}
	if (enemy.flying) {
		typeList += " Flying,";
	}
	if (enemy.small) {
		typeList += " Small,";
	}
	if (enemy.big) {
		typeList += " Big,";
	}
	if (enemy.mounted) {
		typeList += " Mounted,";
	}
	if (enemy.armoured) {
		typeList += " Armoured,";
	}
	if (enemy.burrowing) {
		typeList += " Burrowing,";
	}
	if (enemy.risen) {
		typeList += " Risen,";
	}
	if (enemy.phantasmal) {
		typeList += " Phantasmal,";
	}
	if (enemy.aviant) {
		typeList += " Aviant,";
	}
	if (enemy.miniscant) {
		typeList += " Miniscant,";
	}
	if (enemy.goliathan) {
		typeList += " Goliathan,";
	}
	if (enemy.cavalric) {
		typeList += " Cavalric,";
	}
	if (enemy.impenetrable) {
		typeList += " Impenetrable,";
	}
	if (enemy.tunneling) {
		typeList += " Tunneling,";
	}
	
	if (typeList == "\nEnemy Types:") {
		typeList += " None "
	}
	else {
		typeList = typeList.slice(0,(typeList.length - 1))
	}
	var enemyInfo = "ENEMY DETAILS\n" + enemyMoveList + "\n" + statusEffects + "\n" + typeList + "\n";
	return enemyInfo;
}

function getPlayerMoves () {
	var playerMoves = "Moves (react to the post)\n\n";
	i = 1;
	while (i < 6) {
		if (i == player.previousMove && player.lock > 0) {
			playerMoves += "[Previous Move] "
		}
		playerMoves += player.moves[i].name;
		if (player.moves[i].reqCharge) {
			if (player.moves[i].reqCharge == player.moves[i].charge) {
				playerMoves += " [Charge Level: READY]";
			}
			else {
				playerMoves += " [Charge Level: " + player.moves[i].charge + "/" + player.moves[i].reqCharge + "]";
			}
		}
		playerMoves += " (" + player.moves[i].description + ") - " + moveSlots[i] + " \n"
		i++;
	}
	playerMoves += "\nSpecial Abilities: " + player.abilityText;
	return playerMoves;
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

