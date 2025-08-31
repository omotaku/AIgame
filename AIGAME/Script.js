// --- DOM要素の取得 ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const messageWindow = document.getElementById('message-window').querySelector('p');
const commandWindow = document.getElementById('command-window');
const statusWindow = document.getElementById('status-window');
const shopWindow = document.getElementById('shop-window');
const weaponShopWindow = document.getElementById('weapon-shop-window');
const armorShopWindow = document.getElementById('armor-shop-window');
const innWindow = document.getElementById('inn-window');
const menuWindow = document.getElementById('menu-window');
const battleItemWindow = document.getElementById('battle-item-window');
const allocationWindow = document.getElementById('allocation-window');
const gameClearWindow = document.getElementById('game-clear-window');

// --- ゲームの状態管理 ---
let gameState = 'map';

// --- ゲームの基本設定 ---
const TILE_SIZE = 32;
const MAP_COLS = 20;
const MAP_ROWS = 15;
canvas.width = TILE_SIZE * MAP_COLS;
canvas.height = TILE_SIZE * MAP_ROWS;

const COLORS = {
    floor: '#6B8E23', wall: '#8B4513', player: '#00ff00',
    enemy: '#ff3300', battleBg: '#00004d',
    shop: '#DAA520', weapon_shop: '#B22222', armor_shop: '#4682B4', inn: '#FF1493',
    warp: '#9933ff', rock: '#808080', boss: '#FF4500', npc: '#00BFFF'
};

const BATTLE_COMMANDS = ['たたかう', 'どうぐ', 'にげる'];
let selectedCommandIndex = 0;

// --- イベントフラグ管理 ---
const eventFlags = { king_quest_accepted: false, golem_defeated: false, anubis_defeated: false, blizzard_defeated: false, salamander_defeated: false, kraken_defeated: false, baramos_seal_broken: false };

