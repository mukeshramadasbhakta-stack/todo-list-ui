import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser'
import { SpinnerComponent } from './spinner.component';

describe('Spinner', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpinnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    component.loading = true

    fixture.detectChanges()

    expect(component).toBeTruthy()
    expect(component.diameter).toBe(50)
    expect(component.loading).toBe(true)
    let divElement = fixture.debugElement.query(By.css('.spinner-container'))
    expect(divElement).toBeTruthy()
  });
});
