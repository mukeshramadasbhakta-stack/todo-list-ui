import { NgModule } from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'en-AU' }],
})
export class AppModule {}
