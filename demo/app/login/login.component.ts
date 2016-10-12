import {Component} from "@angular/core";
import {Blueant} from "../../../src/blueant";

@Component({
    selector: 'login',
    templateUrl: 'app/login/login.html',
})
export class LoginComponent {
    private username: string;
    private password: string;
    private showError: boolean = false;
    private inProgress: boolean = false;

    constructor(private blueant: Blueant) {
        if (sessionStorage.getItem("username")) {
            this.username = sessionStorage.getItem("username");
            this.password = sessionStorage.getItem("password");
            this.login({
                preventDefault: () => {
                }
            });
        }
    }

    private login(evt) {
        evt.preventDefault();

        sessionStorage.setItem('username', this.username);
        sessionStorage.setItem('password', this.password);

        this.inProgress = true;
        this.blueant.login(this.username, this.password).then(() => {
            this.showError = false;
            this.inProgress = false;
            this.username = '';
            this.password = '';
        }).catch((err) => {
            this.showError = true;
            this.inProgress = false;
            this.password = '';
        });
    }
}
