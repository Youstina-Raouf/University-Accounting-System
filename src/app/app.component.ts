import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,            // <-- REQUIRED for imports[] to work
  template: '<router-outlet></router-outlet>',
  imports: [RouterOutlet],     // <-- Now valid
  styleUrls: []
})
export class AppComponent {
  title = 'University Accounting System';
}
