Game = function (game) {}

Game.prototype = {
  preload: function () {
    // Load assets
    this.game.load.image('circle','assets/circle.png');
    this.game.load.image('background', 'assets/tile.png');
  },
  create: function () {
    // Initialize world
    var width = this.game.width;
    var height = this.game.height;

    this.game.world.setBounds(-width, -height, width*2, height*2);
    this.game.stage.backgroundColor = '#444';

    //add tilesprite background
    var background = this.game.add.tileSprite(-width, -height,
        this.game.world.width, this.game.world.height, 'background');
    // Initialize physics and groups
    this.game.physics.startSystem(Phaser.Physics.P2JS);

    this.game.snakes = [];
    // Create player
    var snake = new Snake(this.game, 'circle', 0, 0);
    this.game.camera.follow(snake.head)
  },

  update: function () {
    // Update game components
    for (var i = this.game.snakes.length - 1 ; i >= 0 ; i--) {
      this.game.snakes[i].update();
    }
  }
};
