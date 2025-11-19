import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  user = {
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  registerUser() {
    // Validation
    if (!this.user.firstname.trim() || !this.user.lastname.trim() || 
        !this.user.email.trim() || !this.user.username.trim() || 
        !this.user.password || !this.user.role) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.user.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Simulate API call
    setTimeout(() => {
      try {
        // Save user to localStorage (in a real app, this would be an API call)
        const users = this.getUsers();
        const existingUser = users.find(u => u.username === this.user.username);
        
        if (existingUser) {
          this.errorMessage = 'Username already exists';
          this.isLoading = false;
          return;
        }

        // Add new user
        const newUser = {
          username: this.user.username,
          password: this.user.password,
          role: this.user.role as 'admin' | 'accounting' | 'student',
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          email: this.user.email
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        // Auto-login the new user
        const { password, ...userWithoutPassword } = newUser;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));

        // Redirect based on role
        if (this.user.role === 'admin') {
          this.router.navigate(['/admin']);
        } else if (this.user.role === 'accounting') {
          this.router.navigate(['/accounting']);
        } else {
          this.router.navigate(['/student']);
        }
      } catch (error) {
        console.error('Registration error:', error);
        this.errorMessage = 'An error occurred during registration. Please try again.';
        this.isLoading = false;
      }
    }, 500);
  }

  private getUsers(): any[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
