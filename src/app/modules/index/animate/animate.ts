import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const shrinkOut = trigger('shrinkOut', [
    state('in', style({height: '*'})),
    state('out', style({height: 0})),
    transition('out => in', animate('200ms ease-in')),
    transition('in => out', animate('200ms ease-out'))
  ]);
export const shrinkOutC = trigger('shrinkOutC', [
    state('open', style({height: '*'})),
    state('close', style({height: 0})),
    transition('close => open', animate('200ms ease-in')),
    transition('open => close', animate('200ms ease-out'))
  ]);
