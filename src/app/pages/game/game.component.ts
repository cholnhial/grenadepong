import {Component, ElementRef, OnDestroy, OnInit, Renderer2, viewChild} from '@angular/core';
import * as PIXI from 'pixi.js';
import {Application, Assets, Sprite} from 'pixi.js';
import {PeerService} from '../../services/peer.service';
import {generatePeerId} from '../../utils';
import {GameService} from '../../services/game.service';
import {GameMessage, GameMessageType} from '../../models/game-message';
import {Grenade} from '../../models/grenade';
import {PlayerMode, ScoreStatus} from '../../models/player';
import {TimerComponent} from '../../components/timer/timer.component';
import {TimerService} from '../../services/timer.service';
import {Router} from '@angular/router';

/***


 - 4 animations of explosions.

 - Each Animation Atlas frame is a 512 x 512 size image (4096 x 4096 total). Included half sized version as well (2048 x 2048 total).


 - Both grenades explode on one screen => GAME OVER
 - a player has one grenade explode
 PROTOCOL:



 BALL LEAVES SCREEN:
 This scenario allows us to repaint the ball on the other players screen.
 This message may be sent by either player.
 The remove the ball as it leaves the screen.

 device will acknowledge that they don't have the grenade.
 They'll be waiting for
 - EXPLOSION
 - GAME_OVER

 type: GRENADE_INCOMING
 payload: {
 last known grenade coordinates,
 this players screen width and height
 }

 Host sends this message to the other player for them to begin their countdown
 initially after joining the game.

 type: START_TIMER
 payload: { }



 SCENARIO: HAS ALL GRENADE

 If a grenade exploded on our screen send this to other player
 type: EXPLOSION
 payload: {}

 If the timer counted down and we have all the grenade we sent this
 type: GAME_OVER
 payload: {
 winner: Our name
 }
 **/




