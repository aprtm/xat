import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from './session.service';

@Injectable()
export class TranslationService {

  I18N = new Subject<any>();
  currentTranslation = {};

  constructor(  private translate: TranslateService,
                private sessionService: SessionService ) {

    let currentLang = 'en';

    translate.setDefaultLang('en');
    translate.addLangs(['es']);
    
    this.changeLanguage( currentLang );

  }
  
  changeLanguage( lang:string ){

    this.translate.use( lang ).subscribe(
      ( translation:Object ) => {
        this.currentTranslation = translation;
        this.I18N.next( translation );
      },
      err=>console.error
    );

  }



}
