import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {Blueant} from "../../../src/blueant";
import {Worktime} from "../../../src/typings/worktime";
import {AbstractComponent} from "../abstractComponent";

@Component({
    selector: 'worktimes',
    templateUrl: 'app/worktimes/worktimes.html'
})
export class WorktimesComponent extends AbstractComponent implements OnChanges {
    @Input() private date: Date;
    @Input() private refreshWorktimes: any;
    private editWorktime: Worktime;
    private worktimes: Worktime[] = [];

    constructor(private blueant: Blueant) {
        super();

        if (this.date === undefined || this.date === null) {
            this.date = new Date();
        }
        this.loadWorktimes();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.loadWorktimes();
    }

    private loadWorktimes() {
        let _this = this;
        this.blueant.getWorktimes(this.date).then(function (worktimes) {
            _this.worktimes = worktimes;
        }).catch((err) => {
            console.log(err);
        })
    }

    public edit(worktime: Worktime) {
        this.editWorktime = worktime;
    }

    public cancelEdit(worktime: Worktime) {
        this.editWorktime = null;
    }

    public delete(worktime: Worktime) {
        let _this = this;
        this.blueant.deleteWorktime(worktime).then(function () {
            _this.loadWorktimes();
        });
    }

    public refresh(dateString: string) {
        this.date = this.parseDate(dateString);
        this.loadWorktimes();
    }
}
