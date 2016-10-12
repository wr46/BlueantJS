import {Project} from "./typings/project";
import {Ajax} from "./ajax";
import {Worktime} from "./typings/worktime";
import {Activity} from "./typings/activity";
import {Task} from "./typings/task";
import {Holiday} from "./typings/holiday";
declare var require: any;

export class Blueant {
    private parser = new DOMParser();
    private xml2js = require('xml2js').parseString;
    private ajax = new Ajax();
    private enviroment: string = '/';
    private session;
    private personID;

    private _getUsername;
    private _getPassword;

    public setEnviroment(enviromentUrl: string) {
        this.enviroment = enviromentUrl;
    }

    public login(username: string, password: string): Promise<Blueant> {
        this._getUsername = () => {
            return username;
        };
        this._getPassword = () => {
            return password;
        };

        var loginData = new FormData();
        loginData.append('username', username);
        loginData.append('password', password);

        return this.ajax.request({
            method: 'POST',
            url: this.enviroment + '/services/BaseService/Login',
            data: loginData
        }).then((res) => {
            let xmlDoc = this.parser.parseFromString(<string>res, "text/xml");
            this.session = xmlDoc.querySelector('sessionID').innerHTML;
            this.personID = xmlDoc.querySelector('personID').innerHTML;
            return this;
        }).catch((err) => {
            err.response = err.response.replace('<faultstring>', '').replace('</faultstring>', '');
            throw err;
        });
    };

    public isAuthenticated(): boolean {
        return !!this.session;
    }

    private loginInternal(): Promise<Blueant> {
        return this.login(this._getUsername(), this._getPassword());
    }

    public logout() {
        this._getUsername = undefined;
        this._getPassword = undefined;
        let _this = this;
        return new Promise((resolve, reject) => {
            _this.blueAntRequest('/services/BaseService/Logout', {}).then(() => {
                _this.session = undefined;
                _this.personID = undefined;
                resolve();
            });
        });
    }

    public getProjects(): Promise<Project[]> {
        return this.blueAntRequest('/services/WorktimeAccountingService/getProjects', {});
    }

    public getTasks(projectID: number): Promise<Task[]> {
        return this.blueAntRequest('/services/WorktimeAccountingService/getTasks', {projectID: projectID});
    }

    public getActivities(): Promise<Activity[]> {
        return this.blueAntRequest('/services/MasterDataService/getActivities', {});
    }

    public editWorktime(worktimeID: number, date: Date, projectID: number, taskID: number, activityID: number, billable: boolean, duration: number, comment: string): Promise<any> {
        return this.blueAntRequest('/services/WorktimeAccountingService/editWorktime', {
            workTimeID: worktimeID,
            date: this.formatDate(date),
            projectID: projectID,
            taskID: taskID,
            activityID: activityID,
            billable: billable,
            duration: duration * 60,
            comment: comment
        });
    };

    public addWorktime(date: Date, projectID: number, taskID: number, activityID: number, billable: boolean, duration: number, comment: string): Promise<any> {
        return this.blueAntRequest('/services/WorktimeAccountingService/editWorktime', {
            date: this.formatDate(date),
            projectID: projectID,
            taskID: taskID,
            activityID: activityID,
            billable: billable,
            duration: duration * 60,
            comment: comment
        });
    };

    public deleteWorktime(worktime: Worktime): Promise<any> {
        return this.blueAntRequest('/services/WorktimeAccountingService/deleteWorktime', {
            workTimeID: worktime.workTimeID
        });
    };

    private formatDate(date: Date): string {
        return date.toISOString().replace(/T.*/, '');
    }

    private formatDateTime(date: Date): string {
        return date.toISOString().replace(/T.*/, (this.isSummertime(date) ) ? 'T02:00+02:00' : 'T01:00+01:00');
    }

    private formatDateTimeWithoutTimezone(date: Date): string {
        return date.toISOString().replace(/T.*/, 'T00:00:00');
    }

    private isSummertime(date: Date): boolean {
        var jan = new Date(date.getFullYear(), 0, 1);
        var jul = new Date(date.getFullYear(), 6, 1);
        var defaultTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());

