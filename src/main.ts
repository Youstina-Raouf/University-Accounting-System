import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
// Chart.js registration for ng2-charts
import { Chart, registerables } from 'chart.js';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

// Register Chart.js components (required by Chart.js v3+)
Chart.register(...registerables);

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient()
  ]
}).catch(err => console.error(err));
