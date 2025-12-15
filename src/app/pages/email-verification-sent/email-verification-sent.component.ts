import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-verification-sent',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-verification-sent.component.html',
  styleUrls: ['./email-verification-sent.component.css']
})
export class EmailVerificationSentComponent implements OnInit {
  email: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}
