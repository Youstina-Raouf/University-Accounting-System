import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BackendAuthService } from '../../services/backend-auth.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  returnUrl: string = '';
  rememberMe: boolean = false;

  constructor(
    private authService: BackendAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sound: SoundService
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to home
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Prefill email from remember me cookie if present
    const rememberedEmail = this.authService.getRememberedEmail();
    if (rememberedEmail) {
      this.email = rememberedEmail;
      this.rememberMe = true;
    }

    // Check if user is already authenticated
    if (this.authService.isAuthenticated()) {
      const homeRoute = this.authService.getHomeRoute();
      this.router.navigate([homeRoute], { replaceUrl: true });
    }
  }

  login(event?: Event) {
    // Prevent form default submission
    if (event) {
      event.preventDefault();
    }

    // Basic validation
    if (!this.email.trim() || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email.trim(), this.password, this.rememberMe).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        
        // Play success tone
        try { this.sound.playSuccess(); } catch (e) { }

        // Check email verification
        if (!response.email_verified) {
          this.errorMessage = 'Please verify your email address. Check your inbox for a verification link.';
          this.isLoading = false;
          return;
        }

        // Navigate to home route
        const homeRoute = this.authService.getHomeRoute();
        console.log('Redirecting to:', homeRoute);

        this.router.navigate([homeRoute], { replaceUrl: true }).then(
          (navSuccess) => {
            if (!navSuccess) {
              console.error('Navigation failed, trying alternative route');
              window.location.href = homeRoute;
            }
            this.isLoading = false;
          },
          (error) => {
            console.error('Navigation error:', error);
            window.location.href = homeRoute;
            this.isLoading = false;
          }
        );
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Invalid email or password. Please check your credentials and try again.';
        this.isLoading = false;
      }
    });
  }

  // Helper method to navigate to signup
  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
