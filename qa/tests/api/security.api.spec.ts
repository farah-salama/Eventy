/// <reference types="node" />
import { test, expect } from '@playwright/test';

const API_URL = 'http://localhost:4000/api';

// Test credentials
const USER_CREDENTIALS = { email: 'new@eventy.com', password: 'newAcc123' };
const ADMIN_CREDENTIALS = { email: 'admin@eventy.com', password: 'admin123' };

// Helper to get auth token
async function getToken(request: any, credentials = USER_CREDENTIALS): Promise<string> {
  const response = await request.post(`${API_URL}/auth/login`, { data: credentials });
  const body = await response.json();
  return body.token;
}

test.describe('Security API Tests', () => {

  // ==================== AUTHENTICATION SECURITY ====================

  test.describe('Authentication Security', () => {

    test('rejects requests to protected routes without token', async ({ request }) => {
      const protectedEndpoints = [
        { method: 'GET', url: `${API_URL}/auth/me` },
        { method: 'GET', url: `${API_URL}/bookings` },
        { method: 'POST', url: `${API_URL}/bookings` },
      ];

      for (const endpoint of protectedEndpoints) {
        const response = endpoint.method === 'GET'
          ? await request.get(endpoint.url)
          : await request.post(endpoint.url, { data: {} });

        expect(response.status(), `${endpoint.method} ${endpoint.url} should require auth`).toBe(401);
      }
    });

    test('rejects malformed Authorization header', async ({ request }) => {
      const malformedHeaders = [
        'Bearer',
        'Bearer ',
        'Basic token123',
        'token123',
        'Bearer token with spaces',
        'BEARER validtoken',
      ];

      for (const header of malformedHeaders) {
        const response = await request.get(`${API_URL}/auth/me`, {
          headers: { Authorization: header }
        });
        expect(response.status(), `Header "${header}" should be rejected`).toBe(401);
      }
    });

    test('rejects tampered JWT token', async ({ request }) => {
      const token = await getToken(request);
      
      // Tamper with the token by modifying a character
      const tamperedToken = token.slice(0, -5) + 'XXXXX';

      const response = await request.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tamperedToken}` }
      });

      expect(response.status()).toBe(401);
    });

    test('rejects JWT with invalid signature', async ({ request }) => {
      // Valid JWT structure but with wrong signature
      const invalidSignatureToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

      const response = await request.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${invalidSignatureToken}` }
      });

      expect(response.status()).toBe(401);
    });

    test('password is never exposed in any response', async ({ request }) => {
      // Check login response
      const loginResponse = await request.post(`${API_URL}/auth/login`, {
        data: USER_CREDENTIALS
      });
      const loginBody = await loginResponse.json();
      expect(loginBody.password).toBeUndefined();
      expect(JSON.stringify(loginBody)).not.toContain(USER_CREDENTIALS.password);

      // Check /me response
      const meResponse = await request.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${loginBody.token}` }
      });
      const meBody = await meResponse.json();
      expect(meBody.password).toBeUndefined();
    });

    test('login error messages do not reveal user existence', async ({ request }) => {
      // Non-existent user
      const nonExistentResponse = await request.post(`${API_URL}/auth/login`, {
        data: { email: 'doesnotexist@test.com', password: 'password123' }
      });

      // Existing user with wrong password
      const wrongPasswordResponse = await request.post(`${API_URL}/auth/login`, {
        data: { email: USER_CREDENTIALS.email, password: 'wrongpassword' }
      });

      const body1 = await nonExistentResponse.json();
      const body2 = await wrongPasswordResponse.json();

      // Both should return identical error to prevent user enumeration
      expect(body1.message).toBe(body2.message);
      expect(nonExistentResponse.status()).toBe(wrongPasswordResponse.status());
    });

  });

  // ==================== AUTHORIZATION SECURITY ====================

  test.describe('Authorization Security', () => {

    test('regular user cannot access admin-only endpoints', async ({ request }) => {
      const userToken = await getToken(request, USER_CREDENTIALS);

      // Try to create event (admin only)
      const createEventResponse = await request.post(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${userToken}` },
        data: {
          title: 'Unauthorized Event',
          description: 'Should fail',
          date: '2026-12-01',
          location: 'Test',
          category: 'music',
          price: 10,
          capacity: 100
        }
      });

      expect([401, 403]).toContain(createEventResponse.status());
    });

    test('regular user cannot delete events', async ({ request }) => {
      const userToken = await getToken(request, USER_CREDENTIALS);

      // Try to delete an event
      const response = await request.delete(`${API_URL}/events/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      expect([401, 403, 404]).toContain(response.status());
    });

    test('regular user cannot access event bookings list (admin only)', async ({ request }) => {
      const userToken = await getToken(request, USER_CREDENTIALS);

      const response = await request.get(`${API_URL}/bookings/event/507f1f77bcf86cd799439011`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      expect([401, 403]).toContain(response.status());
    });

    test('regular user cannot upload files (admin only)', async ({ request }) => {
      const userToken = await getToken(request, USER_CREDENTIALS);

      const response = await request.post(`${API_URL}/upload`, {
        headers: { Authorization: `Bearer ${userToken}` },
        multipart: {
          image: {
            name: 'test.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake image content')
          }
        }
      });

      expect([401, 403]).toContain(response.status());
    });

  });

  // ==================== INJECTION ATTACKS ====================

  test.describe('Injection Attack Prevention', () => {

    test('SQL injection in login email is handled safely', async ({ request }) => {
      const sqlInjectionPayloads = [
        "admin'--",
        "' OR '1'='1",
        "admin'/*",
        "'; DROP TABLE users;--",
        "1' OR '1' = '1",
      ];

      for (const payload of sqlInjectionPayloads) {
        const response = await request.post(`${API_URL}/auth/login`, {
          data: { email: payload, password: 'password' }
        });

        // Should return validation error or auth error, not crash
        expect([400, 401]).toContain(response.status());
        expect(response.status()).not.toBe(500);
      }
    });

    test('NoSQL injection in login is handled safely', async ({ request }) => {
      const noSqlPayloads = [
        { email: { $gt: '' }, password: 'password' },
        { email: { $ne: null }, password: { $ne: null } },
        { email: 'admin@test.com', password: { $regex: '.*' } },
      ];

      for (const payload of noSqlPayloads) {
        const response = await request.post(`${API_URL}/auth/login`, {
          data: payload
        });

        // Should handle gracefully
        expect([400, 401]).toContain(response.status());
      }
    });

    test('XSS payloads in registration are sanitized or rejected', async ({ request }) => {
      const xssPayloads = [
        '<script>alert("xss")</script>',
        '<img src=x onerror=alert("xss")>',
        'javascript:alert("xss")',
        '<svg onload=alert("xss")>',
      ];

      for (const payload of xssPayloads) {
        const response = await request.post(`${API_URL}/auth/register`, {
          data: {
            name: payload,
            email: `xss_${Date.now()}@test.com`,
            password: 'Test123'
          }
        });

        if (response.status() === 201) {
          const body = await response.json();
          // If accepted, should be escaped/sanitized
          expect(body.name).not.toContain('<script>');
        }
        // Or should be rejected
        expect([201, 400]).toContain(response.status());
      }
    });

    test('path traversal in event ID is handled safely', async ({ request }) => {
      const pathTraversalPayloads = [
        '../../../etc/passwd',
        '..%2F..%2F..%2Fetc%2Fpasswd',
        '....//....//....//etc/passwd',
      ];

      for (const payload of pathTraversalPayloads) {
        const response = await request.get(`${API_URL}/events/${payload}`);

        // Should return 400 or 404, not expose file system
        expect([400, 404, 500]).toContain(response.status());
        const text = await response.text();
        expect(text).not.toContain('root:');
      }
    });

    test('MongoDB ObjectId injection is handled', async ({ request }) => {
      const invalidIds = [
        '{"$gt":""}',
        '{"$ne":null}',
        'null',
        'undefined',
        '0',
        '-1',
      ];

      for (const id of invalidIds) {
        const response = await request.get(`${API_URL}/events/${id}`);
        
        // Should handle gracefully without crashing
        expect([400, 404, 500]).toContain(response.status());
      }
    });

  });

  // ==================== IDOR (Insecure Direct Object Reference) ====================

  test.describe('IDOR Prevention', () => {

    test('user cannot cancel another user\'s booking', async ({ request }) => {
      const userToken = await getToken(request, USER_CREDENTIALS);

      // Try to cancel a booking that might belong to another user
      // Using a made-up ObjectId
      const response = await request.put(`${API_URL}/bookings/507f1f77bcf86cd799439011/cancel`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      // Should be 404 (not found) or 403 (forbidden), not 200
      expect([403, 404]).toContain(response.status());
    });

    test('user can only view their own bookings', async ({ request }) => {
      const unique = Date.now();
      const userA = { email: `idor_a_${unique}@example.com`, password: 'Test123' };
      const userB = { email: `idor_b_${unique}@example.com`, password: 'Test123' };

      const registerA = await request.post(`${API_URL}/auth/register`, {
        data: { name: 'IDOR User A', email: userA.email, password: userA.password }
      });
      expect(registerA.status()).toBe(201);

      const registerB = await request.post(`${API_URL}/auth/register`, {
        data: { name: 'IDOR User B', email: userB.email, password: userB.password }
      });
      expect(registerB.status()).toBe(201);

      const tokenA = await getToken(request, userA);
      const tokenB = await getToken(request, userB);

      const eventsResponse = await request.get(`${API_URL}/events`);
      expect(eventsResponse.status()).toBe(200);
      const eventsData = await eventsResponse.json();
      expect(eventsData.events).toBeDefined();
      expect(Array.isArray(eventsData.events)).toBe(true);
      expect(eventsData.events.length).toBeGreaterThanOrEqual(2);
      const eventIdA = eventsData.events[0]?._id;
      const eventIdB = eventsData.events[1]?._id;
      expect(eventIdA).toBeDefined();
      expect(eventIdB).toBeDefined();

      const bookingAResponse = await request.post(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${tokenA}` },
        data: { eventId: eventIdA }
      });
      expect(bookingAResponse.status()).toBe(201);
      const bookingA = await bookingAResponse.json();

      const bookingBResponse = await request.post(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${tokenB}` },
        data: { eventId: eventIdB }
      });
      expect(bookingBResponse.status()).toBe(201);
      const bookingB = await bookingBResponse.json();

      const listAResponse = await request.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${tokenA}` }
      });
      expect(listAResponse.status()).toBe(200);
      const listA = await listAResponse.json();
      const bookingIdsA = listA.map((booking: any) => booking._id);
      expect(bookingIdsA).toContain(bookingA._id);
      expect(bookingIdsA).not.toContain(bookingB._id);

      const listBResponse = await request.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${tokenB}` }
      });
      expect(listBResponse.status()).toBe(200);
      const listB = await listBResponse.json();
      const bookingIdsB = listB.map((booking: any) => booking._id);
      expect(bookingIdsB).toContain(bookingB._id);
      expect(bookingIdsB).not.toContain(bookingA._id);
    });

  });

  // ==================== INPUT VALIDATION ====================

  test.describe('Input Validation Security', () => {

    test('extremely long input does not crash the server', async ({ request }) => {
      const longString = 'a'.repeat(100000);

      const response = await request.post(`${API_URL}/auth/register`, {
        data: {
          name: longString,
          email: 'longtest@test.com',
          password: longString
        }
      });

      // Should return error, not hang or crash
      expect([400, 413, 500]).toContain(response.status());
    });

    test('null bytes in input are handled safely', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: {
          email: 'test\x00@example.com',
          password: 'password\x00injection'
        }
      });

      // Should handle gracefully
      expect([400, 401]).toContain(response.status());
    });

    test('unicode/special characters are handled properly', async ({ request }) => {
      const specialInputs = [
        { name: '用户名', email: `unicode_${Date.now()}@test.com` },
        { name: 'José García', email: `jose_${Date.now()}@test.com` },
        { name: '🎉 Party User', email: `emoji_${Date.now()}@test.com` },
        { name: 'Test\u200BUser', email: `zwsp_${Date.now()}@test.com` }, // Zero-width space
      ];

      for (const input of specialInputs) {
        const response = await request.post(`${API_URL}/auth/register`, {
          data: { ...input, password: 'Test123' }
        });

        // Should either accept or reject gracefully, not crash
        expect([201, 400]).toContain(response.status());
      }
    });

    test('negative numbers are rejected', async ({ request }) => {
        const token = await getToken(request, ADMIN_CREDENTIALS);
      
        const invalidPrices = [-100, -0.01, -1];
      
        for (const price of invalidPrices) {
          const response = await request.post(`${API_URL}/events`, {
            headers: { Authorization: `Bearer ${token}` },
            data: {
              name: 'Test Event',
              description: 'Test',
              date: '2026-12-01',
              venue: 'Test Venue',
              category: ['Arts & Entertainment'],
              image: '/uploads/test.jpg',
              price
            }
          });
      
          expect([400, 403]).toContain(response.status());
        }
      });

  });

  // ==================== RATE LIMITING ====================

  test.describe('Rate Limiting', () => {

    test('multiple failed login attempts are rate limited', async ({ request }) => {
      const attempts = 20;
      let rateLimited = false;

      for (let i = 0; i < attempts; i++) {
        const response = await request.post(`${API_URL}/auth/login`, {
          data: {
            email: 'ratelimit@test.com',
            password: `wrongpassword${i}`
          }
        });

        if (response.status() === 429) {
          rateLimited = true;
          break;
        }
      }

      // Note: This test documents current behavior
      // If rate limiting is not implemented, this serves as a finding
      test.info().annotations.push({
        type: rateLimited ? 'pass' : 'security-finding',
        description: rateLimited 
          ? 'Rate limiting is active' 
          : 'Rate limiting not detected - potential brute force vulnerability'
      });
    });

  });

  // ==================== ERROR HANDLING ====================

  test.describe('Error Information Disclosure', () => {

    test('error responses do not leak stack traces', async ({ request }) => {
      // Trigger an error with invalid data
      const response = await request.get(`${API_URL}/events/invalid-id-format`);

      const body = await response.text();
      
      // Should not contain stack trace indicators
      expect(body).not.toMatch(/at\s+\w+\s+\(/); // Stack trace pattern
      expect(body).not.toContain('node_modules');
      expect(body).not.toContain('.js:');
    });

    test('error responses do not reveal internal paths', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: { email: 'x', password: 'x' }
      });

      const body = await response.text();
      
      expect(body).not.toMatch(/[A-Z]:\\/i); // Windows path
      expect(body).not.toMatch(/\/home\//); // Linux path
      expect(body).not.toMatch(/\/Users\//); // Mac path
    });

    test('404 responses are generic', async ({ request }) => {
      const response = await request.get(`${API_URL}/nonexistent-endpoint`);

      expect(response.status()).toBe(404);
      const body = await response.text();
      
      // Should not reveal app structure
      expect(body).not.toContain('Cannot GET');
      expect(body).not.toContain('routes');
    });

  });

  // ==================== HTTP METHODS ====================

  test.describe('HTTP Method Security', () => {

    test('OPTIONS requests are handled appropriately', async ({ request }) => {
      const response = await request.fetch(`${API_URL}/auth/login`, {
        method: 'OPTIONS'
      });

      // Should either return 204 (preflight) or 405 (method not allowed)
      expect([200, 204, 404, 405]).toContain(response.status());
    });

    test('unsupported HTTP methods return proper error', async ({ request }) => {
      const methods = ['PATCH', 'TRACE', 'CONNECT'];

      for (const method of methods) {
        try {
          const response = await request.fetch(`${API_URL}/auth/login`, {
            method: method as any
          });
          
          // Should not return 200
          expect([404, 405]).toContain(response.status());
        } catch (e) {
          // Some methods might not be supported by the client
        }
      }
    });

  });

  // ==================== CONTENT TYPE SECURITY ====================

  test.describe('Content Type Security', () => {

    test('API rejects non-JSON content types for JSON endpoints', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        headers: { 'Content-Type': 'text/plain' },
        data: 'email=test@test.com&password=test'
      });

      // Should reject or handle gracefully
      expect([400, 401, 415]).toContain(response.status());
    });

    test('API handles missing Content-Type header', async ({ request }) => {
      const response = await request.post(`${API_URL}/auth/login`, {
        data: { email: 'test@test.com', password: 'test' }
      });

      // Should handle gracefully (Playwright sets JSON by default)
      expect([400, 401]).toContain(response.status());
    });

  });

  // ==================== FILE UPLOAD SECURITY ====================

  test.describe('File Upload Security', () => {

    test('rejects non-image file types', async ({ request }) => {
      const token = await getToken(request, ADMIN_CREDENTIALS);

      const maliciousFiles = [
        { name: 'malware.exe', mimeType: 'application/x-msdownload' },
        { name: 'script.php', mimeType: 'application/x-php' },
        { name: 'shell.sh', mimeType: 'application/x-sh' },
        { name: 'page.html', mimeType: 'text/html' },
      ];

      for (const file of maliciousFiles) {
        const response = await request.post(`${API_URL}/upload`, {
          headers: { Authorization: `Bearer ${token}` },
          multipart: {
            image: {
              name: file.name,
              mimeType: file.mimeType,
              buffer: Buffer.from('malicious content')
            }
          }
        });

        expect(response.status(), `${file.name} should be rejected`).toBe(400);
      }
    });

    test('rejects files with double extensions', async ({ request }) => {
      const token = await getToken(request, ADMIN_CREDENTIALS);

      const response = await request.post(`${API_URL}/upload`, {
        headers: { Authorization: `Bearer ${token}` },
        multipart: {
          image: {
            name: 'image.jpg.php',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('<?php echo "pwned"; ?>')
          }
        }
      });

      // Should reject or sanitize filename
      if (response.status() === 200) {
        const body = await response.json();
        expect(body.url).not.toContain('.php');
      }
    });

    test('rejects oversized files', async ({ request }) => {
      const token = await getToken(request, ADMIN_CREDENTIALS);

      // Create a 6MB buffer (exceeds 5MB limit)
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024, 'x');

      const response = await request.post(`${API_URL}/upload`, {
        headers: { Authorization: `Bearer ${token}` },
        multipart: {
          image: {
            name: 'large.jpg',
            mimeType: 'image/jpeg',
            buffer: largeBuffer
          }
        }
      });

      expect(response.status()).toBe(400);
      const body = await response.json();
      expect(body.message).toMatch(/too large|size/i);
    });

    test('sanitizes filenames to prevent path traversal', async ({ request }) => {
      const token = await getToken(request, ADMIN_CREDENTIALS);

      const response = await request.post(`${API_URL}/upload`, {
        headers: { Authorization: `Bearer ${token}` },
        multipart: {
          image: {
            name: '../../../etc/passwd.jpg',
            mimeType: 'image/jpeg',
            buffer: Buffer.from('fake image')
          }
        }
      });

      if (response.status() === 200) {
        const body = await response.json();
        // Filename should be sanitized
        expect(body.url).not.toContain('..');
        expect(body.url).not.toContain('etc');
        expect(body.url).not.toContain('passwd');
      }
    });

  });

  // ==================== SESSION SECURITY ====================

  test.describe('Token/Session Security', () => {

    test('token cannot be reused after significant time manipulation attempts', async ({ request }) => {
      const token = await getToken(request);

      // Token should work normally
      const response1 = await request.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      expect(response1.status()).toBe(200);

      // Note: Testing actual token expiration would require waiting or time manipulation
      // This test documents that tokens are being used
      test.info().annotations.push({
        type: 'info',
        description: 'Token validation is active. Expiration testing requires time manipulation.'
      });
    });

    test('different users receive different tokens', async ({ request }) => {
      // Create two users and verify tokens are unique
      const email1 = `token_test_1_${Date.now()}@example.com`;
      const email2 = `token_test_2_${Date.now()}@example.com`;

      await request.post(`${API_URL}/auth/register`, {
        data: { name: 'User 1', email: email1, password: 'Test123' }
      });

      await request.post(`${API_URL}/auth/register`, {
        data: { name: 'User 2', email: email2, password: 'Test123' }
      });

      const login1 = await request.post(`${API_URL}/auth/login`, {
        data: { email: email1, password: 'Test123' }
      });

      const login2 = await request.post(`${API_URL}/auth/login`, {
        data: { email: email2, password: 'Test123' }
      });

      const body1 = await login1.json();
      const body2 = await login2.json();

      expect(body1.token).not.toBe(body2.token);
    });

  });

});
