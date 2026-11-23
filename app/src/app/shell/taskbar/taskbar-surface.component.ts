import { ChangeDetectionStrategy, Component, ElementRef, viewChild } from '@angular/core';

/**
 * The shape of the taskbar: its glass and its edge, both drawn from one outline (see barOutline).
 * TaskbarComponent gives it the path; the glass is clipped to that path, so bar and swelling match exactly.
 */
@Component({
  selector: 'app-taskbar-surface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #glass class="glass" aria-hidden="true"></div>
    <svg #svg class="edge-line" aria-hidden="true" focusable="false"><path #path /></svg>
  `,
  styleUrl: './taskbar-surface.component.scss',
})
export class TaskbarSurfaceComponent {
  private readonly glassRef = viewChild.required<ElementRef<HTMLElement>>('glass');
  private readonly svgRef = viewChild.required<ElementRef<SVGSVGElement>>('svg');
  private readonly pathRef = viewChild.required<ElementRef<SVGPathElement>>('path');

  /** Draws the outline `d` in a box of `width` by `height` px, y growing downward. */
  paint(d: string, width: number, height: number): void {
    this.pathRef().nativeElement.setAttribute('d', d);
    this.svgRef().nativeElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
    this.glassRef().nativeElement.style.clipPath = `path("${d}")`;
  }
}
