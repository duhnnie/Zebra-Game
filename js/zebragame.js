
    var game;
    var player;
    var platform;
    var bg;
    var facing = 'left';
    var map;
    var layer;
    var direction;
    var cloacas;
    var killerFloor;
    var choferes;
    var velocidadChofer = 100;
    var contadorChofer = 0;
    var gameEnded = false;
    var music;
    var changedMusic = false;
    var misiles;
    var flagMisile = false;
    var restoChoferes = 0;

    function preload(){
        // debugger;
        initScene();
        initZebra();
        initChofer();
        initAudio();
        initMisile();
        initBoom();
    }

    function create(){
        game.physics.startSystem(Phaser.Physics.ARCADE);

        createScene();

        //zebra
        crearZebra();

        //chofer
        crearChofer(1500, 0, -100);
        playHappySong();

        //camera
        game.camera.follow(player);

        //  Text
                stateText = game.add.text(110,100,' ', { font: '84px Arial', fill: '#fff' });
                stateText.anchor.setTo(0.5, 0.5);
                stateText.visible = false;
        //controls
        cursors = game.input.keyboard.createCursorKeys(); 
        fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);  
    }

    function update(){   
        //colisiones
        game.physics.arcade.collide(player, platforms);
        game.physics.arcade.collide(choferes, platforms);
        game.physics.arcade.collide(misiles, platforms, function(misile) {
            misile.kill();
            createBoom(misile.x + misile.width, misile.y + (misile.height / 2));
        });
        animarZebra();
        animarChofer();
        game.physics.arcade.overlap(player, killerFloor, caidaCloaca, null, this);
        game.physics.arcade.overlap(choferes, killerFloor, caidaCloaca, null, this);
        game.physics.arcade.collide(choferes, player, function() {
            player.damage(1);
            caidaCloaca(arguments[1]);
        });
        game.physics.arcade.overlap(choferes, misiles, function(chofer, misile) {
            misile.body.velocity.x = 100;
            chofer.animations.stop();
            chofer.frame = 0;
        });
        game.physics.arcade.collide(choferes, misiles, function(chofer, misile) {
            misile.kill();
            createBoom(chofer.x + (chofer.width / 2), misile.y + (misile.height / 2), function() {
                caidaCloaca(chofer);
            });
        })
    }

    function caidaCloaca (victim,bullet) {
        var i, aux, x, diff;
        console.log(choferes.children.length);
        victim.kill();
        if(!player.alive) {
            stateText.text=" GAME OVER \n Click to restart";
            stateText.visible = true;
            gameEnded = true;
            console.log("GAMEOVER!");
            //the "click to restart" handler
            game.input.onTap.addOnce(restart,this);
        } else if(!gameEnded){
            if(game.world.width > game.camera.width + game.camera.x) {
                x = game.camera.screenView.width + game.camera.x;
                //aux = contadorChofer * 2;
                velocidadChofer += 10;
                diff = game.world.width - x;
                crearChofer(Math.random() * diff + x, 200, velocidadChofer * -1);
                restoChoferes += 1;
                if(restoChoferes === 3) {
                    restoChoferes = 0;
                    crearChofer(Math.random() * diff + x, 200, velocidadChofer * -1);
                    //crearChofer(Math.random() * diff + x, 200, velocidadChofer * -1);    
                }
                if(choferes.children.length > 50 && !changedMusic) {
                    changedMusic = true;
                    playHorrorSong();
                }
            } else {
                console.log("ganaste!");
            }
        }


    }

    function restart () {


    }
    function initZebra(){        
        game.load.spritesheet('zebra', 'assets/zebra.png', 144, 230);
    }
    
    function crearZebra(){
        //zebra
        player = game.add.sprite(0, 0, 'zebra');              
        game.physics.enable(player, Phaser.Physics.ARCADE);
        //physics
        player.name = "zebra";
        player.health = 3000;
        player.body.bounce.y = 0.1;
        player.body.gravity.y = 350;
        player.body.collideWorldBounds = true;
        //player.body.setSize(20, 32, 5, 16);
        player.scale.setTo(0.8,0.8);
        //animations
        player.animations.add('right', [1, 2, 3, 5, 6, 7], 15, true);
        player.animations.add('left', [8, 9, 10, 12, 13, 14], 15, true);
    }
    function animarZebra() {
        //movimientos
        player.body.velocity.x = 0;
        if(cursors.left.isDown) {
            direction = 'left';
            player.body.velocity.x = player.body.touching.down ? -150 : -175;
            if(player.body.touching.down) {
                player.animations.play('left');
            }
        } else if(cursors.right.isDown) {
            direction = 'right';
            player.body.velocity.x = player.body.touching.down ? 150 : 175;
            if(player.body.touching.down) {
                player.animations.play('right');
            }
        } else {
            player.animations.stop();
            if (player.body.touching.down) {
                if(direction === 'right') {
                    player.frame = 0;
                } else {
                    player.frame = 11;
                }
            }
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.body.velocity.y = -200;
            player.animations.stop();
            if(direction === 'right') {
                player.frame = 2;   
            } else {
                player.frame = 13;
            } 
        }
        if(game.input.keyboard.justPressed(32)) {
            if(!flagMisile) {
                crearMisile(player.x + player.width, player.y);
                flagMisile = true;
            }
        } else {
            flagMisile = false;
        }
    }

