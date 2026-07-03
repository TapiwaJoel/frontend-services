import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { User } from '../user-menu/user-menu.component';

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './shell-layout.component.html',
  styleUrls: ['./shell-layout.component.scss']
})
export class ShellLayoutComponent {
  @Input() user: User | null = null;
  @Input() theme = 'light';

  currentYear = new Date().getFullYear();
}
