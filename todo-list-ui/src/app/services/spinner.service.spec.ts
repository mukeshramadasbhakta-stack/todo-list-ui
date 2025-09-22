import { TestBed } from '@angular/core/testing';
import { SpinnerService } from './spinner.service';
import { firstValueFrom } from 'rxjs';

describe('SpinnerService', () => {
  let service: SpinnerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpinnerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle loading state with show/hide', async () => {
    const values: boolean[] = [];
    const sub = service.loading$.subscribe((v) => values.push(v));
    service.show();
    service.hide();
    service.show();
    sub.unsubscribe();

    // Initial false, then true, false, true
    expect(values).toEqual([false, true, false, true]);
    const latest = await firstValueFrom(service.loading$);
    expect(typeof latest).toBe('boolean');
  });
});
