import { Directive, HostListener, ElementRef } from '@angular/core';
import { PerformanceMonitoringService } from '../services/performance-monitoring.service';

@Directive({
  selector: '[appTrackClick]'
})
export class TrackClickDirective {
  constructor(
    private el: ElementRef,
    private performanceService: PerformanceMonitoringService
  ) {}

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    const element = this.el.nativeElement;
    const elementInfo = {
      tagName: element.tagName,
      id: element.id || '',
      className: element.className || '',
      textContent: element.textContent?.trim().substring(0, 50) || '',
      attributes: this.getElementAttributes(element)
    };

    this.performanceService.trackUserInteraction('click', JSON.stringify(elementInfo));
  }

  private getElementAttributes(element: any): any {
    const attrs: any = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      if (attr.name === 'id' || attr.name === 'class') continue;
      attrs[attr.name] = attr.value;
    }
    return attrs;
  }
}
