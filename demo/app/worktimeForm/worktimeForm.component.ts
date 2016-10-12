import {Component, ViewChild, AfterViewInit, Input, Output, EventEmitter, SimpleChanges, OnChanges} from "@angular/core";
import {Blueant} from "../../../src/blueant";
import {AbstractComponent} from "../abstractComponent";
import {Worktime} from "../../../src/typings/worktime";
import {EventContainer} from "./EventContainer";
import {Project} from "../../../src/typings/project";
import {Activity} from "../../../src/typings/activity";
import {Task} from "../../../src/typings/task";

@Component({
    selector: 'worktimeForm',
    templateUrl: 'app/worktimeForm/worktimeForm.html'
})
export class WorktimeFormComponent extends AbstractComponent implements AfterViewInit, OnChanges {
    private projects: Project[] = [];
    private tasks: Task[] = [];
    private activities: Activity[] = [];

    private project: Project;
    private task: Task;
    private activity: Activity;
    private date: Date = new Date();
    private duration: number;
    private comment: string;

    @Output() saveEvent = new EventEmitter<EventContainer>();
    @Output() cancelEvent = new EventEmitter<boolean>();
    @Input() worktime: Worktime;
    @ViewChild('dateField') private dateField;
    @ViewChild('durationField') private durationField;
    @ViewChild('commentField') private commentField;

    constructor(private blueant: Blueant) {
        super();
        let _this = this;
        blueant.getProjects().then(function (projects: Project[]) {
            _this.projects = projects;
            _this.prepareProject();
        });
        blueant.getActivities().then(function (activities: Activity[]) {
            _this.activities = activities;
            _this.activity = activities.find(a => a.name === 'Productive');
            _this.prepareActivity();
        });
    }

    private loadTasks(projectID: number) {
        let _this = this;
        this.blueant.getTasks(projectID).then(function (tasks) {
            let tmp: Task[] = [];
            for (let task of tasks) {
                tmp.push(task);
                for (let child of task.children) {
                    child.name = '-' + child.name;
                    tmp.push(child);

                    for (let child2 of child.children) {
                        child2.name = '--' + child2.name;
                        tmp.push(child2);
                    }
                }
            }

            _this.tasks = tmp;
            _this.prepareTask();
        });
    }

    ngAfterViewInit() {
        this.dateField.nativeElement.classList.add('is-dirty');
    }

    ngOnChanges(changes: SimpleChanges) {
        this.prepareProject();
        this.prepareActivity();
        this.loadTasks(this.worktime.projectID);
        //noinspection TypeScriptUnresolvedFunction
        this.date = new Date(this.worktime.date);
        this.duration = this.worktime.duration;
        this.comment = this.worktime.comment;
        setTimeout(() => {
            this.commentField.nativeElement.classList.add('is-dirty');
            this.durationField.nativeElement.classList.add('is-dirty');
        }, 100);
    }

    private prepareProject() {
        if (this.worktime === undefined) {
            return;
        }
        this.project = this.projects.find(p => p.projectID == this.worktime.projectID);
    }

    private prepareActivity() {
        if (this.worktime === undefined) {
            return;
        }
        this.activity = this.activities.find(p => p.activityID == this.worktime.activityID);
    }

    private prepareTask() {
        if (this.worktime === undefined) {
            return;
        }
        this.task = this.tasks.find(p => p.taskID == this.worktime.taskID);
    }

    cancel() {
        this.worktime = undefined;
        this.cancelEvent.emit(true);
    }

    showTasksOfSelectedProject(selectEl) {
        let projectID = selectEl.options[selectEl.selectedIndex].dataset.projectid;
        this.loadTasks(projectID);
    }

    setDate(date: string) {
        this.date = this.parseDate(date);
    }

    save($evt: Event) {
        $evt.preventDefault();
        let _this = this;

        if (this.worktime !== undefined) {
            this.blueant.editWorktime(this.worktime.workTimeID, this.date, this.project.projectID, this.task.taskID, this.activity.activityID, !(this.task.accountableType === 'none'), this.duration, this.comment).then(function (res) {
                _this.clearForm();
            });
        } else {
            this.blueant.addWorktime(this.date, this.project.projectID, this.task.taskID, this.activity.activityID, !(this.task.accountableType === 'none'), this.duration, this.comment).then(function (res) {
                _this.clearForm();
            });
        }
    }

    private clearForm() {
        this.comment = '';
        this.commentField.nativeElement.classList.remove('is-dirty');
        this.duration = null;
        this.durationField.nativeElement.classList.remove('is-dirty');

        this.saveEvent.emit({date: this.date, random: Math.random()});
    }
}
