import {Component} from "@angular/core";
import {Blueant} from "../../src/blueant";
import {EventContainer} from "./worktimeForm/EventContainer";

@Component({
    selector: 'my-app',
    templateUrl: 'app/app.html'
})
export class AppComponent {
    private showWorktimeDate: Date = new Date();
    private refreshWorktimes: any;

    constructor(private blueant: Blueant) {
    }

    public saveWorktimeEvent(eventContainer: EventContainer) {
        this.refreshWorktimes = eventContainer.random;
        this.showWorktimeDate = eventContainer.date;
    }

    public logout($event: Event) {
        $event.preventDefault();
        let _this = this;
        this.blueant.logout().then(function () {
            sessionStorage.clear();
        });
    }
}
