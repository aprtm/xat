// import { FormGroup } from '@angular/forms'
import { Observable } from 'rxjs';
import { Response } from '@angular/http'
import { FormControl, ValidatorFn, AbstractControl, Validators, AsyncValidatorFn } from '@angular/forms';
import 'rxjs/add/operator/map';


export function sameTextValidate( {value:groupValues} ){

    const [first, ...rest] = Object.keys( groupValues || {} );
    const valid = rest.every( v => groupValues[v] === groupValues[first] );

    return valid ? null : {sameText: true};
}


export function isValueInDatabase( field:string, valueExists:Function ):AsyncValidatorFn{
    
    return (control: AbstractControl) => {

        const value:string = control.value;

        if( !Validators.required( control ) ){
            return valueExists(field, value).map( ( resp )=>{
                if( resp._body === 'true' ){
                    return {exists:true}
                }else{
                    return null;
                }
            });
        }
        else{
            return null;
        }
    }
}


export function textEqualValidator(strings:string[]): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => {
    let equal = false;

    for(let s = 0; s < strings.length; s++){
        equal = equal || strings[s] == control.value;
    }
    console.log('text matches?',equal);

    return equal ? {textEqual: true} : null;
  };
}