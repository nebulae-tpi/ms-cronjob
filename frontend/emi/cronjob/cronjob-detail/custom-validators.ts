import {
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors
} from '@angular/forms';

export class CustomValidators {

  static bodyFormatValidate(body: FormControl): ValidationErrors {
    const isValid = false;
    if (!body.value) {
      return null;
    }
    try {
      JSON.parse(body.value);
    } catch (e) {
      return {
        bodyFormatValidate: true
      }
    }
    return null;
  }
  
}