// --- マップデータ ---
let currentMapId = 'castle_town';
// (マップデータは長いため、ここでは省略しますがコードには含まれます)
const maps = {
    'castle_town': {
        name: '王国の城下町', theme: 'dungeon',
        layout: [
            [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,9,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],[1,1,7,0,1,1,1,1,1,1,1,1,1,1,1,1,0,5,1,1],[1,1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1],[1,1,2,0,1,1,1,1,1,1,1,1,1,1,1,1,0,6,1,1],[1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1],[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        warps: { "13,9": { destMap: 'grassland', destX: 9, destY: 1 }, "13,10": { destMap: 'grassland', destX: 10, destY: 1 } }, encounterRate: 0, enemies: []
    },
    'grassland': {
        name: '草原', theme: 'grassland',
        layout: [
            [1,1,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1,1],[1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,4,4,1],[1,0,1,0,0,0,1,0,0,0,0,1,0,0,1,0,0,4,4,1],[1,0,1,1,1,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1],[1,0,0,0,1,0,0,0,1,0,0,1,0,1,0,0,0,1,0,1],[1,0,1,1,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],[1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,1],[1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,1,0,1,1,1,1,1,1,0,1,1,1,1,1,0,1],[1,0,1,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,1,4,4,1,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
        ],
        warps: {
            "0,9":{destMap:'castle_town',destX:9,destY:12},"0,10":{destMap:'castle_town',destX:10,destY:12},"1,16":{destMap:'bright_forest',destX:1,destY:7},"2,17":{destMap:'hidden_grassland',destX:1,destY:2},"2,18":{destMap:'hidden_grassland',destX:1,destY:3},"3,17":{destMap:'hidden_grassland',destX:1,destY:2},"3,18":{destMap:'hidden_grassland',destX:1,destY:3},"13,9":{destMap:'desert',destX:9,destY:1},"13,10":{destMap:'desert',destX:10,destY:1}
        },
        encounterRate: 0.1, enemies: ['slime', 'goblin']
    },
    'bright_forest': { name: '明るい森', theme: 'grassland', layout: [ [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,1,0,0,1,0,1,0,0,0,0,1,0,0,0,0,1],[1,0,1,0,1,0,0,1,0,0,0,1,1,0,1,0,1,1,0,1],[1,0,0,0,0,0,1,1,0,1,0,0,0,0,1,0,0,0,0,1],[1,0,1,1,1,0,0,0,0,1,0,1,0,1,1,1,1,1,0,1],[1,0,0,0,0,1,1,1,1,1,0,1,0,0,0,0,0,0,0,1],[1,1,1,1,0,0,0,0,0,0,0,1,0,1,0,1,0,1,0,1],[3,0,0,1,0,1,1,0,1,1,1,1,0,1,0,1,0,1,0,1],[1,0,1,1,0,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1],[1,0,0,0,1,0,1,0,1,1,1,1,0,1,1,1,0,0,0,1],[1,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,1,0,1,1,1,1,1,1,0,1,0,1],[1,0,1,1,1,0,1,0,1,0,0,0,0,0,0,0,0,1,0,1],[1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]], warps:{"7,0":{destMap:'grassland',destX:17,destY:1}}, encounterRate:0.15, enemies:['goblin','orc']},
    'hidden_grassland': { name: '隠された草原', theme: 'grassland', layout: [ [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[3,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],[3,0,0,0,0,0,0,0,0,8,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1],[1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],[1,0,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,0,1],[1,0,0,0,1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],[1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]], warps:{"2,0":{destMap:'grassland',destX:17,destY:1},"3,0":{destMap:'grassland',destX:17,destY:1}}, encounterRate:0.2, enemies:['orc','ogre']},
    'desert': { name: '砂漠', theme: 'desert', layout: [ [1,1,1,1,1,1,1,1,1,3,3,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,1],[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],[1,0,0,1,0,3,0,1,1,1,1,1,0,3,0,1,0,0,0,1],[1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1],[1,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]], warps:{"0,9":{destMap:'grassland',destX:9,destY:12},"0,10":{destMap:'grassland',destX:10,destY:12},"6,5":{destMap:'pyramid',destX:9,destY:13},"6,13":{destMap:'pyramid',destX:10,destY:13}}, encounterRate:0.2, enemies:['orc','ogre']},
    'pyramid': { name: 'ピラミッド', theme: 'dungeon', layout: [ [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1],[1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1],[1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1],[1,1,1,1,1,0,0,0,0,8,0,0,0,0,0,1,1,1,1,1],[1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,0,1,1,1,1,1,1,1,1,1,0,0,0,1,0,1],[1,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,1],[1,0,1,0,0,0,0,0,0,3,3,0,0,0,0,0,0,1,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]], warps:{"13,9":{destMap:'desert',destX:6,destY:6},"13,10":{destMap:'desert',destX:6,destY:14}}, encounterRate:0.25, enemies:['ogre']},
    'baramos_castle': { name: '魔王城', theme: 'dungeon', layout: [ [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,8,0,0,0,0,0,0,1,0,1],[1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,1,0,1,1,0,1,1,1,1,1,0,1,1,0,1,0,1],[1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],[1,0,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]], warps:{"13,9":{destMap:'castle_town',destX:9,destY:2},"13,10":{destMap:'castle_town',destX:10,destY:2}}, encounterRate:0.3, enemies:['orc','ogre']}
};

// --- プレイヤー・アイテム・装備データ ---
const player = { x: 10, y: 12, name: 'ゆうしゃ', level: 1, exp: 0, gold: 50, hp: 12, maxHp: 12, baseAttack: 5, baseDefense: 1, baseSpeed: 4, skillPoints: 0, equipment: { weapon: null, armor: null }, inventory: { 'potion': 3 } };
const LEVEL_UP_EXP = [0, 8, 20, 45, 90, 170, 300, 550, 900, 1500, 2500];
const ITEM_MASTER = { 'potion': { name: 'やくそう', price: 15, description: 'HPを25かいふくする', effect: { hp: 25 } } };
const EQUIPMENT_MASTER = { 'w001': { name: 'こんぼう', type: 'weapon', attack: 3, price: 60, description: 'ただの木の棒。' }, 'w002': { name: 'どうのつるぎ', type: 'weapon', attack: 8, price: 250, description: '青銅でできた剣。' }, 'w003': { name: 'はがねのつるぎ', type: 'weapon', attack: 16, price: 1200, description: '鍛えられた鋼の剣。' }, 'w004': { name: 'ゆうしゃのけん', type: 'weapon', attack: 35, price: 99999, description: '伝説の勇者が使った聖剣。' }, 'a001': { name: 'ぬののふく', type: 'armor', defense: 2, price: 50, description: 'ただの布の服。' }, 'a002': { name: 'かわのよろい', type: 'armor', defense: 6, price: 220, description: '動物の皮で作られた鎧。' }, 'a003': { name: 'てつのよろい', type: 'armor', defense: 12, price: 1000, description: '鉄でできた頑丈な鎧。' }, 'a004': { name: 'ゆうしゃのたて', type: 'armor', defense: 25, price: 99999, description: '悪を退けると言われる伝説の盾。' } };
const ENEMY_MASTER = { 'slime': { name: 'スライム', hp: 8, maxHp: 8, attack: 2, defense: 1, speed: 2, exp: 2, gold: 4 }, 'goblin': { name: 'ゴブリン', hp: 15, maxHp: 15, attack: 4, defense: 2, speed: 5, exp: 5, gold: 10 }, 'orc': { name: 'オーク', hp: 35, maxHp: 35, attack: 8, defense: 4, speed: 3, exp: 12, gold: 22 }, 'ogre': { name: 'オーガ', hp: 60, maxHp: 60, attack: 12, defense: 5, speed: 2, exp: 28, gold: 45 }, 'golem': { name: 'ゴーレム', hp: 200, maxHp: 200, attack: 15, defense: 15, speed: 1, exp: 120, gold: 150, isBoss: true }, 'anubis': { name: 'アヌビス', hp: 350, maxHp: 350, attack: 25, defense: 8, speed: 8, exp: 350, gold: 500, isBoss: true }, 'blizzard': { name: 'ブリザード', hp: 300, maxHp: 300, attack: 35, defense: 5, speed: 10, exp: 400, gold: 600, isBoss: true }, 'salamander': { name: 'サラマンダー', hp: 450, maxHp: 450, attack: 40, defense: 12, speed: 6, exp: 600, gold: 800, isBoss: true }, 'kraken': { name: 'クラーケン', hp: 400, maxHp: 400, attack: 30, defense: 15, speed: 7, exp: 550, gold: 700, isBoss: true }, 'baramos': { name: 'まおうバラモス', hp: 1000, maxHp: 1000, attack: 50, defense: 20, speed: 12, exp: 0, gold: 0, isBoss: true } };
const SHOP_DATA = { 'item': ['potion'], 'weapon': ['w001', 'w002', 'w003', 'w004'], 'armor': ['a001', 'a002', 'a003', 'a004'] };
const NPC_DATA = { 'castle_town': { '1,9': { name: '王様', messages: [ { flag: 'baramos_seal_broken', msg: "おお、ゆうしゃよ！ついにこのときが… まおうのしろへのみちをひらいた！ゆけ！" }, { flag: 'kraken_defeated', msg: "すべてのしてんのうをたおしたか！まことのゆうしゃよ！" }, { flag: 'salamander_defeated', msg: "サラマンダーをたおしたか！のこるはあとひとり…！" }, { flag: 'blizzard_defeated', msg: "ブリザードをたおしたか！よくやった！" }, { flag: 'anubis_defeated', msg: "アヌビスをたおしたか！たいしたものだ！" }, { flag: 'golem_defeated', msg: "ゴーレムをたおしたか！でかしたぞ！" }, { flag: 'king_quest_accepted', msg: "まおうを たおし このせかいに へいわをとりもどしてくれ！" }, { flag: null, msg: "おお、ゆうしゃよ！よくぞ まいった。", setFlag: 'king_quest_accepted'}, { flag: null, msg: "このせかいは まおうバラモスの てによって やみにつつまれようとしておる。" }, { flag: null, msg: "どうか、このせかいをすくってくれ！" } ] } } };
let currentEnemy = null; let innChoiceIndex = 0; let previousLevel = 1; let selectedShopItemIndex = 0; const MAIN_MENU_ITEMS = ['どうぐ', 'そうび', 'つよさ', 'とじる']; let selectedMainMenuIndex = 0; let selectedItemMenuIndex = 0; let selectedBattleItemIndex = 0; const ALLOCATABLE_STATS = ['maxHp', 'baseAttack', 'baseDefense', 'baseSpeed']; const STAT_NAMES = { maxHp: 'さいだいHP', baseAttack: 'こうげき力', baseDefense: 'ぼうぎょ力', baseSpeed: 'すばやさ' }; let selectedStatIndex = 0; let allocationCompleteCallback = null;

// --- プレイヤーの総合ステータス計算 ---
function getPlayerTotalStats() { let totalAttack = player.baseAttack; let totalDefense = player.baseDefense; let totalSpeed = player.baseSpeed; if (player.equipment.weapon && EQUIPMENT_MASTER[player.equipment.weapon]) { totalAttack += EQUIPMENT_MASTER[player.equipment.weapon].attack; } if (player.equipment.armor && EQUIPMENT_MASTER[player.equipment.armor]) { totalDefense += EQUIPMENT_MASTER[player.equipment.armor].defense; } return { attack: totalAttack, defense: totalDefense, speed: totalSpeed }; }

// --- 描画・更新関数 ---
function drawMapScreen() {
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height); const layout = maps[currentMapId].layout; const mapTheme = maps[currentMapId].theme || 'grassland'; const themeColors = { grassland: { floor: ['#5a8f29', '#6b9c3f'], wall: ['#8B4513', '#a0522d'] }, desert: { floor: ['#f0e68c', '#ddd07e'], wall: ['#cd853f', '#d29653'] }, dungeon: { floor: ['#696969', '#7f7f7f'], wall: ['#4d4d4d', '#616161'] }, }; const currentTheme = themeColors[mapTheme];
    for (let y = 0; y < MAP_ROWS; y++) { for (let x = 0; x < MAP_COLS; x++) { const tile = layout[y][x]; let grad; const startX = x * TILE_SIZE; const startY = y * TILE_SIZE; grad = ctx.createLinearGradient(startX, startY, startX + TILE_SIZE, startY + TILE_SIZE); let colorSet; let specialColor = null;
    switch (tile) { case 1: colorSet = currentTheme.wall; break; case 2: specialColor = COLORS.shop; break; case 3: specialColor = COLORS.warp; break; case 4: specialColor = COLORS.rock; break; case 5: specialColor = COLORS.weapon_shop; break; case 6: specialColor = COLORS.armor_shop; break; case 7: specialColor = COLORS.inn; break; case 8: specialColor = COLORS.boss; break; case 9: specialColor = COLORS.npc; break; default: colorSet = currentTheme.floor; break; }
    if (specialColor) { ctx.fillStyle = specialColor; ctx.fillRect(startX, startY, TILE_SIZE, TILE_SIZE); } else { grad.addColorStop(0, colorSet[0]); grad.addColorStop(1, colorSet[1]); ctx.fillStyle = grad; ctx.fillRect(startX, startY, TILE_SIZE, TILE_SIZE); }
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)'; ctx.lineWidth = 2; ctx.strokeRect(startX + 1, startY + 1, TILE_SIZE - 2, TILE_SIZE - 2); } }
    ctx.fillStyle = COLORS.player; ctx.fillRect(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE); ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'; ctx.lineWidth = 2; ctx.strokeRect(player.x * TILE_SIZE + 1, player.y * TILE_SIZE + 1, TILE_SIZE - 2, TILE_SIZE - 2);
}
function drawBattleScreen() { ctx.fillStyle = COLORS.battleBg; ctx.fillRect(0, 0, canvas.width, canvas.height); if (currentEnemy) { ctx.fillStyle = COLORS.enemy; ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 - 100, 100, 100); ctx.fillStyle = '#fff'; ctx.font = '24px "Courier New", Courier, monospace'; ctx.textAlign = 'center'; ctx.fillText(currentEnemy.name, canvas.width / 2, 80); } }
function drawGame() { if (gameState === 'map' || gameState === 'talking') { drawMapScreen(); } else if (gameState.startsWith('battle')) { drawBattleScreen(); } }
function updatePlayerInfoWindow() { document.getElementById('info-level').textContent = `Lv: ${player.level}`; document.getElementById('info-hp').textContent = `HP: ${player.hp} / ${player.maxHp}`; document.getElementById('info-exp').textContent = `EXP: ${player.exp}`; document.getElementById('info-gold').textContent = `G: ${player.gold}`; const hpPercentage = (player.hp / player.maxHp) * 100; document.getElementById('info-hp-bar').style.width = `${hpPercentage}%`; }
function updateStatusDisplay() { document.getElementById('player-status').innerHTML = `${player.name}<br>HP: ${player.hp}/${player.maxHp}`; if (currentEnemy) { document.getElementById('enemy-status').innerHTML = `${currentEnemy.name}<br>HP: ${currentEnemy.hp}/${currentEnemy.maxHp}`; } }
function drawCommands() { const ul = commandWindow.querySelector('ul'); ul.innerHTML = ''; BATTLE_COMMANDS.forEach((cmd, i) => { const li = document.createElement('li'); li.textContent = cmd; if (i === selectedCommandIndex) li.classList.add('selected'); ul.appendChild(li); }); commandWindow.classList.remove('inactive'); }

// --- メニュー関連 ---
function openMainMenu() { gameState = 'menu-main'; selectedMainMenuIndex = 0; document.getElementById('menu-main').classList.remove('hidden'); document.getElementById('menu-item').classList.add('hidden'); document.getElementById('menu-status').classList.add('hidden'); document.getElementById('menu-equipment').classList.add('hidden'); menuWindow.classList.remove('hidden'); messageWindow.textContent = 'コマンドを えらんでください。'; drawMainMenu(); }
function closeMenu() { gameState = 'map'; menuWindow.classList.add('hidden'); messageWindow.textContent = '矢印キーで探索を続けよう。'; }
function drawMainMenu() { const listEl = document.getElementById('menu-main-list'); listEl.innerHTML = ''; MAIN_MENU_ITEMS.forEach((item, index) => { const li = document.createElement('li'); li.textContent = item; if (index === selectedMainMenuIndex) li.classList.add('selected'); listEl.appendChild(li); }); }
function executeMainMenuCommand() { const command = MAIN_MENU_ITEMS[selectedMainMenuIndex]; if (command === 'どうぐ') openItemMenu(); else if (command === 'そうび') showEquipmentMenu(); else if (command === 'つよさ') showStatusMenu(); else if (command === 'とじる') closeMenu(); }
function openItemMenu() { gameState = 'menu-item'; selectedItemMenuIndex = 0; document.getElementById('menu-main').classList.add('hidden'); document.getElementById('menu-item').classList.remove('hidden'); drawItemMenu(); }
function drawItemMenu() { const listEl = document.getElementById('menu-item-list'); listEl.innerHTML = ''; const ownedItems = Object.keys(player.inventory).filter(id => player.inventory[id] > 0); if (ownedItems.length === 0) { listEl.innerHTML = '<li>なにももっていない</li>'; return; } ownedItems.forEach((itemId, index) => { const item = ITEM_MASTER[itemId]; const count = player.inventory[itemId]; const li = document.createElement('li'); li.innerHTML = `<span>${item.name}</span> <span>x${count}</span>`; if (index === selectedItemMenuIndex) li.classList.add('selected'); listEl.appendChild(li); }); }
function useItemFromMenu() { const ownedItems = Object.keys(player.inventory).filter(id => player.inventory[id] > 0); if (ownedItems.length === 0) return; const itemId = ownedItems[selectedItemMenuIndex]; const item = ITEM_MASTER[itemId]; if (player.hp >= player.maxHp) { messageWindow.textContent = 'HPは まんたんだ！'; return; } player.inventory[itemId]--; player.hp = Math.min(player.maxHp, player.hp + item.effect.hp); messageWindow.textContent = `${player.name} は ${item.name} をつかった！ HPが ${item.effect.hp} かいふくした！`; updatePlayerInfoWindow(); drawItemMenu(); }
function showStatusMenu() { gameState = 'menu-status'; document.getElementById('menu-main').classList.add('hidden'); const statusDiv = document.getElementById('menu-status'); statusDiv.classList.remove('hidden'); const playerStats = getPlayerTotalStats(); statusDiv.innerHTML = `<h2>つよさ</h2><p>なまえ: ${player.name}<br>レベル: ${player.level}<br>HP: ${player.hp} / ${player.maxHp}<br>こうげき力: ${playerStats.attack}<br>ぼうぎょ力: ${playerStats.defense}<br>すばやさ: ${playerStats.speed}<br>けいけんち: ${player.exp}<br>しょじ金: ${player.gold} G</p><p>(Escキーで もどる)</p>`; }
function showEquipmentMenu() { gameState = 'menu-equipment'; document.getElementById('menu-main').classList.add('hidden'); document.getElementById('menu-equipment').classList.remove('hidden'); const weaponName = player.equipment.weapon ? EQUIPMENT_MASTER[player.equipment.weapon].name : 'なし'; const armorName = player.equipment.armor ? EQUIPMENT_MASTER[player.equipment.armor].name : 'なし'; document.getElementById('current-weapon').textContent = `ぶき: ${weaponName}`; document.getElementById('current-armor').textContent = `たて: ${armorName}`; }

// --- お店・宿屋関連 ---
function enterShop(type) { messageWindow.textContent = 'いらっしゃいませ！'; if (type === 'weapon') { gameState = 'weapon_shop'; selectedShopItemIndex = 0; weaponShopWindow.classList.remove('hidden'); drawShop('weapon'); } else if (type === 'armor') { gameState = 'armor_shop'; selectedShopItemIndex = 0; armorShopWindow.classList.remove('hidden'); drawShop('armor'); } else if (type === 'inn') { gameState = 'inn'; innChoiceIndex = 0; innWindow.classList.remove('hidden'); drawInnChoices(); } else { gameState = 'shop'; selectedShopItemIndex = 0; shopWindow.classList.remove('hidden'); drawShop('item'); } }
function exitShop(type) { if (type === 'weapon') weaponShopWindow.classList.add('hidden'); else if (type === 'armor') armorShopWindow.classList.add('hidden'); else if (type === 'inn') innWindow.classList.add('hidden'); else shopWindow.classList.add('hidden'); gameState = 'map'; messageWindow.textContent = 'ありがとうございました！'; }
function drawShop(type) { const itemList = SHOP_DATA[type]; const listEl = document.getElementById(type === 'item' ? 'shop-item-list' : `${type}-shop-list`); listEl.innerHTML = ''; itemList.forEach((itemId, index) => { const item = ITEM_MASTER[itemId] || EQUIPMENT_MASTER[itemId]; if (!item) { console.error(`エラー: "${itemId}" というIDのアイテムがありません。`); return; } const li = document.createElement('li'); if (index === selectedShopItemIndex) { li.classList.add('selected'); const descEl = document.getElementById(`${type}-shop-description`); if(descEl) descEl.textContent = item.description; } li.innerHTML = `<span>${item.name}</span><span>${item.price} G</span>`; listEl.appendChild(li); }); const goldEl = document.getElementById(type === 'item' ? 'shop-player-gold' : `${type}-player-gold`); if(goldEl) goldEl.textContent = `所持金: ${player.gold} G`; }
function buyItem(type) { const itemList = SHOP_DATA[type]; if(selectedShopItemIndex >= itemList.length) return; const itemId = itemList[selectedShopItemIndex]; const item = ITEM_MASTER[itemId] || EQUIPMENT_MASTER[itemId]; if (player.gold >= item.price) { player.gold -= item.price; if (type === 'item') { player.inventory[itemId] = (player.inventory[itemId] || 0) + 1; messageWindow.textContent = `${item.name} を 1つ こうにゅうした！`; } else { player.equipment[type] = itemId; messageWindow.textContent = `${item.name} を そうびした！`; } updatePlayerInfoWindow(); drawShop(type); } else { messageWindow.textContent = 'ゴールドが たりないようですな。'; } }
function drawInnChoices() { const choices = innWindow.querySelectorAll('li'); choices.forEach((li, index) => { if (index === innChoiceIndex) li.classList.add('selected'); else li.classList.remove('selected'); }); }
function stayAtInn() { if (player.gold >= 10) { player.gold -= 10; player.hp = player.maxHp; updatePlayerInfoWindow(); messageWindow.textContent = 'HPが かいふくした！'; setTimeout(() => exitShop('inn'), 1500); } else { messageWindow.textContent = 'ゴールドが たりない！'; setTimeout(() => exitShop('inn'), 1500); } }

// --- ゲームオーバー＆クリア ---
function gameOver() { gameState = 'gameover'; messageWindow.textContent = 'GAME OVER...'; setTimeout(() => { location.reload(); }, 3000); }
function gameClear() { gameState = 'game_clear'; commandWindow.classList.add('hidden'); statusWindow.classList.add('hidden'); messageWindow.classList.add('hidden'); gameClearWindow.classList.remove('hidden'); }

// --- 戦闘関連 ---
function startBattle(forcedEnemyId = null) {
    gameState = 'battle-command-select';
    let enemyKey;
    if (forcedEnemyId) {
        enemyKey = forcedEnemyId;
    } else {
        const currentMapEnemies = maps[currentMapId].enemies;
        if (currentMapEnemies.length === 0) return;
        enemyKey = currentMapEnemies[Math.floor(Math.random() * currentMapEnemies.length)];
    }
    currentEnemy = { ...ENEMY_MASTER[enemyKey] };
    currentEnemy.id = enemyKey;
    selectedCommandIndex = 0;
    messageWindow.textContent = `${currentEnemy.name} があらわれた！`;
    document.getElementById('message-window').classList.add('battle-mode');
    commandWindow.classList.remove('hidden');
    drawCommands();
    drawGame();
}
function endBattle(isVictory) { gameState = 'battle-message'; if (isVictory && currentEnemy) { showVictorySequence(); } else if (!isVictory) { messageWindow.textContent = `${player.name}は たおれてしまった...`; setTimeout(gameOver, 2000); } else { exitBattleMode(); } }
function showVictorySequence() {
    const earnedExp = currentEnemy.exp;
    const earnedGold = currentEnemy.gold;
    messageWindow.textContent = `${currentEnemy.name}をたおした！`;
    if (currentEnemy.isBoss) {
        if (currentEnemy.id === 'golem' && !eventFlags.golem_defeated) { eventFlags.golem_defeated = true; setTimeout(() => { messageWindow.textContent = 'ゴーレムが守っていた道が開かれたようだ…'; const grasslandLayout = maps['grassland'].layout; grasslandLayout[13][9] = 3; grasslandLayout[13][10] = 3; }, 2000); }
        else if (currentEnemy.id === 'anubis' && !eventFlags.anubis_defeated) eventFlags.anubis_defeated = true;
        else if (currentEnemy.id === 'blizzard' && !eventFlags.blizzard_defeated) eventFlags.blizzard_defeated = true;
        else if (currentEnemy.id === 'salamander' && !eventFlags.salamander_defeated) eventFlags.salamander_defeated = true;
        else if (currentEnemy.id === 'kraken' && !eventFlags.kraken_defeated) eventFlags.kraken_defeated = true;
        else if (currentEnemy.id === 'baramos') { setTimeout(gameClear, 2000); return; }
        if (eventFlags.anubis_defeated && eventFlags.blizzard_defeated && eventFlags.salamander_defeated && eventFlags.kraken_defeated && !eventFlags.baramos_seal_broken) {
            eventFlags.baramos_seal_broken = true;
            setTimeout(() => { messageWindow.textContent = '魔王城の結界が…消え去った！'; }, 2000);
        }
    }
    setTimeout(() => {
        player.exp += earnedExp;
        updatePlayerInfoWindow();
        messageWindow.textContent = `${earnedExp}のけいけんちをてにいれた！`;
        setTimeout(() => {
            checkLevelUp(() => {
                player.gold += earnedGold;
                updatePlayerInfoWindow();
                messageWindow.textContent = `${earnedGold}Gをてにいれた！`;
                setTimeout(() => { exitBattleMode(); }, 2000);
            });
        }, 2000);
    }, 2000);
}
function checkLevelUp(onComplete) {
    previousLevel = player.level;
    let leveledUp = false;
    while (player.level < LEVEL_UP_EXP.length && player.exp >= LEVEL_UP_EXP[player.level]) {
        leveledUp = true;
        player.level++;
        player.maxHp += 2; player.hp = player.maxHp;
        player.baseAttack += 1; player.baseDefense += 1;
        if (player.level % 10 === 0) { player.baseSpeed += 1; }
        player.skillPoints += 2;
    }
    if (leveledUp) {
        messageWindow.textContent = `レベルが ${player.level} に あがった！`;
        updatePlayerInfoWindow();
        setTimeout(() => {
            if (player.level === 3 && previousLevel < 3) {
                messageWindow.textContent = '草原の岩が くだけちった！';
                const grasslandLayout = maps['grassland'].layout;
                grasslandLayout[13][9] = 0; grasslandLayout[13][10] = 0;
                if (currentMapId === 'grassland') drawGame();
            }
            startAllocation(onComplete);
        }, 2000);
    } else {
        onComplete();
    }
}
function exitBattleMode() { gameState = 'map'; currentEnemy = null; updatePlayerInfoWindow(); messageWindow.textContent = '矢印キーで探索を続けよう。'; document.getElementById('message-window').classList.remove('battle-mode'); commandWindow.classList.add('hidden'); drawGame(); }
function executeCommand() { const cmd = BATTLE_COMMANDS[selectedCommandIndex]; gameState = 'battle-message'; if (cmd === 'たたかう') playerTurn(); else if (cmd === 'どうぐ') openBattleItemMenu(); else if (cmd === 'にげる') escapeTurn(); }
function playerTurn() { const playerStats = getPlayerTotalStats(); const damage = Math.max(1, playerStats.attack - currentEnemy.defense); currentEnemy.hp = Math.max(0, currentEnemy.hp - damage); updateStatusDisplay(); messageWindow.textContent = `${player.name}のこうげき！${currentEnemy.name}に${damage}のダメージ！`; setTimeout(() => { if (currentEnemy.hp <= 0) endBattle(true); else enemyTurn(); }, 1500); }
function enemyTurn() { const playerStats = getPlayerTotalStats(); const damage = Math.max(1, currentEnemy.attack - playerStats.defense); player.hp = Math.max(0, player.hp - damage); updateStatusDisplay(); updatePlayerInfoWindow(); messageWindow.textContent = `${currentEnemy.name}のこうげき！${player.name}は${damage}のダメージをうけた！`; setTimeout(() => { if (player.hp <= 0) { endBattle(false); } else { messageWindow.textContent = `どうする？`; gameState = 'battle-command-select'; commandWindow.classList.remove('inactive'); drawCommands(); } }, 1500); }
function escapeTurn() { if (currentEnemy.isBoss) { messageWindow.textContent = 'しかし ふうじこめられていて にげられない！'; setTimeout(enemyTurn, 1500); return; } const playerStats = getPlayerTotalStats(); let escapeChance = 0; if (playerStats.speed >= currentEnemy.speed * 2) escapeChance = 1.0; else if (playerStats.speed > currentEnemy.speed) escapeChance = 0.8; else if (playerStats.speed === currentEnemy.speed) escapeChance = 0.5; else if (playerStats.speed < currentEnemy.speed / 2) escapeChance = 0; else escapeChance = 0.25; if (Math.random() < escapeChance) { messageWindow.textContent = 'にげるのにせいこうした！'; setTimeout(() => exitBattleMode(), 1500); } else { messageWindow.textContent = 'しかしまわりこまれてしまった！'; setTimeout(enemyTurn, 1500); } }
function openBattleItemMenu() { gameState = 'battle-item-select'; selectedBattleItemIndex = 0; commandWindow.classList.add('inactive'); battleItemWindow.classList.remove('hidden'); drawBattleItemMenu(); }
function closeBattleItemMenu() { gameState = 'battle-command-select'; battleItemWindow.classList.add('hidden'); commandWindow.classList.remove('inactive'); messageWindow.textContent = 'どうする？'; }
function drawBattleItemMenu() { const listEl = document.getElementById('battle-item-list'); listEl.innerHTML = ''; const ownedItems = Object.keys(player.inventory).filter(id => player.inventory[id] > 0); if (ownedItems.length === 0) { listEl.innerHTML = '<li>なにももっていない</li>'; return; } ownedItems.forEach((itemId, index) => { const item = ITEM_MASTER[itemId]; const count = player.inventory[itemId]; const li = document.createElement('li'); li.innerHTML = `<span>${item.name}</span> <span>x${count}</span>`; if (index === selectedItemMenuIndex) li.classList.add('selected'); listEl.appendChild(li); }); }
function useItemInBattle() { const ownedItems = Object.keys(player.inventory).filter(id => player.inventory[id] > 0); if (ownedItems.length === 0) { closeBattleItemMenu(); return; } const itemId = ownedItems[selectedBattleItemIndex]; const item = ITEM_MASTER[itemId]; if (player.hp >= player.maxHp) { messageWindow.textContent = 'HPは まんたんだ！'; setTimeout(() => { messageWindow.textContent = 'どれをつかいますか？'; }, 1500); return; } battleItemWindow.classList.add('hidden'); player.inventory[itemId]--; player.hp = Math.min(player.maxHp, player.hp + item.effect.hp); updatePlayerInfoWindow(); updateStatusDisplay(); messageWindow.textContent = `${player.name} は ${item.name} をつかった！ HPが ${item.effect.hp} かいふくした！`; setTimeout(enemyTurn, 1500); }
function changeMap(destMapId, destX, destY) { currentMapId = destMapId; player.x = destX; player.y = destY; drawGame(); messageWindow.textContent = maps[currentMapId].name + ' にやってきた。'; }

// --- ポイント割り振り関数 ---
function startAllocation(onComplete) { allocationCompleteCallback = onComplete; gameState = 'level_up_allocate'; selectedStatIndex = 0; allocationWindow.classList.remove('hidden'); drawAllocationWindow(); }
function drawAllocationWindow() { document.getElementById('skill-points-display').textContent = player.skillPoints; const listEl = document.getElementById('allocation-list'); listEl.innerHTML = ''; ALLOCATABLE_STATS.forEach((statKey, index) => { const li = document.createElement('li'); const statName = STAT_NAMES[statKey]; const statValue = player[statKey]; li.innerHTML = `<span>${statName}</span><span>${statValue}</span>`; if (index === selectedStatIndex) li.classList.add('selected'); listEl.appendChild(li); }); }
function finishAllocation() { allocationWindow.classList.add('hidden'); gameState = 'battle-message'; if (allocationCompleteCallback) { allocationCompleteCallback(); } }

// --- NPC会話 ---
let currentNpcMessages = []; let currentMessageIndex = 0;
function talkToNpc(npc) {
    gameState = 'talking';
    currentNpcMessages = [];
    let messageFound = false;
    for (const msgData of npc.messages) {
        if (msgData.flag && eventFlags[msgData.flag]) {
            currentNpcMessages.push(msgData.msg);
            messageFound = true;
            break; 
        }
    }
    if (!messageFound) {
        for (const msgData of npc.messages) {
            if (!msgData.flag) {
                currentNpcMessages.push(msgData.msg);
                if(msgData.setFlag && !eventFlags[msgData.setFlag]) {
                    eventFlags[msgData.setFlag] = true;
                }
            }
        }
    }
    currentMessageIndex = 0;
    showNextMessage();
}
function showNextMessage() { if (currentMessageIndex < currentNpcMessages.length) { messageWindow.textContent = currentNpcMessages[currentMessageIndex]; currentMessageIndex++; } else { gameState = 'map'; messageWindow.textContent = '矢印キーで探索を続けよう。'; } }

// --- 操作・実行フロー ---
document.addEventListener('keydown', (e) => {
    if (gameState === 'gameover' || gameState === 'game_clear') return;
    if (gameState === 'map') handleMapInput(e);
    else if (gameState === 'battle-command-select') handleBattleCommandInput(e);
    else if (gameState === 'battle-item-select') handleBattleItemInput(e);
    else if (gameState === 'shop') handleShopInput(e, 'item');
    else if (gameState === 'weapon_shop') handleShopInput(e, 'weapon');
    else if (gameState === 'armor_shop') handleShopInput(e, 'armor');
    else if (gameState === 'inn') handleInnInput(e);
    else if (gameState === 'level_up_allocate') handleAllocationInput(e);
    else if (gameState === 'menu-main') handleMainMenuInput(e);
    else if (gameState === 'menu-item') handleItemMenuInput(e);
    else if (gameState === 'menu-status') { if (e.key === 'Escape') openMainMenu(); }
    else if (gameState === 'menu-equipment') { if (e.key === 'Escape') openMainMenu(); }
    else if (gameState === 'talking') { if (e.key === 'Enter' || e.key === ' ') showNextMessage(); }
});

function handleMapInput(e) {
      if (e.key === 'p') { // Pキーでレベルアップ ＋ 全回復
        player.exp += LEVEL_UP_EXP[player.level] || 100;
        player.hp = player.maxHp;
        console.log(`DEBUG: Leveled up! Current EXP: ${player.exp}`);
        
        // 割り振り完了後に gameState を 'map' に戻すコールバックを渡す
        checkLevelUp(() => {
            gameState = 'map'; 
            messageWindow.textContent = '矢印キーで探索を続けよう。';
            drawGame();
        });

        updatePlayerInfoWindow();
        messageWindow.textContent = 'DEBUG: レベルアップ！';
        return;
    }
    if (e.key === 'g') { // Gキーでゴールド入手
        player.gold += 1000;
        console.log(`DEBUG: Got 1000G! Current Gold: ${player.gold}`);
        updatePlayerInfoWindow();
        messageWindow.textContent = 'DEBUG: 1000Gを手に入れた！';
        return;
    }
    if (e.key === 'b') { // Bキーで魔王城（ボスの手前）へワープ
        console.log("DEBUG: Warping to Baramos's Castle");
        eventFlags.golem_defeated = true;
        eventFlags.anubis_defeated = true;
        eventFlags.blizzard_defeated = true;
        eventFlags.salamander_defeated = true;
        eventFlags.kraken_defeated = true;
        eventFlags.baramos_seal_broken = true;
        changeMap('baramos_castle', 9, 5); // 魔王の少し手前の座標
        messageWindow.textContent = 'DEBUG: 魔王城へワープ！';
        return;
    }
    if (e.key === 'm') { openMainMenu(); return; }
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) { return; }
    let nextX = player.x, nextY = player.y;
    let talkTargetX = player.x, talkTargetY = player.y;
    switch (e.key) { case 'ArrowUp': nextY--; talkTargetY = player.y - 1; break; case 'ArrowDown': nextY++; talkTargetY = player.y + 1; break; case 'ArrowLeft': nextX--; talkTargetX = player.x - 1; break; case 'ArrowRight': nextX++; talkTargetX = player.x + 1; break; case ' ': break; }
    const currentMap = maps[currentMapId];
    if (talkTargetY < 0 || talkTargetY >= MAP_ROWS || talkTargetX < 0 || talkTargetX >= MAP_COLS) { /* 範囲外は何もしない */ }
    else if (e.key === ' ') {
        const talkTargetTile = currentMap.layout[talkTargetY] ? currentMap.layout[talkTargetY][talkTargetX] : null;
        if (talkTargetTile === 9) { const npc = NPC_DATA[currentMapId][`${talkTargetY},${talkTargetX}`]; if (npc) { talkToNpc(npc); } return; }
    }
    if (nextY < 0 || nextY >= MAP_ROWS || nextX < 0 || nextX >= MAP_COLS) return;
    const destinationTile = currentMap.layout[nextY][nextX];
    if (destinationTile === 1 || (destinationTile === 4 && !eventFlags.golem_defeated)) { return; }
    if (e.key !== ' ') { player.x = nextX; player.y = nextY; }
    drawGame();
    if (destinationTile === 2) enterShop('item'); else if (destinationTile === 5) enterShop('weapon'); else if (destinationTile === 6) enterShop('armor'); else if (destinationTile === 7) enterShop('inn');
    else if (destinationTile === 8) {
        if (currentMapId === 'hidden_grassland' && !eventFlags.golem_defeated) startBattle('golem');
        else if (currentMapId === 'pyramid' && !eventFlags.anubis_defeated) startBattle('anubis');
        // 他の四天王・魔王の固定エンカウントもここに追加
        else if (currentMapId === 'baramos_castle' && eventFlags.baramos_seal_broken) startBattle('baramos');
    } else if (destinationTile === 3) { const warpKey = `${nextY},${nextX}`; const warpInfo = currentMap.warps[warpKey]; if (warpInfo) { changeMap(warpInfo.destMap, warpInfo.destX, warpInfo.destY); } }
    else { if (Math.random() < currentMap.encounterRate) { startBattle(); } }
}
function handleInnInput(e) { switch (e.key) { case 'ArrowUp': case 'ArrowDown': innChoiceIndex = (innChoiceIndex + 1) % 2; drawInnChoices(); break; case 'Enter': if (innChoiceIndex === 0) stayAtInn(); else exitShop('inn'); break; case 'Escape': exitShop('inn'); break; } }
function handleBattleCommandInput(e) { switch (e.key) { case 'ArrowUp': selectedCommandIndex = (selectedCommandIndex - 1 + BATTLE_COMMANDS.length) % BATTLE_COMMANDS.length; drawCommands(); break; case 'ArrowDown': selectedCommandIndex = (selectedCommandIndex + 1) % BATTLE_COMMANDS.length; drawCommands(); break; case 'Enter': executeCommand(); break; } }
function handleBattleItemInput(e) { const ownedItems = Object.keys(player.inventory).filter(id => player.inventory[id] > 0); switch (e.key) { case 'ArrowUp': if (ownedItems.length > 0) { selectedBattleItemIndex = (selectedBattleItemIndex - 1 + ownedItems.length) % ownedItems.length; drawBattleItemMenu(); } break; case 'ArrowDown': if (ownedItems.length > 0) { selectedBattleItemIndex = (selectedBattleItemIndex + 1) % ownedItems.length; drawBattleItemMenu(); } break; case 'Enter': useItemInBattle(); break; case 'Escape': closeBattleItemMenu(); break; } }
function handleShopInput(e, type) {
    const itemList = SHOP_DATA[type];
    switch (e.key) {
        case 'ArrowUp': selectedShopItemIndex = (selectedShopItemIndex - 1 + itemList.length) % itemList.length; drawShop(type); break;
        case 'ArrowDown': selectedShopItemIndex = (selectedShopItemIndex + 1) % itemList.length; drawShop(type); break;
        case 'Enter': buyItem(type); break;
        case 'Escape': exitShop(type); break;
    }
}
function handleMainMenuInput(e) { switch (e.key) { case 'ArrowUp': selectedMainMenuIndex = (selectedMainMenuIndex - 1 + MAIN_MENU_ITEMS.length) % MAIN_MENU_ITEMS.length; drawMainMenu(); break; case 'ArrowDown': selectedMainMenuIndex = (selectedMainMenuIndex + 1) % MAIN_MENU_ITEMS.length; drawMainMenu(); break; case 'Enter': executeMainMenuCommand(); break; case 'Escape': case 'm': closeMenu(); break; } }
function handleItemMenuInput(e) { const ownedItems = Object.keys(player.inventory).filter(id => player.inventory[id] > 0); if (ownedItems.length === 0) { if (e.key === 'Escape') openMainMenu(); return; } switch (e.key) { case 'ArrowUp': selectedItemMenuIndex = (selectedItemMenuIndex - 1 + ownedItems.length) % ownedItems.length; drawItemMenu(); break; case 'ArrowDown': selectedItemMenuIndex = (selectedItemMenuIndex + 1) % ownedItems.length; drawItemMenu(); break; case 'Enter': useItemFromMenu(); break; case 'Escape': openMainMenu(); break; } }
function handleAllocationInput(e) { switch (e.key) { case 'ArrowUp': selectedStatIndex = (selectedStatIndex - 1 + ALLOCATABLE_STATS.length) % ALLOCATABLE_STATS.length; drawAllocationWindow(); break; case 'ArrowDown': selectedStatIndex = (selectedStatIndex + 1) % ALLOCATABLE_STATS.length; drawAllocationWindow(); break; case 'Enter': if (player.skillPoints > 0) { const statToUpgrade = ALLOCATABLE_STATS[selectedStatIndex]; player[statToUpgrade]++; if (statToUpgrade === 'maxHp') { player.hp++; } player.skillPoints--; updatePlayerInfoWindow(); drawAllocationWindow(); } break; case 'Escape': if (player.skillPoints === 0) { finishAllocation(); } else { messageWindow.textContent = 'まだポイントが残っています。'; } break; } }

// --- ゲームの開始 ---
updatePlayerInfoWindow();
drawGame();