import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { SharedModule } from '../../shared/shared.module';
import { TodotaskComponent } from "./component/todotask/todotask.component";
import { TaskService } from "./service/task-service";

const TodotaskRoutes: Routes = [
    { path :'', data:{'breadcrumb':''}, component: TodotaskComponent}
]

@NgModule({
    imports: [SharedModule,RouterModule.forChild(TodotaskRoutes)],
    declarations: [TodotaskComponent],
    providers: [TaskService]
})
export class ApproveTaskAppModule { }