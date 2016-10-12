export interface Worktime {
    activityID: number,
    activityName: string,
    billable: boolean,
    //break-share: number,
    comment: string
    customFieldList: any,
    date: Date,
    duration: number,
    exportDate: any
    from: string,
    iccID: any,
    iccName: any
    personID: number
    personName: string
    projectID: number
    projectName: string
    reasonNotAccountableID: any
    reasonNotAccountableName: any
    sessionID: string
    state: number
    taskID: number,
    taskName: string,
    ticketID: any,
    ticketName: any,
    to: string,
    workTimeID: number
}
