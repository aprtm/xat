import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors} from '@angular/forms';
import { sameTextValidate, isValueInDatabase } from '../../validators/custom.validator';
import { AsIterablePipe } from '../../pipes/asIterable.pipe';

import { UsersService } from '../../services/users.service';
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

  constructor(  private builder:FormBuilder,
                private usersService:UsersService,
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
      'required': 'Must pick a username',
      'exists': 'That username already exists',
      'pattern': 'Use only letters, numbers and/or underscore(_)'
    },
    'password':{
      'required': 'Must choose a password',
      'minlength': 'Must have at least 4 characters'
    },
    'passGroup':{
      'sameText': 'Password does not match'
    },
    'email':{
      'required': 'Must provide an email',
      'email': 'Email must be similar to email@site.dom'
    }
  }

  formSubmit(){
      if( this.signUpForm.valid ){
        let newUser = {
          username: this.signUpForm.get('username').value,
          password: this.signUpForm.get('passGroup.password').value,
          email: this.signUpForm.get('email').value
        };
        let form = this.signUpForm;
        this.usersService.addUser( newUser ).subscribe(
          function onNext(item){
            form.reset();
            console.log( 'Sign up successful. ', item );
          },
          function onError(error){
            console.log('Error: ', error);
          }
        );

      }
  }
  
}
