import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './routing/app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { FormsModule } from '@angular/forms';
import {enableProdMode} from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
enableProdMode();

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CoreModule,
    AppRoutingModule,
    FormsModule
  ],
  providers:[
    Title
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
