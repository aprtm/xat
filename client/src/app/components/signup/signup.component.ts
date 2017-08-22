import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors} from '@angular/forms';
import { Router } from '@angular/router';

import { sameTextValidate, isValueInDatabase } from '../../validators/custom.validator';
import { AsIterablePipe } from '../../pipes/asIterable.pipe';

import { UsersService } from '../../services/users.service';
import { SessionService } from '../../services/session.service';
import { SocketService } from '../../services/socket.service';
import { TranslationService } from '../../services/translation.service';

import { TranslateService } from '@ngx-translate/core';

let _ComponentName = 'signupComponent';

@Component({
  selector: 'chat-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signUpForm: FormGroup
  t10s = {}

  constructor(  private router:Router,
                private builder:FormBuilder,
                private usersService:UsersService,
                private sessionService:SessionService,
                private socketService:SocketService,
                private translationService:TranslationService,
                private translateService:TranslateService  ) {

                  // console.log('signup constructed. ', this.translationService.currentTranslation);
                  this.t10s = this.translationService.currentTranslation[_ComponentName];
  }

  ngOnInit() {
    this.createForm();

    this.translationService.I18N.subscribe(
      ( translation )=>{
        this.t10s = translation[_ComponentName];
      },
      err => console.error
    )
  }
  
  createForm(){
    this.signUpForm = this.builder.group( {
      username:['',[
        Validators.required,
        Validators.pattern( /^\w+$/ )
      ], isValueInDatabase( 'username', this.usersService.valueExists )],

      passGroup: this.builder.group({
        password: ['',Validators.minLength(1)],
        password2: ['']
      }, { validator: sameTextValidate } ),

      email:['',[
        Validators.required,
        Validators.email
      ]]

    });

  }

  formErrorMessages = {
    'username':{
      'required': 'usernameRequired',
      'exists': 'usernameExists',
      'pattern': 'usernameFormat',
    },
    'password':{
      'required': 'passwordRequired',
      'minlength': 'passwordMinLength'
    },
    'passGroup':{
      'sameText': 'passwordMatch'
    },
    'email':{
      'required': 'emailRequired',
      'email': 'emailFormat'
    }
  }

  formSubmit(){
      if( this.signUpForm.valid ){
        let newUser = {
          username: this.signUpForm.get('username').value,
          password: this.signUpForm.get('passGroup.password').value,
          email: this.signUpForm.get('email').value,
          lang: this.translateService.currentLang
        };
        let form = this.signUpForm;
        this.usersService.addUser( newUser ).subscribe(
          ( newUserResp)=>{
            form.reset();
            let userId = newUserResp.json()._id['$oid'];
            this.sessionService.connectUser( newUserResp.json() );
            console.log( 'User session active: ', this.sessionService.getSession().user.username );
    
            console.log( 'Connecting to room', userId );
            this.socketService.connect( this.sessionService.getSession().user );
    
            this.router.navigateByUrl('/');
          },
          function onError(error){
            console.log('Error: ', error);
          }
        );

      }
  }
  
}
