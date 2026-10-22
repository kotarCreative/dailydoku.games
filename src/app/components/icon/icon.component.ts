import { Component, Input } from '@angular/core';

export type AppIconName = 'external' | 'arrow-right' | 'arrow-left' | 'close' | 'sparkles' | 'plus';

@Component({
  selector: 'app-icon',
  standalone: true,
  host: { '[attr.aria-hidden]': 'true' },
  template: `
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      @switch (name) {
        @case ('external') { <path d="M15 3h6v6"/><path d="m21 3-9 9"/><path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/> }
        @case ('arrow-right') { <path d="M5 12h14"/><path d="m13 6 6 6-6 6"/> }
        @case ('arrow-left') { <path d="M19 12H5"/><path d="m11 18-6-6 6-6"/> }
        @case ('close') { <path d="m18 6-12 12"/><path d="M6 6l12 12"/> }
        @case ('sparkles') { <path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z"/><path d="m19 14 1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14Z"/> }
        @case ('plus') { <path d="M12 5v14"/><path d="M5 12h14"/> }
      }
    </svg>
  `,
  styles: [`:host{display:inline-flex;width:18px;height:18px;flex-shrink:0;vertical-align:middle;align-items:center;justify-content:center}:host([hidden]){display:none}svg{display:block;width:100%;height:100%}`]
})
export class IconComponent {
  @Input() name: AppIconName = 'external';
}
