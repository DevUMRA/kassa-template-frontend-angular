import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { ApiError } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';
import { LoginPage, safeNextUrl } from './login-page';

describe('LoginPage', () => {
  const login = vi.fn();

  beforeEach(() => {
    login.mockReset();
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login } }],
    });
  });

  async function submit(username: string, password: string) {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.componentRef.setInput('next', '/reports');
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const [user, pass] = Array.from(element.querySelectorAll('input'));
    user.value = username;
    user.dispatchEvent(new Event('input'));
    pass.value = password;
    pass.dispatchEvent(new Event('input'));
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    return element;
  }

  it('logs in and opens the next page', async () => {
    login.mockResolvedValue({});
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    await submit('admin', 'secret');
    expect(login).toHaveBeenCalledWith('admin', 'secret');
    expect(navigate).toHaveBeenCalledWith('/reports');
  });

  it('shows the old UI message for wrong credentials', async () => {
    login.mockRejectedValue(new ApiError(['Қате.'], 400));
    const element = await submit('admin', 'wrong');
    expect(element.querySelector('.alert-error')?.textContent?.trim()).toBe(
      'Логин немесе құпия сөз қате.',
    );
  });

  it('does not submit an empty form', async () => {
    await submit('', '');
    expect(login).not.toHaveBeenCalled();
  });

  it('accepts only local next URLs', () => {
    expect(safeNextUrl('/inventory/2')).toBe('/inventory/2');
    expect(safeNextUrl('//evil.test')).toBe('/');
    expect(safeNextUrl('https://evil.test')).toBe('/');
    expect(safeNextUrl(undefined)).toBe('/');
  });
});
