import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000/api';

test.describe('Auth API', () => {

  // ==================== LOGIN TESTS ====================

  test.describe('POST /auth/login', () => {

    test('returns token for valid credentials', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'new@eventy.com',
          password: 'newAcc123'
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.token).toBeDefined();
      expect(body._id).toBeDefined();
      expect(body.email).toBe('new@eventy.com');
      expect(body.name).toBeDefined();
      expect(body.role).toBeDefined();
      expect(body.password).toBeUndefined(); // Password should not be returned
    });

    test('returns 401 for non-existent email', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'nonexistent@test.com',
          password: 'password123'
        }
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toMatch(/invalid/i);
    });

    test('returns 401 for wrong password', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'new@eventy.com',
          password: 'wrongpassword'
        }
      });

      expect(response.status()).toBe(401);
      const body = await response.json();
      expect(body.message).toMatch(/invalid/i);
    });

    test('returns 400 for missing email', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          password: 'password123'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors).toBeDefined();
      expect(body.errors.some((e: any) => e.path === 'email')).toBe(true);
    });

    test('returns 400 for missing password', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'new@eventy.com'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors).toBeDefined();
      expect(body.errors.some((e: any) => e.path === 'password')).toBe(true);
    });

    test('returns 400 for invalid email format', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'notanemail',
          password: 'password123'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors).toBeDefined();
    });

    test('returns 400 for empty request body', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {}
      });

      expect(response.status()).toBe(400);
    });

    test('email is case-insensitive (normalized)', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'NEW@EVENTY.COM',
          password: 'newAcc123'
        }
      });

      // Should work - email gets normalized
      expect(response.status()).toBe(200);
    });

  });

  // ==================== REGISTER TESTS ====================

  test.describe('POST /auth/register', () => {

    test('creates user with valid data', async ({ request }) => {
      const uniqueEmail = `testuser_${Date.now()}@example.com`;

      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Test User',
          email: uniqueEmail,
          password: 'Test123'
        }
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.token).toBeDefined();
      expect(body._id).toBeDefined();
      expect(body.email).toBe(uniqueEmail);
      expect(body.name).toBe('Test User');
      expect(body.password).toBeUndefined();
    });

    test('returns 409 for existing email', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Duplicate User',
          email: 'new@eventy.com', // Already exists
          password: 'Test123'
        }
      });

      expect(response.status()).toBe(409);
      const body = await response.json();
      expect(body.message).toMatch(/already exists/i);
    });

    test('returns 400 for missing name', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          email: `noname_${Date.now()}@test.com`,
          password: 'Test123'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors.some((e: any) => e.path === 'name')).toBe(true);
    });

    test('returns 400 for missing email', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'No Email User',
          password: 'Test123'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors.some((e: any) => e.path === 'email')).toBe(true);
    });

    test('returns 400 for missing password', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'No Password User',
          email: `nopass_${Date.now()}@test.com`
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors.some((e: any) => e.path === 'password')).toBe(true);
    });

    test('returns 400 for name too short', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'A', // Less than 2 chars
          email: `short_${Date.now()}@test.com`,
          password: 'Test123'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors.some((e: any) => e.path === 'name')).toBe(true);
    });

    test('returns 400 for invalid email format', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Bad Email User',
          email: 'notanemail',
          password: 'Test123'
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors.some((e: any) => e.path === 'email')).toBe(true);
    });

    test('returns 400 for password too short', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Short Pass User',
          email: `shortpass_${Date.now()}@test.com`,
          password: 'Ab1' // Less than 6 chars
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors.some((e: any) => e.path === 'password')).toBe(true);
    });

    test('returns 400 for password without number', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'No Number User',
          email: `nonumber_${Date.now()}@test.com`,
          password: 'abcdefgh' // No number
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors.some((e: any) => e.path === 'password')).toBe(true);
    });

    test('returns 400 for password without letter', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'No Letter User',
          email: `noletter_${Date.now()}@test.com`,
          password: '12345678' // No letter
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.errors.some((e: any) => e.path === 'password')).toBe(true);
    });

    test('returns 400 for empty request body', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/register`, {
        data: {}
      });

      expect(response.status()).toBe(400);
    });

    test('trims whitespace from name', async ({ request }) => {
      const uniqueEmail = `trimtest_${Date.now()}@example.com`;

      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: '  Trimmed Name  ',
          email: uniqueEmail,
          password: 'Test123'
        }
      });

      expect(response.status()).toBe(201);
      const body = await response.json();
      expect(body.name).toBe('Trimmed Name');
    });

  });

  // ==================== GET ME TESTS ====================

  test.describe('GET /auth/me', () => {

    test('returns user data with valid token', async ({ request }) => {
      // First login to get token
      const loginResponse = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'new@eventy.com',
          password: 'newAcc123'
        }
      });
      const { token } = await loginResponse.json();

      // Then get user data
      const response = await request.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body._id).toBeDefined();
      expect(body.email).toBe('new@eventy.com');
      expect(body.name).toBeDefined();
      expect(body.password).toBeUndefined();
    });

    test('returns 401 without token', async ({ request }) => {
      const response = await request.get(`${API_URL}/auth/me`);

      expect(response.status()).toBe(401);
    });

    test('returns 401 with invalid token', async ({ request }) => {
      const response = await request.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: 'Bearer invalidtoken123'
        }
      });

      expect(response.status()).toBe(401);
    });

    test('returns 401 with malformed Authorization header', async ({ request }) => {
      const response = await request.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: 'NotBearer token123'
        }
      });

      expect(response.status()).toBe(401);
    });

    test('returns 401 with expired/tampered JWT', async ({ request }) => {
      // Tampered JWT (invalid signature)
      const tamperedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE1MTYyMzkwMjJ9.invalidsignature';

      const response = await request.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tamperedToken}`
        }
      });

      expect(response.status()).toBe(401);
    });

    test('returns 401 with empty Bearer token', async ({ request }) => {
      const response = await request.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: 'Bearer '
        }
      });

      expect(response.status()).toBe(401);
    });

  });

  // ==================== INTEGRATION TESTS ====================

  test.describe('Auth Flow Integration', () => {

    test('register then login with same credentials works', async ({ request }) => {
      const uniqueEmail = `flow_${Date.now()}@example.com`;
      const password = 'FlowTest123';

      // Register
      const registerResponse = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Flow Test User',
          email: uniqueEmail,
          password
        }
      });
      expect(registerResponse.status()).toBe(201);

      // Login with same credentials
      const loginResponse = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: uniqueEmail,
          password
        }
      });
      expect(loginResponse.status()).toBe(200);

      const body = await loginResponse.json();
      expect(body.token).toBeDefined();
      expect(body.email).toBe(uniqueEmail);
    });

    test('register returns usable token for /me endpoint', async ({ request }) => {
      const uniqueEmail = `metest_${Date.now()}@example.com`;

      // Register and get token
      const registerResponse = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Me Test User',
          email: uniqueEmail,
          password: 'MeTest123'
        }
      });
      const { token } = await registerResponse.json();

      // Use token to access /me
      const meResponse = await request.get(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      expect(meResponse.status()).toBe(200);
      const body = await meResponse.json();
      expect(body.email).toBe(uniqueEmail);
    });

  });

  // ==================== SECURITY TESTS ====================

  test.describe('Auth Security', () => {

    test('password is never returned in any response', async ({ request }) => {
      const uniqueEmail = `security_${Date.now()}@example.com`;

      // Check register response
      const registerResponse = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: 'Security Test',
          email: uniqueEmail,
          password: 'Secure123'
        }
      });
      const registerBody = await registerResponse.json();
      expect(registerBody.password).toBeUndefined();
      expect(JSON.stringify(registerBody)).not.toContain('Secure123');

      // Check login response
      const loginResponse = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: uniqueEmail,
          password: 'Secure123'
        }
      });
      const loginBody = await loginResponse.json();
      expect(loginBody.password).toBeUndefined();

      // Check /me response
      const meResponse = await request.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${loginBody.token}` }
      });
      const meBody = await meResponse.json();
      expect(meBody.password).toBeUndefined();
    });

    test('error messages do not reveal if email exists (login)', async ({ request }) => {
      const wrongEmailResponse = await request.post(`${API_URL}/auth/login`, {
        data: { email: 'nonexistent@test.com', password: 'password' }
      });

      const wrongPasswordResponse = await request.post(`${API_URL}/auth/login`, {
        data: { email: 'new@eventy.com', password: 'wrongpassword' }
      });

      // Both should return same generic error (prevents email enumeration)
      const body1 = await wrongEmailResponse.json();
      const body2 = await wrongPasswordResponse.json();
      
      expect(body1.message).toBe(body2.message);
    });

    test('SQL/NoSQL injection in email is handled', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: "admin'--",
          password: 'password'
        }
      });

      // Should fail validation or return auth error, not crash
      expect([400, 401]).toContain(response.status());
    });

    test('very long input does not crash server', async ({ request }) => {
      const longString = 'a'.repeat(10000);

      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: longString,
          email: `long_${Date.now()}@test.com`,
          password: longString
        }
      });

      // Should return error, not crash
      expect([400, 413, 500]).toContain(response.status());
    });

  });

});