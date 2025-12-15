import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `<footer><p>Footer</p></footer>`,
  styles: [`footer { background: #eee; padding: 10px; text-align: center; }`]
})
export class FooterComponent {}
