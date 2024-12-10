import {Injectable} from '@angular/core';
import {PlayerMode, ScoreStatus} from '../models/player';
import {PeerService} from './peer.service';
import {Router} from '@angular/router';
import {GameMessage, GameMessageType} from '../models/game-message';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor(private peerService: PeerService,
              private router: Router) { }

  private randomBackgroundIndex: number | null = null;
  private hostPeerId: string | null = null;
  private mode!: PlayerMode;
  private playerName!: string;
  private otherPlayerName!: string;
  private scoreStatus!: ScoreStatus;
  private isRestart!: boolean;
  private canvasHeight!: number;
  private canvasWidth!: number;

  getRandomBackgroundIndex() {
    if (!this.randomBackgroundIndex) {
      this.randomBackgroundIndex = Math.floor(Math.random() * 4) + 1;
    }

    return this.randomBackgroundIndex;
  }

  setRandomBackgroundIndex(index: number) {
    this.randomBackgroundIndex = index;
  }

  setHostPeerId(hostPeerId: string | null) {
    this.hostPeerId = hostPeerId;
  }

  getHostPeerId() {
    return this.hostPeerId;
  }

  setMode(mode: PlayerMode) {
    this.mode = mode;
  }

  getMode() {
    return this.mode;
  }

  setPlayerName(name: string) {
    this.playerName = name;
  }

  setOtherPlayerName(name: string) {
    this.otherPlayerName = name;
  }

  getOtherPlayerName() {
    return this.otherPlayerName;
  }

  getPlayerName() {
    return this.playerName;
  }

  getScoreStatus() {
    return this.scoreStatus;
  }

  setScoreStatus(status: ScoreStatus) {
    this.scoreStatus = status;
  }

  getIsRestart() {
    return this.isRestart;
  }

  setIsRestart(isRestart: boolean) {
    this.isRestart = isRestart;
  }

  setCanvasHeight(height: number) {
    this.canvasHeight = height;
  }

  setCanvasWidth(width: number) {
    this.canvasWidth = width;
  }

  getCanvasWidth() {
    return this.canvasWidth;
  }

  getCanvasHeight() {
    return this.canvasHeight;
  }

  /**
   * Only host should cal this
   */
  async restartGame() {
    const message: GameMessage = { type: GameMessageType.RESTART, payload: {}};
    this.isRestart = true;
    this.peerService.sendData(message);
    await this.router.navigate(['game'], { queryParams: { reload: Date.now() }});
  }

}
