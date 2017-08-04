import { Directive, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS} from '@angular/forms';

import { textEqualValidator } from '../validators/custom.validator'

@Directive({
  selector: '[textEqual]',
  providers: [{provide: NG_VALIDATORS, useExisting:
    TextEqualValidatorDirective, multi:true}]
})
export class TextEqualValidatorDirective implements Validator {

  @Input() textEqual:string[]

  validate(control:AbstractControl):{[key:string]:any}{
    return  this.textEqual ? 
            textEqualValidator(this.textEqual)(control) :
            null;
  }

}
