import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../supabase/supabase.service';
import Swal from 'sweetalert2';
import { interval, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-coffee-menu',
  templateUrl: './coffee-menu.component.html',
  styleUrls: ['./coffee-menu.component.css']
})
export class CoffeeMenuComponent implements OnInit, OnDestroy {
  isAddProductVisible = false;
  isBuyNowVisible = false;
  products: any[] = [];
  orders: any[] = [];
  selectedComponent: string = '';
  isDragging = false;
  draggedOrderId: number | null = null;
  price: number = 0;
  quantity: number = 1;
  extendedHrs: string = '0:00'; // Changed to string for HH:MM format
  totalPrice: number = 0;
  totalHours: string = ''; // To display total hours
  clientID: string = '';
  productName: string = '';
  isError: boolean = false;
  private countdownSubscriptions: Subscription[] = [];

  constructor(private router: Router, private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.loadOrders();
    this.onComponentSelect('Drinks');
  }

  ngOnDestroy() {
    this.countdownSubscriptions.forEach(sub => sub.unsubscribe());
  }

  async loadOrders() {
    this.orders = await this.supabaseService.fetchOrder();
    this.startCountdown();
  }

  startCountdown() {
    this.orders.forEach((order) => {
      const [hours, minutes] = order.hours.split(':').map(Number);
      const totalMinutes = (hours * 60) + minutes;
      const endTime = new Date(Date.now() + totalMinutes * 60 * 1000);

      localStorage.setItem(`order_${order.id}_endTime`, endTime.toISOString());

      const countdownSubscription = interval(1000)
        .pipe(
          startWith(0)
        )
        .subscribe(() => {
          const now = new Date();
          const remainingTime = endTime.getTime() - now.getTime();
          
          if (remainingTime <= 0) {
            order.displayTime = '00:00:00';
             // Remove end time from localStorage if countdown is finished
          localStorage.removeItem(`order_${order.id}_endTime`);
          } else {
            const remainingHours = Math.floor(remainingTime / (1000 * 60 * 60));
            const remainingMinutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
            const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
            order.displayTime = `${this.formatTime(remainingHours)}:${this.formatTime(remainingMinutes)}:${this.formatTime(remainingSeconds)}`;
          }
        });

      this.countdownSubscriptions.push(countdownSubscription);
    });
  }

  formatTime(value: number): string {
    return value < 10 ? `0${value}` : value.toString();
  }

  async onComponentSelect(category: string) {
    this.selectedComponent = category;
    this.products = await this.supabaseService.fetchProductsByComponent(category);
  }

  showAddProductPopup() {
    this.isAddProductVisible = true;
  }

  closeAddProductPopup() {
    this.isAddProductVisible = false;
  }

  private convertTimeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + minutes;
  }

  private convertMinutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  }

  calculateTotalPrice() {
    const extendedHrsInMinutes = this.convertTimeToMinutes(this.extendedHrs);
    this.totalPrice = (this.price * this.quantity) + (extendedHrsInMinutes * this.quantity);
    this.calculateTotalHours();
  }

  calculateTotalHours() {
    const extendedHrsInMinutes = this.convertTimeToMinutes(this.extendedHrs);
    const totalMinutes = extendedHrsInMinutes * this.quantity;
    this.totalHours = this.convertMinutesToTime(totalMinutes);
  }

  showBuyNowPopup(product: any) {
    this.productName = product.productName;
    this.price = product.price;
    this.extendedHrs = product.extendedHrs; // Set the extended hours from the product
    this.calculateTotalPrice(); // Ensure totalPrice and totalHours are calculated
    this.isBuyNowVisible = true;
  }

  closeBuyNowPopup() {
    this.isBuyNowVisible = false;
  }

  async submitForm() {
    if (!this.clientID || !this.productName || !this.quantity || !this.totalPrice || !this.totalHours) {
      this.isError = true;

      Swal.fire({
        title: 'Error!',
        text: 'Please fill out all the fields before saving.',
        icon: 'error',
        confirmButtonText: 'OK'
      });

      return;
    }

    const totalPriceStr = this.totalPrice.toString();
    const totalHoursStr = this.totalHours;
    const quantityStr = this.quantity.toString();

    const result = await this.supabaseService.insertBuyNow(
      this.clientID,
      this.productName,
      quantityStr,
      totalPriceStr,
      totalHoursStr
    );
  }

  onCancel() {
    this.router.navigate(['/']);
  }

  onMouseDown(event: MouseEvent, orderId: number) {
    this.isDragging = true;
    this.draggedOrderId = orderId;
  }

  onMouseUp(event: MouseEvent, orderId: number) {
    if (this.isDragging && this.draggedOrderId === orderId) {
      this.deleteOrder(orderId);
    }
    this.isDragging = false;
    this.draggedOrderId = null;
  }

  onDragStart(event: DragEvent, orderId: number) {
    this.isDragging = true;
    this.draggedOrderId = orderId;
  }

  onDragEnd(event: DragEvent) {
    if (this.isDragging) {
      if (this.draggedOrderId !== null) {
        this.deleteOrder(this.draggedOrderId);
      }
      this.isDragging = false;
      this.draggedOrderId = null;
    }
  }

  async deleteOrder(orderId: number) {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel!',
    });
  
    if (result.isConfirmed) {
      const { error } = await this.supabaseService.deleteOrder(orderId);
      if (error) {
        Swal.fire('Error!', 'Something went wrong. Please try again.', 'error');
      } else {
        Swal.fire('Deleted!', 'Your order has been deleted.', 'success').then(() => {
          window.location.reload(); // Refresh the page
        });
      }
    }
  }
  
}
