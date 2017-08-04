import { Component, OnInit } from '@angular/core';
import { Contact } from '../../interfaces/Users'

@Component({
  selector: 'chat-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private newFriend:Contact|null = null;

  constructor(  ) {

  }

  ngOnInit(){
  }

  setNewFriend( friend:Contact ){
    this.newFriend = friend;
  }

}
