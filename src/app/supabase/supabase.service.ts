import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import Swal from 'sweetalert2'; // Import SweetAlert2

// Define constants outside the class
const supabaseUrl = 'https://jkladmgpcfkdinjyxzaf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprbGFkbWdwY2ZrZGluanl4emFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyNjY4OTUsImV4cCI6MjAzNzg0Mjg5NX0.3kzgjTXPzxwdZ1XMtxBZQ_t2PnJnLySZ_cW07lg32cs';
const supabaseClient: SupabaseClient = createClient(supabaseUrl, supabaseKey);

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {

  // Method to upload image to Supabase bucket
  async uploadImage(file: File, bucketName: string): Promise<string | null> {
    const fileName = `${Date.now()}_${file.name}`;
    try {
      // Upload the image to the specified bucket
      const { data, error } = await supabaseClient
        .storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error.message);
        Swal.fire({
          icon: 'error',
          title: 'Upload Failed',
          text: 'There was an error uploading the image. Please try again.',
        });
        return null;
      }

      // Get the public URL of the uploaded image
      const { data: publicUrlData } = supabaseClient
        .storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Ensure publicUrlData is defined
      if (!publicUrlData) {
        console.error('Error getting public URL: No data returned');
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to retrieve the public URL of the uploaded image.',
        });
        return null;
      }

      console.log('Image uploaded successfully:', publicUrlData.publicUrl);
      
      return publicUrlData.publicUrl || null;
    } catch (error) {
      console.error('Unexpected error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An unexpected error occurred. Please try again.',
      });
      return null;
    }
  }

  // Method to insert a new product
  async insertAddProduct(productName: string, price: string, component: string, extendedHrs: string, productDetails: string, imageUrl: string) {
    console.log('Inserting product data:', { productName, price, component, extendedHrs, productDetails, imageUrl });

    try {
      // Insert data into the product table
      const { data, error } = await supabaseClient
        .from('product')
        .insert([
          { productName: productName, price: price, category: component, extendedHrs: extendedHrs, productDetails: productDetails, imageUrl: imageUrl }
        ]);

      if (error) {
        console.error('Error inserting product data:', error.message);
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'There was an error adding the product. Please try again.',
        });
        return null;
      }

      Swal.fire({
        icon: 'success',
        title: 'Product Added',
        text: 'The product has been added successfully!',
      }).then(() => {
        location.reload();
      });
      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An unexpected error occurred while adding the product. Please try again.',
      });
      return null;
    }
  }

  // Method to fetch products by category
  async fetchProductsByComponent(category: string) {
    try {
      const { data, error } = await supabaseClient
        .from('product') // Change to your table name if different
        .select('*')
        .eq('category', category); // Use the correct column name

      if (error) {
        console.error('Error fetching products:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }

  // Method to insert an order
  async insertBuyNow(clientID: string, productName: string, quantity: string, totalPrice: string, totalHours: string ) {
    console.log('Inserting order data:', { clientID, productName, quantity, totalPrice, totalHours });

    try {
      // Insert data into the order_list table
      const { data, error } = await supabaseClient
        .from('order_list')
        .insert([
          { clientID: clientID, product_name: productName, qty: quantity, total_pay: totalPrice, hours: totalHours }
        ]);

      if (error) {
        console.error('Error inserting order data:', error.message);
        Swal.fire({
          icon: 'error',
          title: 'Submission Failed',
          text: 'There was an error adding the order. Please try again.',
        });
        return null;
      }

      Swal.fire({
        icon: 'success',
        title: 'Order Placed',
        text: 'The order has been placed successfully!',
      }).then(() => {
        location.reload();
      });
      return data;
    } catch (error) {
      console.error('Unexpected error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Unexpected Error',
        text: 'An unexpected error occurred while placing the order. Please try again.',
      });
      return null;
    }
  }

  // Method to fetch all orders
  async fetchOrder() {
    try {
      const { data, error } = await supabaseClient
        .from('order_list') 
        .select('*');

      if (error) {
        console.error('Error fetching orders:', error.message);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error:', error);
      return [];
    }
  }
  

  // Method to delete an order by ID
  async deleteOrder(orderId: number) {
    try {
      const { error } = await supabaseClient
        .from('order_list')
        .delete()
        .eq('clientID', orderId); // Ensure 'clientID' is the correct column name
      if (error) {
        throw new Error(error.message); // Throw error if deletion fails
      }
      
      return { success: true }; // Indicate successful deletion
    } catch (error) {
      console.error('Unexpected error:', error);
      return { error }; // Return error for handling in the component
    }
  }

  async updateOrderHours(clientID: string, hours: number): Promise<{ error: any }> {
    try {
      const { error } = await supabaseClient
        .from('orders')
        .update({ hours })
        .eq('clientID', clientID);
  
      // Return an object with the `error` property
      return { error };
    } catch (error) {
      // In case of any other errors
      return { error };
    }
  }
}
