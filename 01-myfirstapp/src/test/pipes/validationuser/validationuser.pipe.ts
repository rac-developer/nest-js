
import { ArgumentMetadata, HttpException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ValidationuserPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    
    //Donde va a llegar el dato
    const ageNumber = parseInt(value.age.toString(), 10)

    // Si es NAN, no se puedo convertir en un numero
    if(isNaN(ageNumber)) {
      throw new HttpException('Age must be a number', HttpStatus.BAD_REQUEST)
    }
    
    return {...value, age: ageNumber};
  }
}
