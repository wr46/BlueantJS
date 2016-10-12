export interface Task {
    accountableType: string
    accountedTime: number,
    accountedTimeAll: number
    children: Task[],
    endTime: string,
    name: string,
    number: number,
    plannedTime: number,
    plannedTimeAll: number,
    reasonNotAccountableID: any,
    reasonNotAccountableName: any,
    startTime: string,
    subjectiveProgress: number,
    subjectiveProgressAll: number,
    taskID: number,
    worktimeAllowed: boolean
}
