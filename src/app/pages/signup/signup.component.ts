import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BackendAuthService } from '../../services/backend-auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone: '',
    address: '',
    date_of_birth: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private authService: BackendAuthService
  ) {}

  registerUser() {
    // Basic validation
    if (!this.user.name.trim() || !this.user.email.trim() ||
        !this.user.password || !this.user.password_confirmation) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.user.password !== this.user.password_confirmation) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.user.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters long';
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.user).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.successMessage = response.message;
        
        // Show success message for a moment before redirecting
        setTimeout(() => {
          if (response.email_sent) {
            // Redirect to email verification notice page
            this.router.navigate(['/email-verification-sent'], { 
              queryParams: { email: this.user.email } 
            });
          } else {
            // Direct to login if no email verification needed
            this.router.navigate(['/login']);
          }
        }, 2000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        if (error.error?.errors) {
          // Handle validation errors
          const errors = error.error.errors;
          const errorMessages = Object.values(errors).flat();
          this.errorMessage = errorMessages.join(', ');
        } else {
          this.errorMessage = error.error?.message || 'An error occurred during registration. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}

