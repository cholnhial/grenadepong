import * as PIXI from 'pixi.js';

export interface Grenade {
  sprite: PIXI.Sprite;
  isDragging: boolean;
  dragOffset: {x: number, y: number};
  velocity: {x: number, y: number};
  lastPosition: {x: number, y: number};
  dragStartTime: number;
  positionHistory: Array<{x: number, y: number, time: number}>;
  isOffscreen: boolean; // Track if grenade is off screen
  explosionAnimation: PIXI.AnimatedSprite;
}
