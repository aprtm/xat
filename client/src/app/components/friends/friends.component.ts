import { Component, Input, OnInit } from '@angular/core';

import { SessionService } from '../../services/session.service';
import { UsersService } from '../../services/users.service';

import { User, Contact } from '../../interfaces/Users';

@Component({
  selector: 'chat-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  @Input('friends') friends:Contact[];

  constructor() { }

  ngOnInit() {
  }
  

}