        return date.getTimezoneOffset() < defaultTimezoneOffset;
    }

    public getWorktimes(fromDate: Date, toDate?: Date): Promise<Worktime[]> {
        if (fromDate === null) {
            return new Promise((resolve, reject) => {
                reject('Empty fromDate');
            });
        }
        if (toDate === undefined || toDate === null) {
            toDate = new Date(fromDate);
            toDate.setDate(toDate.getDate() + 1);
        }
        return new Promise((resolve, reject) => {
            this.blueAntRequest('/services/WorktimeAccountingService/getPersonalWorktime', {
                fromDate: this.formatDateTime(fromDate),
                toDate: this.formatDateTime(toDate)
            }).then((worktimes: any[]) => {
                for (let i = 0; i < worktimes.length; i++) {
                    worktimes[i].duration = worktimes[i].duration / 60000;
                    worktimes[i].date = Date.parse(worktimes[i].date.replace(/\+.*/, ''));
                }
                resolve(worktimes);
            })
        });
    }

    public getHolidays(fromDate: Date, toDate?: Date): Promise<Holiday[]> {
        if (fromDate === null) {
            return new Promise((resolve, reject) => {
                reject('Empty fromDate');
            });
        }
        if (toDate === undefined || toDate === null) {
            toDate = new Date(fromDate);
            toDate.setFullYear(toDate.getFullYear() + 1);
        }
        return new Promise((resolve, reject) => {
            this.blueAntRequest('/services/AbsenceService/getAbsence', {
                personID: this.personID,
                from: this.formatDateTimeWithoutTimezone(fromDate),
                to: this.formatDateTimeWithoutTimezone(toDate)
            }).then((holidays: any[]) => {
                for (let i = 0; i < holidays.length; i++) {
                    holidays[i].from = Date.parse(holidays[i].from.replace(/\+.*/, ''));
                    holidays[i].to = Date.parse(holidays[i].to.replace(/\+.*/, ''));
                    holidays[i].comment = (typeof holidays[i].comment === 'string') ? holidays[i].comment : '';
                }
                holidays.sort((a: Holiday, b: Holiday) => {
                    return (a.from < b.from) ? -1 : 1;
                });
                resolve(holidays);
            })
        });
    }

    public blueAntRequest(url: string, params: any): Promise<any> {
        let _this = this;
        let data = new FormData();
        data.append('sessionID', _this.session);
        for (let param in params) {
            data.append(param, params[param]);
        }

        return new Promise((resolve, reject) => {
            _this.ajax.request({
                method: 'POST',
                url: _this.enviroment + url,
                data: data
            }).then((xml) => {
                _this.xml2js(xml, (err, obj) => {
                    if (obj == null) {
                        resolve([]);
                        return;
                    }
                    let baseObj = obj[Object.keys(obj)[0]];
                    if ('_' in baseObj) {
                        resolve(baseObj['_']);
                        return;
                    }
                    let result = baseObj[Object.keys(baseObj).filter(e => e !== '$')[0]];
                    if (result === undefined) {
                        resolve([]);
                        return;
                    }
                    for (let item of result) {
                        _this.removePrefix(item);
                        if ('children' in item) {
                            let key = Object.keys(item.children)[0]
                            if (key !== undefined) {
                                item.children = item.children[key];
                                item.children[key.replace(/ns.\:/, '')] = item.children[key];

                                delete item[key];

                                for (let child of item.children) {
                                    _this.removePrefix(child);
                                }
                            }
                        }
                    }
                    resolve(result);
                });
            }).catch((err) => {
                err.response = err.response.replace('<faultstring>', '').replace('</faultstring>', '');
                if (err.response.match(/.*Ihre Sitzung ist ungültig./)) {
                    _this.loginInternal().then(() => {
                        return _this.blueAntRequest(url, params).then((res) => {
                            resolve(res);
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        reject(err);
                    })
                } else {
                    reject(err);
                }
            })
        });
    }

    private removePrefix(item) {
        delete item['$'];
        let keys = Object.keys(item);
        for (let key of keys) {
            if (item[key] instanceof Array && item[key].length === 1) {
                item[key] = item[key][0];
            }
            item[key.replace(/ns.\:/, '')] = item[key];
            delete item[key];
        }
        return keys;
    }
}
