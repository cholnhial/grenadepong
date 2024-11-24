import { Injectable } from '@angular/core';
import Peer, {DataConnection} from 'peerjs';
import {Observable, Subject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class PeerService {

  constructor() { }

  private peer!: Peer;
  private connections: DataConnection[] = [];
  private peerConnection: DataConnection | null = null;
  /* is initialised as a host */
  private isInitAsHost = false;
  private onData: Subject<any> = new Subject<any>();
  private onConnectedToHost: Subject<string> = new Subject<string>();
  private onConnectionClosed: Subject<DataConnection> = new Subject();

  /**
   * @description
   * Initializes service for either host or connecting peer.
   * For connecting peers we will issue a connection to the peer on
   * the other end.
   *
   * @param peerId a randomly generated peer id
   * @param hostPeerId if connecting this is the host ID we use to connect to the host
   * @param isHost whether to start in host mode
   */
  init(peerId: string, hostPeerId: string | null = null, isHost = true) {
    this.peer = new Peer(peerId,{
      debug: 3, // Verbose logs
    });

    if (isHost) {
      this.isInitAsHost = true;
      this.peer.on('connection', (conn) => {
        console.log("Connection");
        this.connections.push(conn);
        conn.on('data', (data) => {
          console.log(data);
          this.onData.next(data);
        });
        conn.on('close', () => {
          this.onConnectionClosed.next(conn);
          console.log(`Connection with ${conn.peer} closed.`);
        });
      });
    } else {
      if (!hostPeerId) {
        throw new Error("Host id to connect to not specified");
      }

      this.peer.on('open', (err) => {
        this.peerConnection = this.peer.connect(hostPeerId);

        this.peerConnection.on('open', () => {
          console.log("CONNECTION MADE");
        });

        this.peerConnection.on('data', (data) => {
          this.onData.next(data);
        });

        this.peerConnection.on('close', () => {
          this.onConnectionClosed.next(this.peerConnection!);
          console.log('Connection to host closed.');
        });
      });
    }

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
    });
  }

  /**
   * @description
   * Sends some data to connected peers
   * @param data the data to send
   */
  sendData(data: any) {

    if (this.isInitAsHost) {
      this.connections.forEach(c => {
        if (c.open) {
          c.send(data);
        }
      })
    } else {
      this.peerConnection?.send(data);
    }

  }

  getOnDataSubject() {
    return this.onData;
  }

  getOnConnectionClosedSubject() {
    return this.onConnectionClosed;
  }

  cleanup(): void {
    this.connections.forEach((conn) => conn.close());
    this.onData.complete();
    this.onConnectionClosed.complete();
    this.peer.destroy();
  }

}
