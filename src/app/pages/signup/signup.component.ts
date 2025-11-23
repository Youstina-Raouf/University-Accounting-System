import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';

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
    role: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    prefNewsletter: false,
    prefNotifications: false,
    avatarBase64: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  avatarPreview: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private storageService: StorageService
  ) {}

  registerUser() {
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

    setTimeout(() => {
      try {
        const users = this.getUsers();
        const existingUser = users.find((u: any) => u.username === this.user.username);

        if (existingUser) {
          this.errorMessage = 'Username already exists';
          this.isLoading = false;
          return;
        }

        const newUser: any = {
          username: this.user.username,
          password: this.user.password,
          role: this.user.role,
          firstname: this.user.firstname,
          lastname: this.user.lastname,
          email: this.user.email
        };

        if (this.user.avatarBase64) {
          newUser.avatar = this.user.avatarBase64;
        }
        if (this.user.prefNewsletter) {
          newUser.prefNewsletter = true;
        }
        if (this.user.prefNotifications) {
          newUser.prefNotifications = true;
        }
        if (this.user.cardNumber && this.user.cardNumber.trim().length >= 4) {
          const digits = this.user.cardNumber.replace(/\D/g, '');
          newUser.cardLast4 = digits.slice(-4);
        }

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        const { password, ...userWithoutPassword } = newUser;
        // Store newly registered user into session so they are immediately logged in for this tab
        try {
          this.storageService.setSession('currentUser', userWithoutPassword);
        } catch (e) {
          // fallback
          localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        }

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

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = String(reader.result || '');
      this.user.avatarBase64 = this.avatarPreview || '';
    };
    reader.readAsDataURL(file);
  }

  private getUsers(): any[] {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}

