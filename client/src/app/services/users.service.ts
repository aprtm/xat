import { Http, Headers } from '@angular/http'
import { Observable } from 'rxjs/Observable'
import { Injectable } from '@angular/core';

interface User{
  username:string
  password:string
  email:string
}

@Injectable()
export class UsersService {
  private header:Headers = new Headers( {'Content-Type':'application/json'} )
  constructor(private http:Http) { }

  addUser(user:User){
    
    this.http.post( '/api/signup', user, {headers:this.header} )
      .subscribe( ( resp )=>console.log('resp: ',resp), ( err )=>console.log('err: ',err) ) ;
    
    console.log('Posted to server: ', user);
  }

  getUser(){
    
  }
}
