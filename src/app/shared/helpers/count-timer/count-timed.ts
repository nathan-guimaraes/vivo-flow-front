export enum CountTimerEvent {
  Configured = 101,
  Started = 1,
  Resumed = 2,
  Counted = 3,
  Paused = 4,
  Stopped = 5,
}

export class CountTimed {
  constructor(
    public readonly time: number,
    public readonly type: CountTimerEvent
  ) {}
}
