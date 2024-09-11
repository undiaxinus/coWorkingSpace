import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoffeeMenuComponent } from './coffee-menu/coffee-menu.component';
import { AddProductComponent } from './add-product/add-product.component';
import { TimerComponent } from './timer/timer.component';

const routes: Routes = [
  { path: 'map', component: CoffeeMenuComponent},
  { path: 'add-product', component: AddProductComponent},
  { path: 'timer', component: TimerComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
