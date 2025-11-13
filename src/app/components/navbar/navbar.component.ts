import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  template: `<nav><h1>Navbar</h1></nav>`,
  styles: [`nav { background: #eee; padding: 10px; }`]
})
export class NavbarComponent {}
