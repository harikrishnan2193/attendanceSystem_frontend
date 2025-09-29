import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  // shows success alert with green checkmark icon
  success(message: string, title: string = 'Success') {
    return Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonText: 'OK',
    });
  }

  // shows error alert with red X icon
  error(message: string, title: string = 'Error') {
    return Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonText: 'OK',
    });
  }

  // shows warning alert with yellow exclamation icon
  warning(message: string, title: string = 'Warning') {
    return Swal.fire({
      title,
      text: message,
      icon: 'warning',
      confirmButtonText: 'OK',
    });
  }

  // shows confirmation dialog with Yes/No buttons
  confirm(message: string, title: string = 'Confirm') {
    return Swal.fire({
      title,
      text: message,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    });
  }

  // shows info alert with blue info icon
  info(message: string, title: string = 'Info') {
    return Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonText: 'OK',
    });
  }
}
