import { Component, OnInit } from '@angular/core';
import io from 'socket.io-client';

@Component({
  selector: 'msg-window',
  templateUrl: './msg-window.component.html',
  styleUrls: ['./msg-window.component.css']
})
export class MsgWindowComponent implements OnInit {
  //get socket connection to the host
  socket = io()

  constructor() { }

  ngOnInit() {
  }

}
