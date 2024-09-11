import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css']
})
export class TimerComponent implements OnInit, OnDestroy {
  public time: string = '00:00:00';
  private timerId: any;

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnDestroy(): void {
    console.log('OnDestroy called');
    this.stopTimer();
  }

  private startTimer(): void {
    this.timerId = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      this.time = this.formatTime(hours, minutes, seconds);
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  private formatTime(hours: number, minutes: number, seconds: number): string {
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }
}
