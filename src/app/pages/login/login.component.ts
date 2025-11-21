import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { SoundService } from '../../services/sound.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  returnUrl: string = '';
  rememberMe: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sound: SoundService
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to home
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    // Don't auto-redirect if logged in - allow user to see login page
    // User can logout if they want to switch accounts
  }

  login(event?: Event) {
    // Prevent form default submission
    if (event) {
      event.preventDefault();
    }

    // Basic validation
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call with a delay
    setTimeout(() => {
      try {
        // Ensure users are initialized
        const users = this.authService.getAllUsersForDebug();
        if (users.length === 0) {
          this.errorMessage = 'No users found. Please contact administrator.';
          this.isLoading = false;
          return;
        }

        const success = this.authService.login(this.username.trim(), this.password, this.rememberMe);

        if (success) {
          // Verify user is logged in
          const currentUser = this.authService.getCurrentUser();
          console.log('Login successful, current user:', currentUser);
          // play success tone
          try { this.sound.playSuccess(); } catch (e) { }
          
          if (!currentUser) {
            this.errorMessage = 'Failed to store user session. Please try again.';
            this.isLoading = false;
            return;
          }

          // Get the home route based on role
          const homeRoute = this.authService.getHomeRoute();
          console.log('Redirecting to:', homeRoute);
          
          // Use navigate with replaceUrl to prevent back button issues
          this.router.navigate([homeRoute], { replaceUrl: true }).then(
            (navSuccess) => {
              if (!navSuccess) {
                console.error('Navigation failed, trying alternative route');
                // Force navigation
                window.location.href = homeRoute;
              }
              this.isLoading = false;
            },
            (error) => {
              console.error('Navigation error:', error);
              // Fallback: force navigation
              window.location.href = homeRoute;
              this.isLoading = false;
            }
          );
        } else {
          this.errorMessage = 'Invalid username or password. Please check your credentials and try again.';
          this.isLoading = false;
        }
      } catch (error) {
        console.error('Login error:', error);
        this.errorMessage = 'An error occurred during login. Please try again.';
        this.isLoading = false;
      }
    }, 500);
  }

  // Helper method to navigate to signup
  navigateToSignup() {
    this.router.navigate(['/signup']);
  }
}
