import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidationErrors} from '@angular/forms';
import { sameTextValidate, isValueInDatabase } from '../../validators/custom.validator'
import { AsIterablePipe } from '../../pipes/asIterable.pipe'

import { UsersService } from '../../services/users.service'

@Component({
  selector: 'chat-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signUpForm: FormGroup;

  constructor(private builder:FormBuilder, private usersService:UsersService) {
  }

  ngOnInit() {
    this.createForm();
    // console.log(this.signUpForm.controls.passGroup);
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

  onSubmit(){
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
            console.log('Successfully added: ', item.status);
          },
          function onError(error){
            console.log('Error: ', error);
          }
        );

      }
  }
  
}
