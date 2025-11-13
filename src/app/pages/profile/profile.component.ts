import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  // Add your profile logic here
  userName: string = 'Youstina';
  email: string = 'youstina@example.com';
}
