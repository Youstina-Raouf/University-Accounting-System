import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent {
  user: any = {
    firstname: '',
    lastname: '',
    email: '',
    username: '',
    avatar: ''
  };
  editMode = false;
  avatarPreview: string | null = null;
  avatarUpdated = false;

  constructor(private router: Router, private storage: StorageService) {}

  ngOnInit() {
    // Prefer session storage (active session) then fall back to local storage
    const sessionUser = this.storage.getSession('currentUser');
    if (sessionUser) {
      this.user = sessionUser;
      this.avatarPreview = this.user.avatar || null;
      return;
    }

    const localUser = this.storage.getLocal('currentUser');
    if (localUser) {
      this.user = localUser;
      this.avatarPreview = this.user.avatar || null;
    }
  }

  toggleEdit() {
    this.editMode = !this.editMode;
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview = String(reader.result || '');
      this.user.avatar = this.avatarPreview;
      this.avatarUpdated = true;
      setTimeout(() => (this.avatarUpdated = false), 900);
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {
    // Update session and local currentUser and users list so changes (avatar etc.) are visible immediately
    try {
      this.storage.setSession('currentUser', this.user);
    } catch (e) {
      // fallback
      localStorage.setItem('currentUser', JSON.stringify(this.user));
    }

    const usersRaw = localStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u: any) => u.username === this.user.username);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...this.user };
    } else {
      users.push(this.user);
    }
    try {
      this.storage.setLocal('users', users);
    } catch (e) {
      localStorage.setItem('users', JSON.stringify(users));
    }
    this.editMode = false;
  }
  changePassword() {
    const newPass = prompt('Enter new password (mock):');
    if (!newPass) return;
    // In this mock app we just store the plaintext password locally for demo purposes
    this.user.password = newPass;
    try {
      this.storage.setSession('currentUser', this.user);
    } catch (e) {
      localStorage.setItem('currentUser', JSON.stringify(this.user));
    }
    const usersRaw = localStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u: any) => u.username === this.user.username);
    if (idx >= 0) {
      users[idx].password = newPass;
      try {
        this.storage.setLocal('users', users);
      } catch (e) {
        localStorage.setItem('users', JSON.stringify(users));
      }
    }
    alert('Password changed (mock).');
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
