import { Injectable } from '@angular/core';
import Peer, { DataConnection } from 'peerjs';
import {PlayerMode} from '../models/player';






@Injectable({
  providedIn: 'root'
})
export class GameService {

  constructor() { }

  private randomBackgroundIndex: number | null = null;
  private hostPeerId: string | null = null;
  private mode!: PlayerMode;
  private playerName!: string;
  private otherPlayerName!: string;

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

}
