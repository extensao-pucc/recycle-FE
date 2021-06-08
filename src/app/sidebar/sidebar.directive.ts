import { Directive,HostListener,HostBinding } from '@angular/core';

@Directive({
  selector: '[appSidebar]',
  exportAs: 'appSidebar'
})
export class SidebarDirective {

@HostBinding('class.is-open') click = false;
constructor() { }

@HostListener('click') onClick(){
this.click = !this.click;
}
}
