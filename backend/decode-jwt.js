// Quick JWT decoder to check project reference
const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeXVlcG9vcW5rd3l4bmpuY3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxNjY3NDQsImV4cCI6MjA3Mjc0Mjc0NH0.Vq71PYlP5x9KYYdPjCSmYUjp-5mCTaYhJAYdAeZXcNw';

// Decode base64 payload (middle part)
const payload = jwt.split('.')[1];
const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());

console.log('🔍 JWT Payload:', JSON.stringify(decoded, null, 2));
console.log('📍 Project Reference:', decoded.ref);
console.log('🌐 Expected URL:', `https://${decoded.ref}.supabase.co`);
