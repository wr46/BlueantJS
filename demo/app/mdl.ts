import {Directive, AfterViewChecked} from "@angular/core";

declare var window: any;

@Directive({
    selector: '[mdl]'
})
export class MDL implements AfterViewChecked {
    ngAfterViewChecked() {
        if (window.componentHandler) {
            window.componentHandler.upgradeAllRegistered();
        }
    }
}
