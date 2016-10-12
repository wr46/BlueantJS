import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {FormsModule} from "@angular/forms";
import {Blueant} from "../../src/blueant";
import {LoginComponent} from "./login/login.component";
import {WorktimesComponent} from "./worktimes/worktimes.component";
import {WorktimeFormComponent} from "./worktimeForm/worktimeForm.component";
import {MDL} from "./mdl";
import {HolidayComponent} from "./holiday/holiday.component";

@NgModule({
    imports: [BrowserModule, FormsModule],
    declarations: [AppComponent, MDL, LoginComponent, WorktimesComponent, WorktimeFormComponent, HolidayComponent],
    bootstrap: [AppComponent],
    providers: [Blueant]
})
export class AppModule {
    constructor(blueant: Blueant) {
        blueant.setEnviroment('http://localhost:3000/blueant');
    }
}
