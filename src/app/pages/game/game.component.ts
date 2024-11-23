import {Component, DestroyRef, effect, ElementRef, inject, OnInit, viewChild, ViewChild} from '@angular/core';
import * as PIXI from 'pixi.js';
import {Application, Assets, Sprite} from 'pixi.js';

interface Grenade {
  sprite: PIXI.Sprite;
  isDragging: boolean;
  dragOffset: {x: number, y: number}
}


@Component({
  selector: 'app-game',
  imports: [],
  templateUrl: './game.component.html',
  styleUrl: './game.component.scss'
})
export class GameComponent implements OnInit {
  private readonly gameCanvas = viewChild<ElementRef>('gameCanvas');
  private app?: PIXI.Application;
  private grenades?: Array<Grenade> = [];


  async ngOnInit() {
    const canvasElement = this.gameCanvas();
    if (canvasElement) {
      this.app = new Application();
      await this.app.init({ resizeTo: canvasElement.nativeElement });
      this.gameCanvas()?.nativeElement?.appendChild(this.app.canvas);
      this.configureAssets();
      await this.initBackground();
      await this.loadGrenade();
      this.app.ticker.add(this.gameLoop.bind(this));
    }
  }

  gameLoop() {
    this.grenades?.forEach((g) => {
     // g.sprite.rotation += 0.02;
    })
  }

  configureAssets() {
    const randomBackgroundNumber = Math.floor(Math.random() * 4) + 1;
    Assets.add({ alias: 'background', src: `background${randomBackgroundNumber}.jpeg` });
    Assets.add({ alias: 'explosion', src: 'explosion.png' });
    Assets.add({ alias: 'grenade', src: 'grenade.png' });
  }

  addGrenade(sprite: PIXI.Sprite) {
    const grenade = {sprite, isDragging: false, dragOffset: {x: 0, y: 0}};
    this.grenades?.push(grenade);

    const handlePointerDown = (event: PIXI.FederatedPointerEvent, g: Grenade)=> {
      g.isDragging = true;
      const position = event.data.getLocalPosition(grenade.sprite.parent);
      g.dragOffset.x = g.sprite.x - position.x;
      g. dragOffset.y = g.sprite.y - position.y;
    }

    grenade.sprite.on('pointerdown', (event: PIXI.FederatedPointerEvent) => {
      handlePointerDown(event, grenade);
    });

    const handlePointerMove = (event: PIXI.FederatedPointerEvent, g: Grenade) => {
      if (g.isDragging) {
        const position = event.data.getLocalPosition(g.sprite.parent);
        g.sprite.x = position.x + g.dragOffset.x;
        g.sprite.y = position.y + g.dragOffset.y;
      }
    }

    grenade.sprite.on('pointermove', (event: PIXI.FederatedPointerEvent) => {
      handlePointerMove(event, grenade)
    });

    const handlePointerUp =  (g: Grenade) => {
      g.isDragging = false;
    }

    const handlePointerUpOutside = (g: Grenade) => {
      g.isDragging = false;
    }
    grenade.sprite.on('pointerup', () => handlePointerUp(grenade));
    grenade.sprite.on('pointerupoutside', () => handlePointerUpOutside(grenade));
  }

  async loadGrenade() {
    Assets.load('grenade').then((texture) => {
      const grenade = new Sprite(texture);
      grenade.anchor.set(0.5);
      grenade.scale = 0.3;
      grenade.zIndex  = 3;
      grenade.x = this.app!.screen.width / 2;
      grenade.y = this.app!.screen.height / 2;
      grenade.eventMode = 'static';
      grenade.cursor = 'pointer';
      this.app!.stage.addChild(grenade);
      this.addGrenade(grenade);
    });

    Assets.load('grenade').then((texture) => {
      const grenade = new Sprite(texture);
      grenade.anchor.set(0.5);
      grenade.scale = 0.3;
      grenade.zIndex  = 3;
      grenade.x = this.app!.screen.width / 2;
      grenade.y = this.app!.screen.height / 3;
      grenade.eventMode = 'static';
      grenade.cursor = 'pointer';

      this.app!.stage.addChild(grenade);
      this.addGrenade(grenade);
    });
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
}
