import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

@Injectable()
export class SocketService {

  private socket:SocketIOClient.Socket;
  //should transform to use getters and setters

  constructor() { }

  connect( username='anon' ){
    if( !this.socket ){
      this.socket = io('http://localhost:3000');
    }

    this.socket.emit('userConnected', username);

    return this.socket;
  }

  disconnect( username='anon' ){
    if( this.socket ){
      this.socket.emit('userDisconnected', username);
      this.socket = this.socket.disconnect();
      // this.socket = null;
    }
    return this.socket;
  }

}