@Component({
  selector: 'app-game',
  imports: [TimerComponent],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit, OnDestroy {

  constructor(private peerService: PeerService,
              private timerService: TimerService,
              private router: Router,
              private renderer: Renderer2,
              private gameService: GameService) {
  }
  private readonly gameCanvas = viewChild<ElementRef>('gameCanvas');
  private app?: PIXI.Application | null;
  private grenades: Array<Grenade> = [];
  private grenadeTexture!: PIXI.Texture;
  private explosionAnimationTexture!: PIXI.Texture;
  private isHost = false;

  // Physics constants
  private readonly FRICTION = 0.90;
  private readonly BOUNCE_DAMPING = 0.7;
  private readonly GRAVITY = 0.2;
  private readonly MIN_VELOCITY = 0.1;
  private readonly HISTORY_POINTS = 5;
  private readonly FLICK_MULTIPLIER = 0.009;

  // Screen boundaries
  private readonly OFFSCREEN_MARGIN = 100; // How far past the screen edge before removing

  configureAssets() {
    Assets.add({ alias: 'background', src: `background${this.gameService.getRandomBackgroundIndex()}.jpeg` });
    Assets.add({ alias: 'explosion', src: 'explosion.png' });
    Assets.add({ alias: 'grenade', src: 'grenade.png' });
  }

  async loadTextures() {
    this.grenadeTexture = await  Assets.load('grenade');
    this.explosionAnimationTexture = await  Assets.load('explosion');
  }

  getExplosionAnimationSpriteSheetData() {

    const spriteSheetData:PIXI.SpritesheetData = {
      frames: {},
      meta: {
        scale: '1'
      }
    };

    const totalWidth = 4096;
    const totalHeight = 4096;
    const frameWidth = 512;
    const frameHeight = 512;
    const framesPerRow = totalWidth / frameWidth;
    const framesPerColumn = totalHeight / frameHeight;
    const totalFrames = framesPerRow * framesPerColumn;

    for (let i = 0; i < totalFrames; i++) {
      const row = Math.floor(i / framesPerRow);
      const col = i % framesPerRow;

      spriteSheetData.frames[`frame_${i}`] = {
        frame: {
          x: col * frameWidth,
          y: row * frameHeight,
          w: frameWidth,
          h: frameHeight
        },
        sourceSize: {
          w: frameWidth,
          h: frameHeight
        }
      };
    }

    return spriteSheetData;
  }

  async getExplosionAnimationSprite() {
    const spritesheet = new PIXI.Spritesheet(
      this.explosionAnimationTexture,
      this.getExplosionAnimationSpriteSheetData()
    );

    return spritesheet.parse().then(() => {
      // Create an animated sprite
       const explosionAnimation = new PIXI.AnimatedSprite(
        Object.values(spritesheet.textures)
      );

      // Configure the animation
      explosionAnimation.animationSpeed = 0.5; // Adjust speed (e.g., 0.5 = 30 fps at 60 fps)
      explosionAnimation.loop = false; // Set to false if you want it to play once

      return explosionAnimation;
    });
  }

  async playGrenadeExplosion(grenade: Grenade) {
    this.app!.stage.removeChild(grenade.sprite);
    grenade.explosionAnimation.anchor.set(0.5);
    grenade.explosionAnimation.scale = 3;
    grenade.explosionAnimation.x = grenade.sprite.x;
    grenade.explosionAnimation.y = grenade.sprite.y;
    grenade.explosionAnimation.play();
    grenade.explosionAnimation.onComplete = () => {
      this.app!.stage.removeChild(grenade.explosionAnimation);
    }
    this.app!.stage.addChild(grenade.explosionAnimation);
  }

  async ngOnInit() {
    const canvasElement = this.gameCanvas();
    if (canvasElement) {
      this.app = new Application();
      if (!this.gameService.getIsRestart()) {
        await this.app.init({ resizeTo: canvasElement.nativeElement });
        this.gameService.setCanvasHeight(this.app!.screen.height);
        this.gameService.setCanvasWidth(this.app!.screen.width);
      } else {
        await this.app.init({ width: this.gameService.getCanvasWidth(), height: this.gameService.getCanvasHeight() });
      }
      this.gameCanvas()?.nativeElement?.appendChild(this.app.canvas);
      this.configureAssets();
      await this.loadTextures();
      await this.initBackground();

      this.app.ticker.add(this.gameLoop.bind(this));
    }
    if (this.gameService.getMode() == PlayerMode.HOSTING) {
      this.isHost = true;
     // only load grenades for host
      await this.loadGrenades();
      this.sendHostReady();
    }
    if (this.gameService.getMode() == PlayerMode.JOINING) {
      this.peerService.getOnConnectedToHost().subscribe(() => {
        this.sendHello(); // joining player is connected
      });
      if (!this.gameService.getIsRestart()) {
        this.peerService.init(generatePeerId(), this.gameService.getHostPeerId(), false);
      }

    }
    this.timerService.setTimeLimitInSecs(30); // 30 seconds
    this.timerService.setOnTimeout(() => {
      this.grenades.forEach(g => {
        this.playGrenadeExplosion(g);
        /**
         * Check who wins
         *
         * Scenarios:
         *
         * 1. I have one of the grenades => DRAW
         * 2. I have both grenades => I LOSE
         * 3. I don't have any grenades => I WIN
         */
      })
      if(this.grenades.length == 1) {
        this.gameService.setScoreStatus(ScoreStatus.DRAW);
      }
      else if (this.grenades.length == 2) {
        this.gameService.setScoreStatus(ScoreStatus.LOSE);
      } else {
        this.gameService.setScoreStatus(ScoreStatus.WIN)
      }
     setTimeout(() => {
       this.router.navigate(['score']);
     }, 3000);
    });

    this.peerService.getOnDataSubject().subscribe(this.handleOnPeerData.bind(this));
  }

  async handleOnPeerData(data: GameMessage) {

    if (this.isHost) {
      switch (data.type) {
        case GameMessageType.GUEST_READY:
          // The other player has connected
          this.gameService.setOtherPlayerName(data.payload.name);
          if (!this.gameService.getIsRestart()) {
            this.timerService.start();
          } else {
            this.timerService.reset();
          }
          this.sendStart();
          break;
      }
    } else {
      switch (data.type) {
        case GameMessageType.START:
          if (!this.gameService.getIsRestart()) {
            this.timerService.start();
          } else {
            this.timerService.reset();
          }
          break;
        case GameMessageType.HOST_READY:
          this.sendGuestReady();
          this.gameService.setOtherPlayerName(data.payload.name);
          break;
      }
    }

     // Common handlers
    if (data.type == GameMessageType.GRENADE_INCOMING) {
      await this.handleIncomingGrenadeMessage(data);
    }
  }

  private handleOffscreenGrenade(grenade: Grenade) {
    if (!grenade.isOffscreen) {
      grenade.isOffscreen = true;
      grenade.lastPosition.x = grenade.sprite.x;
      grenade.lastPosition.y = grenade.sprite.y;
      this.sendGrenadeIncomingToPeer(grenade);
      // Remove from stage
      this.app?.stage.removeChild(grenade.sprite);
      // Remove from grenades array
      const index = this.grenades.indexOf(grenade);
      if (index > -1) {
        this.grenades.splice(index, 1);
      }
    }
  }

  private sendGrenadeIncomingToPeer(grenade: Grenade) {
    const payload: GameMessage = {type: GameMessageType.GRENADE_INCOMING, payload: {
        peerScreenHeight: this.app?.screen.height,
        peerScreenWidth:  this.app?.screen.width,
        lastPosition: grenade.lastPosition,
        velocity: grenade.velocity
      }};
    this.peerService.sendData(payload);
  }

  private sendHello() {
    const payload: GameMessage = {type: GameMessageType.HELLO, payload: {

      }};
    this.peerService.sendData(payload);
  }

  private sendStart() {
    const payload: GameMessage = {type: GameMessageType.START, payload: {

      }};
    this.peerService.sendData(payload);
  }

  private sendHostReady() {
    const payload: GameMessage = {type: GameMessageType.HOST_READY,
      payload: {
        name: this.gameService.getPlayerName()
      }};
    this.peerService.sendData(payload);
  }

  private sendGuestReady() {
    const payload: GameMessage = {type: GameMessageType.GUEST_READY, payload: {
        name: this.gameService.getPlayerName()
      }};
    this.peerService.sendData(payload);
  }

  private async handleIncomingGrenadeMessage(message: GameMessage) {
    const grenade = new Sprite(this.grenadeTexture);
    grenade.anchor.set(0.5);
    grenade.scale.set(0.3);
    grenade.zIndex = 3;
    grenade.x = this.app!.screen.width*(message.payload.lastPosition.x/message.payload.peerScreenWidth);
    grenade.y = 0;
    grenade.eventMode = 'static';
    grenade.cursor = 'pointer';
    this.app!.stage.addChild(grenade);
    await this.addGrenade(grenade);
  }

  gameLoop() {
    this.grenades?.forEach((g) => {
      if (!g.isDragging) {
        // Apply gravity
        g.velocity.y += this.GRAVITY;

        // Update position based on velocity
        g.sprite.x += g.velocity.x;
        g.sprite.y += g.velocity.y;

        // Check if grenade is off screen at the top
        if (g.sprite.y < -this.OFFSCREEN_MARGIN) {
          this.handleOffscreenGrenade(g);
          return;
        }

        // Handle boundary collisions - now only for bottom and sides
        const bounds = {
          left: g.sprite.width / 2,
          right: this.app!.screen.width - g.sprite.width / 2,
          bottom: this.app!.screen.height - g.sprite.height / 2
        };

        // Horizontal bouncing
        if (g.sprite.x <= bounds.left) {
          g.sprite.x = bounds.left;
          g.velocity.x = Math.abs(g.velocity.x) * this.BOUNCE_DAMPING;
        } else if (g.sprite.x >= bounds.right) {
          g.sprite.x = bounds.right;
          g.velocity.x = -Math.abs(g.velocity.x) * this.BOUNCE_DAMPING;
        }

        // Only bounce on bottom
        if (g.sprite.y >= bounds.bottom) {
          g.sprite.y = bounds.bottom;
          g.velocity.y = -Math.abs(g.velocity.y) * this.BOUNCE_DAMPING;
        }

        // Apply friction
        g.velocity.x *= this.FRICTION;
        g.velocity.y *= this.FRICTION;

        // Stop moving if velocity is very low
        if (Math.abs(g.velocity.x) < this.MIN_VELOCITY) g.velocity.x = 0;
        if (Math.abs(g.velocity.y) < this.MIN_VELOCITY) g.velocity.y = 0;
      }
    });
  }

  async addGrenade(sprite: PIXI.Sprite, withVelocity =  {x: 0, y: 0}) {
    const grenade = {
      sprite,
      isDragging: false,
      dragOffset: {x: 0, y: 0},
      lastPosition: {x: 0, y: 0},
      dragStartTime: 0,
      velocity: withVelocity,
      positionHistory: [],
      isOffscreen: false,
      explosionAnimation: await this.getExplosionAnimationSprite()
    };

    this.grenades?.push(grenade);

    const handlePointerDown = (event: PIXI.FederatedPointerEvent, g: Grenade) => {
      g.isDragging = true;
      const position = event.data.getLocalPosition(g.sprite.parent);
      g.dragOffset.x = g.sprite.x - position.x;
      g.dragOffset.y = g.sprite.y - position.y;

      g.positionHistory = [];
      g.velocity = {x: 0, y: 0};

      g.positionHistory.push({
        x: position.x,
        y: position.y,
        time: Date.now()
      });
    }

    const handlePointerMove = (event: PIXI.FederatedPointerEvent, g: Grenade) => {
      if (g.isDragging) {
        const position = event.data.getLocalPosition(g.sprite.parent);
        g.sprite.x = position.x + g.dragOffset.x;
        g.sprite.y = position.y + g.dragOffset.y;

        g.positionHistory.push({
          x: position.x,
          y: position.y,
          time: Date.now()
        });

        if (g.positionHistory.length > this.HISTORY_POINTS) {
          g.positionHistory.shift();
        }
      }
    }

    const handlePointerUp = (event: PIXI.FederatedPointerEvent, g: Grenade) => {
      if (g.isDragging) {
        g.isDragging = false;
        const position = event.data.getLocalPosition(g.sprite.parent);

        g.positionHistory.push({
          x: position.x,
          y: position.y,
          time: Date.now()
        });

        g.velocity = this.calculateFlickVelocity(g.positionHistory);
      }
    }

    const handlePointerUpOutside = (g: Grenade) => {
      g.isDragging = false;
    }

    sprite.on('pointerdown', (event) => handlePointerDown(event, grenade));
    sprite.on('pointermove', (event) => handlePointerMove(event, grenade));
    sprite.on('pointerup', (event) => handlePointerUp(event, grenade));
    sprite.on('pointerupoutside', () => handlePointerUpOutside(grenade));
  }

  calculateFlickVelocity(history: Array<{x: number, y: number, time: number}>): {x: number, y: number} {
    if (history.length < 2) return {x: 0, y: 0};

    const recent = history.slice(-this.HISTORY_POINTS);
    const start = recent[0];
    const end = recent[recent.length - 1];

    const deltaTime = (end.time - start.time) / 1000;
    if (deltaTime === 0) return {x: 0, y: 0};

    const velocityX = (end.x - start.x) / deltaTime * this.FLICK_MULTIPLIER;
    const velocityY = (end.y - start.y) / deltaTime * this.FLICK_MULTIPLIER;

    return {x: velocityX, y: velocityY};
  }


  async loadGrenades() {
    let grenade = new Sprite(this.grenadeTexture);
    grenade.anchor.set(0.5);
    grenade.scale.set(0.3);
    grenade.zIndex = 3;
    grenade.x = this.app!.screen.width / 2;
    grenade.y = this.app!.screen.height / 2;
    grenade.eventMode = 'static';
    grenade.cursor = 'pointer';
    this.app!.stage.addChild(grenade);
    this.addGrenade(grenade);
    // Add second grenade
    grenade = new Sprite(this.grenadeTexture);
    grenade.anchor.set(0.5);
    grenade.scale.set(0.3);
    grenade.zIndex = 3;
    grenade.x = this.app!.screen.width / 2;
    grenade.y = this.app!.screen.height / 3;
    grenade.eventMode = 'static';
    grenade.cursor = 'pointer';
    this.app!.stage.addChild(grenade);
    await this.addGrenade(grenade);
  }

  async initBackground() {
    Assets.load('background').then((texture) => {
      const backgroundTexture = new Sprite(texture);
      backgroundTexture.width = this.app!.screen.width;
      backgroundTexture.height = this.app!.screen.height;
      backgroundTexture.x = 0;
      backgroundTexture.y = 0;
      this.app!.stage.addChild(backgroundTexture);
    });
  }


  ngOnDestroy() {
    this.app!.destroy(true, {
      children: true,
      texture: true,
    });
    this.app = null;
  }
}
