import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent {
  constructor(public authService: AuthService) {}
  inputText = '';
  messages: Array<{ user: string; text: string }> = [];

  send() {
    if (!this.inputText.trim()) return;
    const text = this.inputText.trim();
    this.messages.push({ user: 'You', text });
    this.inputText = '';

    // Call backend proxy to get AI reply
    this.messages.push({ user: 'Assistant', text: '...' }); // placeholder while loading
    const loadingIndex = this.messages.length - 1;

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text })
    })
      .then(async (res) => {
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || 'AI proxy error');
        }
        return res.json();
      })
      .then((json) => {
        const reply = json.reply || json.result || JSON.stringify(json);
        // replace loading placeholder
        this.messages[loadingIndex] = { user: 'Assistant', text: reply };
      })
      .catch((err) => {
        console.error('Chat error', err);
        this.messages[loadingIndex] = { user: 'Assistant', text: 'Error contacting AI: ' + (err.message || '') };
      });
  }

  openTogether() {
    window.open('https://together.ai', '_blank');
  }
}
