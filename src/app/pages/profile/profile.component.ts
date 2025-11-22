import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  constructor(private router: Router) {}

  ngOnInit() {
    const cu = localStorage.getItem('currentUser');
    if (cu) {
      this.user = JSON.parse(cu);
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
    // Update local currentUser and users list
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    const usersRaw = localStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u: any) => u.username === this.user.username);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...this.user };
    } else {
      users.push(this.user);
    }
    localStorage.setItem('users', JSON.stringify(users));
    this.editMode = false;
  }
  changePassword() {
    const newPass = prompt('Enter new password (mock):');
    if (!newPass) return;
    // In this mock app we just store the plaintext password locally for demo purposes
    this.user.password = newPass;
    localStorage.setItem('currentUser', JSON.stringify(this.user));
    const usersRaw = localStorage.getItem('users');
    const users = usersRaw ? JSON.parse(usersRaw) : [];
    const idx = users.findIndex((u: any) => u.username === this.user.username);
    if (idx >= 0) {
      users[idx].password = newPass;
      localStorage.setItem('users', JSON.stringify(users));
    }
    alert('Password changed (mock).');
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['/login']);
  }
}
