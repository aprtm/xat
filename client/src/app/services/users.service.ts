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
  
  constructor(public http:Http) { 
    this.valueExists = this.valueExists.bind(this);
  }

  addUser(user:User){
    return this.http.post( '/api/signup', user, {headers:this.header} )
      /*.subscribe( ( resp )=>console.log('resp: ',resp), ( err )=>console.log('err: ',err) )*/ ;
  }

  valueExists( field:string, value:string){
    const endpoint = {
      username: '/api/signup/username/',
      email: '/api/signup/email/'
    };

    //checks if value exists in field
    return this.http.get( endpoint[field] + value);
  }

}
