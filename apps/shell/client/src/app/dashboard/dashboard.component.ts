import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppSelectorComponent } from '../components/app-selector/app-selector.component';

@Component({
  selector: 'org-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, AppSelectorComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {}
