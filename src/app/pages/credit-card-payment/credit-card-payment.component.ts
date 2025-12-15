import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { StudentService } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-credit-card-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './credit-card-payment.component.html',
  styleUrls: ['./credit-card-payment.component.css']
})
export class CreditCardPaymentComponent implements OnInit {
  cardData = {
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  };

  isFlipped = false;
  paymentAmount: number = 0;
  feeId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private studentService: StudentService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get payment amount and fee ID from query params if available
    this.route.queryParams.subscribe(params => {
      console.log('Credit card payment component loaded with params:', params);
      this.paymentAmount = params['amount'] ? parseFloat(params['amount']) : 0;
      this.feeId = params['feeId'] || '';
      console.log('Payment amount:', this.paymentAmount, 'Fee ID:', this.feeId);
    });
  }

  // Format card number with spaces every 4 digits
  formatCardNumber(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  }

  // Format expiry date MM/YY
  formatExpiry(value: string): string {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  }

  // Detect card type based on number
  getCardType(): string {
    const num = this.cardData.number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'visa';
    if (num.startsWith('5') || num.startsWith('2')) return 'mastercard';
    if (num.startsWith('3')) return 'amex';
    return 'default';
  }

  onCardNumberChange(value: string) {
    const formatted = this.formatCardNumber(value);
    if (formatted.length <= 19) {
      this.cardData.number = formatted;
    }
  }

  onExpiryChange(value: string) {
    const formatted = this.formatExpiry(value);
    if (formatted.length <= 5) {
      this.cardData.expiry = formatted;
    }
  }

  onCvvChange(value: string) {
    const formatted = value.replace(/[^0-9]/g, '');
    if (formatted.length <= 4) {
      this.cardData.cvv = formatted;
    }
  }

  onNameChange(value: string) {
    this.cardData.name = value.toUpperCase();
  }

  onCvvFocus() {
    this.isFlipped = true;
  }

  onCvvBlur() {
    this.isFlipped = false;
  }

  processPayment() {
    // Validate card data
    if (!this.cardData.number || this.cardData.number.replace(/\s/g, '').length < 13) {
      alert('Please enter a valid card number');
      return;
    }
    if (!this.cardData.name || this.cardData.name.trim().length < 2) {
      alert('Please enter cardholder name');
      return;
    }
    if (!this.cardData.expiry || this.cardData.expiry.length < 5) {
      alert('Please enter a valid expiry date');
      return;
    }
    if (!this.cardData.cvv || this.cardData.cvv.length < 3) {
      alert('Please enter a valid CVV');
      return;
    }

    // Process payment through student service
    if (this.paymentAmount > 0 && this.feeId) {
      const success = this.studentService.makePayment(
        this.paymentAmount,
        this.feeId,
        'Credit Card'
      );

      if (success) {
        alert('Payment processed successfully!');
        this.router.navigate(['/student']);
      } else {
        alert('Payment failed. Please try again.');
      }
    } else {
      alert('Payment processed successfully!');
      this.router.navigate(['/student']);
    }
  }

  goBack() {
    this.router.navigate(['/student']);
  }
}

