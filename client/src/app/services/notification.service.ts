import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/from';

import { SocketService } from './socket.service'

@Injectable()
export class NotificationService {

  private notifications:string[]=[];
  private notificationObservable:Observable<string>

  constructor( private socketService:SocketService ) {

    this.notificationObservable = Observable.from(this.notifications);

    //FRIEND CONNECTED
    let c = 0;
    setInterval( ()=>{ this.notifications.push('hey'+c); c++ },500);
    
    this.socketService.friendObservable.subscribe(
      ( friend )=>{
        this.notifications.push( friend.name+'connected' );
      }
    );

    //MESSAGE ARRIVED
    
    //FRIEND REQUEST


  }

  get getNotifyObservable(){
    return this.notificationObservable;
  }

}
