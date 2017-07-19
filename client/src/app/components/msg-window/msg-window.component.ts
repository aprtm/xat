import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'

import { SessionService } from '../../services/session.service';

import * as io from 'socket.io-client';

@Component({
  selector: 'msg-window',
  templateUrl: './msg-window.component.html',
  styleUrls: ['./msg-window.component.css']
})
export class MsgWindowComponent implements OnInit {
  //get socket connection to the server.
  //passing nothing to io() function defaults to host
  private socket = io('http://localhost:3000') //should move to a service?
  
  msgArr:string[]
  
  constructor( private sessionService:SessionService ) {
    
    this.socket.on('chat message',(msg)=>this.onMessageArrived(msg));
    this.msgArr = ['>>>>> Welcome to the chat. Start typing.'];
    // console.log(this.msgArr);
  }

  onMessageArrived(msg:string){
    // console.log("socket sent this ",msg,'. Save it here: ', this.msgArr);
    // console.log(this);
    this.msgArr.push(msg);
  }

  onSubmit(form:NgForm){
    this.socket.emit('chat message', form.value.currentMessage);
    form.controls.currentMessage.reset();
  }

  ngOnInit() {
  }

}
