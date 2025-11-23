import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    <div class="container mt-4">
      <router-outlet></router-outlet>
    </div>
    <app-footer></app-footer>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .container {
      flex: 1;
    }
  `]
})
export class App implements OnInit, OnDestroy {
  showNavbar = true;
  private sub: Subscription | null = null;
  private hiddenRoutes = ['/login', '/signup'];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // set initial state
    try { this.showNavbar = !this.hiddenRoutes.includes(this.router.url); } catch (e) { this.showNavbar = true; }
    // update on navigation
    this.sub = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationEnd) {
        try { this.showNavbar = !this.hiddenRoutes.includes(evt.urlAfterRedirects.split('?')[0]); } catch (e) { this.showNavbar = true; }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}

