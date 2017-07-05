// snake.js

Snake = function (game, spriteKey, x, y) {
  this.game = game;

  // Create array of snakes if none
  if (!this.game.snakes) {
    this.game.snakes = [];
  }
  // Add this snake
  this.game.snakes.push(this);
  this.debug = false;
  this.snakelength = 0;
  this.spriteKey = spriteKey;

  // Settings
  this.scale = 0.6;
  this.fastSpeed = 200;
  this.slowSpeed = 130;
  this.speed = this.slowSpeed;
  this.rotationSpeed = 40;

  // Initialize groups and arrays
  this.collisionGroup = this.game.physics.p2.createCollisionGroup();
  this.sections = [];
  // Array of points head has passed thru
  this.headPath = [];
  this.food = [];

  this.preferredDistance = 17 * this.scale;
  this.queuedSections = 0;

  this.sectionGroup = this.game.add.group();
  // Add head of snake
  this.head = this.addSectionAtPosition(x,y);
  this.head.name = 'head';
  this.head.snake = this;

  this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
  // Add 30 sections behind head
  this.initSections(30);

  this.onDestroyedCallbacks = [];
  this.onDestroyedContexts = [];

}

Snake.prototype = {

  initSections: function (num) {
    for (var i = 1; i <= num; i++) {
      var x = this.head.body.x;
      var y = this.head.body.y + i * this.preferredDistance;
      this.addSectionAtPosition(x, y);
      // Add point to headPath
      this.headPath.push(new Phaser.Point(x, y));
    }
  },

  addSectionAtPosition: function (x, y) {
    // Initialize a new section
    var sec = this.game.add.sprite(x, y, this.spriteKey);
    this.game.physics.p2.enable(sec, this.debug);
    sec.body.setCollisionGroup(this.collisionGroup);
    sec.body.collides([]);
    sec.body.kinematic = true;

    this.snakeLength++;
    this.sectionGroup.add(sec);
    sec.sendToBack();
    sec.scale.setTo(this.scale);

    this.sections.push(sec);

    // Add circle body
    sec.body.clearShapes
    sec.body.addCircle(sec.width*0.5);

    return sec;
  },

  addSectionsAfterLast: function (amount) {
    this.queuedSections += amount;
  },

  update: function () {
    var speed = this.speed;
    this.head.body.moveForward(speed);

    var point = this.headPath.pop();
    point.setTo(this.head.body.x, this.head.body.y);
    this.headPath.unshift(point);

    var index = 0;
    var lastIndex = null;

    for (var i = 0; i < this.snakeLength; i++) {
      this.sections[i].body.x = this.headPath[index].x;
      this.sections[i].body.y = this.headPath[index].y;

      if (lastIndex && index == lastIndex) {
        this.sections[i].alpha = 0;
      } else {
        this.sections[i].alpha = 1;
      }

      lastIndex = index;
      index = this.findNextPointIndex(index);
    }

    if (index >= this.headPath.length - 1) {
      var lastPos = this.headPath[this.headPath.length - 1];
      this.headPath.push(new Phaser.Point(lastPos.x, lastPos.y));
    } else {
      this.headPath.pop();
    }

    var i = 0;
    var found = false;
    while (this.headPath[i].x != this.sections[1].body.x &&
      this.headPath[i].y != this.sections[1].body.y) {
        if (this.headPath[i].x == this.lastHeadPosition.x &&
          this.headPath[i].y == this.lastHeadPosition.y) {
          found = true;
          break;
        }
      i++;
    }
    if (!found) {
      this.lastHeadPosition = new Phaser.Point(this.head.body.x, this.head.body.y);
      this.onCycleComplete();
    }
  },

  findNextPointIndex: function (currentIndex) {
    var pt = this.headPath[currentIndex];
    var prefDist = this.preferredDistance;
    var len = 0;
    var dif = len - prefDist;
    var i = currentIndex;
    var prevDif = null;

    while (i + 1 < this.headPath.length && (dif === null || dif < 0)) {
      var dist = Util.calculateDist(
        this.headPath[i].x, this.headPath[i].y, this.headPath[i + 1].x, this.headPath[i + 1].y
      );
      len += dist;
      prevDif = dif;
      dif = len - prefDist;
      i++;
    }

    if (prevDif === null || Math.abs(prevDif) > Math.abs(dif)) {
      return i;
    } else {
      return i - 1;
    }
  },

  onCycleComplete: function () {
    if (this.queuedSections > 0) {
      var lastSec = this.sections[this.sections.length - 1];
      this.addSectionAtPosition(lastSec.body.x, lastSec.body.y);
      this.queuedSections--;
    }
  },

  setScale: function (scale) {
    this.scale = scale;
    this.preferredDistance = 17 * this.scale;

    this.edgeLock.localOffsetB = [
      0, this.game.physics.p2.pxmi(this.head.width*0.5 + this.edgeOffset)
    ];

    for (var i = 0; i < this.sections.length; i++) {
      var sec = this.sections[i];
      sec.scale.setTo(this.scale);
      sec.body.data.shapes[0].radius = this.game.physics.p2.pxm(sec.width*0.5);
    }
  },

  incrementSize: function () {
    this.addSectionsAfterLast(1);
    this.setScale(this.scale * 1.01);
  },

  destroy: function () {
    this.game.snakes.splice(this.game.snakes.indexOf(this), 1);
    this.sections.forEach(function (sec, index) {
      sec.destroy();
    });

    for (var i = 0; i < this.onDestroyedCallbacks.length; i++) {
      if (typeof this.onDestroyedCallbacks[i] == 'function') {
        this.onDestroyedCallbacks[i].apply(
          this.onDestroyedContexts[i], [this]
        );
      }
    }
  },

  addDestroyedCallback: function (callback, context) {
    this.onDestroyedCallbacks.push(callback);
    this.onDestroyedContexts.push(context);
  }
};
