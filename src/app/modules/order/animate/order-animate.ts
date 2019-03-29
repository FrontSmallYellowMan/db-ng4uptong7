import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const newApply = trigger('newApply', [
    state('out', style({
        // transform: 'scale(1)'
        opacity: '0',
        display: "none"
    })),
    state('in', style({
        // transform: 'scale(1.1)'
        opacity: '0.94'
    })),
    transition('out => in', animate('200ms ease-in')),
    transition('in => out', animate('200ms ease-out'))
]);
export const indiaType = trigger('indiaType', [
    state('out', style({
        opacity: '0',
    })),
    state('in', style({
        // transform: 'scale(1.1)'
        opacity: '1'
    })),
    transition('out => in', animate('200ms ease-in')),
    transition('in => out', animate('200ms ease-out'))
])
