import { Component, OnInit } from '@angular/core';
import * as socketio from 'socket.io'
declare let io:SocketIOStatic;

@Component({
  selector: 'chat-box',
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatBoxComponent {
  constructor() {
    let socket = io();
    socket.on('connect', (data)=>socket.emit('openSocket', 'Greetings from beyond the port.'))
  }

}
