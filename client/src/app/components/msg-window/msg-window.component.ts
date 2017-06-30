/// <reference types="socket.io" />
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'

import io from 'socket.io-client';

@Component({
  selector: 'msg-window',
  templateUrl: './msg-window.component.html',
  styleUrls: ['./msg-window.component.css']
})
export class MsgWindowComponent implements OnInit {
  //get socket connection to the host
  private socket:SocketIO.Socket = io() //should move to a service?
  
  msgArr:string[]
  
  constructor() {
    
    this.socket.on('chat message',(msg)=>this.onMessageArrived(msg));
    this.msgArr = ['>>>>> Welcome to the chat. Start typing.'];
    console.log(this.msgArr);
  }

  onMessageArrived(msg:string){
    console.log("socket sent this ",msg,'. Save it here: ', this.msgArr);
    console.log(this);
    this.msgArr.push(msg);
  }

  onSubmit(form:NgForm){
    this.socket.emit('chat message', form.value.currentMessage);
    form.controls.currentMessage.reset();
  }

  ngOnInit() {
  }

}
