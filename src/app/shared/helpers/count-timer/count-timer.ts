import { Observable, Subject, Subscription, interval, timer } from 'rxjs';
import { CountTimed, CountTimerEvent } from './count-timed';

export interface CountTimerConfig {
  startTime: number | Date;
  stopTime?: number | Date;
  frequency?: number;
}

const frequencyDefault = 1000;

export class RxCountTimer {
  private _timerSubject = new Subject<CountTimed>();

  private _subscription: Subscription;

  private _currentTime: number;

  startTime: number;
  stopTime: number;
  frequency: number;

  public isStarted = false;
  public isResumed = false;
  public isCounting = false;
  public isPaused = false;
  public isStopped = false;
  public isDestroyed = false;

  get events() {
    return this._timerSubject.asObservable();
  }

  private get isDownMode() {
    return this.startTime > this.stopTime;
  }

  private get hasTimeDiff() {
    if (this.isDownMode) {
      return this._currentTime > this.stopTime;
    } else {
      return this._currentTime < this.stopTime;
    }
  }

  constructor(config?: CountTimerConfig) {
    this._setup(config);
  }

  clear(config?: CountTimerConfig) {
    this.reset(
      Object.assign(
        {},
        {
          startTime: 0,
          stopTime: Number.MAX_SAFE_INTEGER,
          frequency: frequencyDefault,
        },
        config ?? {}
      )
    );
  }

  reset(config?: CountTimerConfig) {
    this._setup(config);
    this.stop();
  }

  start() {
    if (this.isDestroyed) {
      return;
    }

    if (this.isStarted) {
      return;
    }

    this.isStopped = false;
    this.isPaused = false;
    this.isResumed = false;
    this.isStarted = true;
    this._currentTime = this.startTime;
    this._emitEvent(CountTimerEvent.Started);
    this.resume();
  }

  resume() {
    if (this.isDestroyed) {
      return;
    }

    if (!this.hasTimeDiff || !this.isStarted || this.isResumed) {
      return;
    }

    this.isStopped = false;
    this.isPaused = false;
    this.isResumed = true;
    this._reflow();
    this._emitEvent(CountTimerEvent.Resumed);
  }

  pause() {
    if (this.isDestroyed) {
      return;
    }

    if (this.isPaused || this.isStopped || !this.isResumed) {
      return;
    }

    this.isResumed = false;
    this.isPaused = true;
    this._subscription?.unsubscribe();
    this._emitEvent(CountTimerEvent.Paused);
  }

  stop() {
    if (this.isDestroyed) {
      return;
    }

    if (!this.hasTimeDiff || this.isStopped || !this.isStarted) {
      return;
    }

    this.pause();

    this.isStarted = false;
    this.isStopped = true;
    this._currentTime = this.startTime;
    this._emitEvent(CountTimerEvent.Stopped);
  }

  destroy() {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;
    this._subscription?.unsubscribe();
    this._timerSubject.complete();
  }

  private _setup(
    { startTime, stopTime, frequency }: CountTimerConfig = {} as any
  ) {
    if (startTime instanceof Date) {
      this.startTime = startTime.getTime() - Date.now();
    } else {
      this.startTime = startTime ?? this.startTime ?? 0;
    }

    if (stopTime instanceof Date) {
      this.stopTime = stopTime.getTime();
    } else {
      this.stopTime = stopTime ?? this.stopTime ?? Number.POSITIVE_INFINITY;
    }

    this.frequency = frequency ?? this.frequency ?? frequencyDefault;

    this._currentTime = this.startTime;
    this._emitEvent(CountTimerEvent.Configured);
  }

  private _reflow() {
    const thisRef = new WeakRef(this);
    const frequency = this.frequency;

    let lastTime = Date.now();
    const subscription = interval(frequency).subscribe(() => {
      const thisAux = thisRef.deref();

      const now = Date.now();
      const diff = now - lastTime;
      lastTime = now;

      if (thisAux.isDownMode) {
        thisAux._currentTime -= diff;
      } else {
        thisAux._currentTime += diff;
      }

      if (!this.hasTimeDiff) {
        thisAux._currentTime = thisAux.stopTime;
        subscription.unsubscribe();
      }

      thisAux._emitEvent(CountTimerEvent.Counted);
    });

    this._subscription = subscription;
  }

  private _emitEvent(eventType: CountTimerEvent) {
    this._timerSubject.next(new CountTimed(this._currentTime, eventType));
  }
}
