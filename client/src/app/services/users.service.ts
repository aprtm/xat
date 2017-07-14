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
    //return an observable with the post add user response
    console.log('Posting new user data...');
    return this.http.post( '/api/signup', user, {headers:this.header} )
  }

  valueExists( field:string, value:string){
    const endpoint = {
      username: '/api/signup/username/',
      email: '/api/signup/email/'
    };

    //return an observable with the get value response
    // console.log('Checking if ' + field + ' is available...');
    return this.http.get( endpoint[field] + value);
  }

  getUser(credentials:{username:string, password:string}){
    //return an observable with the post login response
    console.log('Posting user credentials...');
    return this.http.post( '/api/login/', credentials, {headers:this.header})
  }

}
