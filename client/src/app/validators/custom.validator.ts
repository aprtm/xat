// import { FormGroup } from '@angular/forms'

export function sameTextValidate({value:groupValues}){
    const [first, ...rest] = Object.keys( groupValues || {} );
    const valid = rest.every( v => groupValues[v] === groupValues[first] );
return valid ? null : {sameText: true};
}