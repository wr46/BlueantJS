import {Component} from "@angular/core";
import {Blueant} from "../../../src/blueant";
import {Holiday} from "../../../src/typings/holiday";

@Component({
    selector: 'holidays',
    templateUrl: 'app/holiday/holiday.html'
})
export class HolidayComponent {
    private holidays: Holiday[];

    constructor(private blueant: Blueant) {
        let _this = this;
        blueant.getHolidays(new Date()).then((holidays) => {
            _this.holidays = holidays;
        });
    }
}
