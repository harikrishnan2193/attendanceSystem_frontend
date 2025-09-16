import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() navClick = new EventEmitter<void>();
  userName: string = '';
  userRole: string = '';
  isAdmin: boolean = false;

  ngOnInit() {
    this.loadUserData();
  }

   onNavClick() {
    this.navClick.emit();
  }

  private loadUserData(): void {
    try {
      const userDataString = sessionStorage.getItem('user');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        this.userName = this.formatUserName(userData.name || '');
        this.userRole = this.formatRole(userData.role || '');
        this.isAdmin = userData.role === 'ADMIN';
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.userName = 'User';
      this.userRole = 'Employee';
      this.isAdmin = false;
    }
  }

  private formatUserName(name: string): string {
    if (!name || name.trim() === '') return 'User';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  }

  private formatRole(role: string): string {
    if (!role || role.trim() === '') return 'Employee';
    return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  }
}
