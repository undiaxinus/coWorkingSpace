import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase/supabase.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent {
  productName: string = '';
  price: string = '';
  component: string = '';
  extendedHrs: string = '';
  productDetails: string = '';
  attachedFiles: File[] = [];
  selectedImage: string | null = null;
  isError: boolean = false;

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.attachedFiles.push(file);

      // Create an object URL for the selected image
      this.selectedImage = URL.createObjectURL(file);
    }
  }

  triggerFileInput() {
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    fileInput.click();
  }

  removeSelectedImage() {
    this.selectedImage = null;
    this.attachedFiles = [];
  }

  viewFile(file: File) {
    const url = URL.createObjectURL(file);
    const newWindow = window.open(url);
    newWindow?.addEventListener('unload', () => URL.revokeObjectURL(url));
  }

  removeFile(index: number) {
    this.attachedFiles.splice(index, 1);
  }

  async submitForm() {
    if (!this.productName || !this.price || !this.component || !this.extendedHrs || !this.productDetails) {
      this.isError = true;

      Swal.fire({
        title: 'Error!',
        text: 'Please fill out all the fields before saving.',
        icon: 'error',
        confirmButtonText: 'OK'
      });

      return;
    }

    let imageUrl: string | null = null;

    // Upload each file and get its URL
    if (this.attachedFiles.length > 0) {
      const file = this.attachedFiles[0]; // Assuming you want to use the first file
      imageUrl = await this.supabaseService.uploadImage(file, 'pblue_file');
    }

    // If image upload failed or no file was selected, handle the error
    if (!imageUrl && this.attachedFiles.length > 0) {
      this.isError = true;

      

      return;
    }

    const result = await this.supabaseService.insertAddProduct(
      this.productName,
      this.price,
      this.component,
      this.extendedHrs,
      this.productDetails,
      imageUrl || '' // Use empty string if no image URL is available
    );

  }

  onCancel() {
    this.router.navigate(['/']);
  }
}
