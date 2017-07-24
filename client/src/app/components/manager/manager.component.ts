import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';

import { User, Contact } from '../../interfaces/Users';
import { Conversation } from '../../interfaces/Conversations';


interface UserList{
  id:number
  name:string
}

@Component({
  selector: 'chat-manager',
  templateUrl: './manager.component.html',
  styleUrls: ['./manager.component.css']
})
export class ManagerComponent implements OnInit {

  private currentList
  private lists = [
    {name:'Friends', id:0},
    {name:'Chats', id:0}
  ]

  constructor(  private sessionService:SessionService,
                private usersService:UsersService,
                private componentFactoryResolver:ComponentFactoryResolver ) { }

  ngOnInit() {
  }

  switchList(index:number){
    this.currentList = this.sessionService.getSession().user.conversations;
  }
  getLists(){
    // this.sessionService.getSession().user.conversations
  }

  getUserData(){
    this.usersService.getUser( this.sessionService.getSession().user._id["$oid"] ).subscribe(
      (user)=> console.log( user ),
      ( err ) => err,
      ( ) => console.log('Done!')
    );
  }

}