function initChofer() {
	game.load.atlas("chofer_atlas", "assets/chofer.png", "assets/chofer.json");
}

function crearChofer(x, y, velocityX) {
	var chofer;
	if(!choferes) {
		choferes = game.add.group(/*undefined, 'choferes', true, true, Phaser.Physics.ARCADE*/);
		choferes.enableBody = true;
	}
	//chofer = game.add.sprite(x, y, 'chofer_atlas', undefined, choferes);
	chofer = choferes.create(x, y, 'chofer_atlas');
	game.physics.enable(chofer, Phaser.Physics.ARCADE);
	chofer.scale.setTo(0.5, 0.5);
	chofer.body.bounce.y = 0;
	chofer.body.gravity.y = 800;
	chofer.body.collideWorldBounds = false;
	//chofer.name = "chofer";
	chofer.animations.add('walk', [1, 2, 3, 2, 1, 4, 5, 6, 5, 4], calcularFrameRate(velocityX), true);
	contadorChofer += 1;
	chofer.body.velocity.x = velocityX;
}

function animarChofer() {
	//choferes.setAll("body.velocity.x", -100);
	choferes.callAll("animations.play", "animations", "walk");
	//chofer.animations.play("walk");
	//chofer.body.velocity.x = velocidadChofer * -1;

}

function calcularFrameRate(vel) {
	frameRate = vel * 15 / 100; 
	return frameRate >=0 ? frameRate : frameRate * -1;
};
    function initScene(){
        game.load.image('background', 'assets/fondo.jpg');
        game.load.image('pixel', 'assets/pixel.png');
        game.load.image('cloaca1', 'assets/cloaca1.png');
        game.load.image('cloaca2', 'assets/cloaca2.png');
    }

    function createScene(){
        //background
        game.stage.backgroundColor = '#000000';
        bg = game.add.tileSprite(0, 0, 6417, game.world.height, 'background');
        game.world.setBounds(0, 0, 6417, 500);
        //bg.fixedToCamera = true;

        //ground
        platforms = game.add.group();
        platforms.enableBody = true;
        var ground = platforms.create(0, game.world.height - 110, 'pixel', 10);
        ground.scale.setTo(830, 1);
        ground.body.immovable = true;

        ground = platforms.create(1070, game.world.height - 110, 'pixel', 10);
        ground.scale.setTo(game.world.width, 1);
        ground.body.immovable = true;

        killerFloor = game.add.group();
        killerFloor.enableBody = true;
        var floor = killerFloor.create(0, game.world.height - 2, "pixel");
        floor.body.immovable = true;
        floor.scale.setTo(game.world.width, 1);
        
        //objetos
        cloacas = game.add.group();
        cloacas.enableBody = true;
        cloaca = cloacas.create(870, game.world.height - 175, 'cloaca1');            
        cloaca.body.immovable = true;
        cloaca.scale.setTo(0.5, 0.5);
        cloaca = cloacas.create(956, game.world.height - 175, 'cloaca2');            
        cloaca.body.immovable = true;
        cloaca.scale.setTo(0.5, 0.5);
        //
        cloaca = cloacas.create(1770, game.world.height - 175, 'cloaca1');            
        cloaca.body.immovable = true;
        cloaca.scale.setTo(0.5, 0.5);
        cloaca = cloacas.create(1856, game.world.height - 175, 'cloaca2');            
        cloaca.body.immovable = true;
        cloaca.scale.setTo(0.5, 0.5);
    
    }


function initAudio() {
	game.load.audio('happy', ['assets/audio/tijuana-taxi.mp3', 'assets/audio/tijuana-taxi.mp3']);
	game.load.audio('horror', ['assets/audio/psicosis.mp3', 'assets/audio/psicosis.mp3']);
}

function playHappySong() {
	music = game.add.audio('happy');

    music.play();
}

function playHorrorSong() {
	music.stop();
	music =  game.add.audio("horror");
	music.play();
}


function initMisile() {
	game.load.atlas("misile_atlas", "assets/misile.png", "assets/misile.json");
}

function crearMisile(x, y) {
	var misile;
	if(!misiles) {
		misiles = game.add.group();
		misiles.enableBody = true;
	}

	misile = misiles.create(x, y, 'misile_atlas');
	game.physics.enable(misile, Phaser.Physics.ARCADE);
	misile.scale.setTo(0.5, 0.5);
	misile.body.bounce.y = 0;
	misile.body.gravity.y = 10;
	misile.body.collideWorldBounds = false;
	misile.animations.add('fire', [0, 1, 2], 15, true);
	misile.animations.play('fire');
	misile.body.velocity.x = 500;
}
function initBoom() {
	game.load.atlas("boom_atlas", "assets/boom.png", "assets/boom.json");
}

function createBoom(x, y, onComplete) {
	var boom, animation;
	boom = game.add.sprite(x || 0, y || 0, 'boom_atlas');
	boom.x -= boom.width / 2;
	boom.y -= boom.height /2;
	animation = boom.animations.add('boom', [0, 1, 2, 0, 1, 2], 10, false);
	boom.scale.setTo(0.8, 0.8);
	boom.animations.getAnimation('boom').play(null, false, true);
	if(typeof onComplete === 'function') {
		animation.onComplete.add(onComplete, this);
	}
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('start-button').addEventListener('click', function (event) {
        event.currentTarget.parentElement.style.display = 'none';
        game = new Phaser.Game(1060, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});
    }, false);
}, false);
