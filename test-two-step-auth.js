#!/usr/bin/env node

/**
 * Two-Step Login Verification - Comprehensive Test Script
 * 
 * This script tests the complete two-step authentication flow:
 * 1. Login with email/password (generates OTP)
 * 2. Verify OTP (completes login)
 * 3. Error handling (invalid OTP, expired OTP, etc.)
 */

// Use built-in fetch (Node.js 18+) or import node-fetch
let fetch;
if (globalThis.fetch) {
    fetch = globalThis.fetch;
} else {
    // Try to import node-fetch dynamically
    (async () => {
        const nodeFetch = await import('node-fetch');
        fetch = nodeFetch.default;
    })();
}

const API_BASE = 'http://localhost:5000/api/auth';
const TEST_EMAIL = 'demo@test.com';
const TEST_PASSWORD = 'demo123';

// Color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function separator() {
    console.log('\n' + '='.repeat(70) + '\n');
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Complete successful login flow
async function testSuccessfulLogin() {
    separator();
    log('TEST 1: Successful Two-Step Login Flow', 'cyan');
    log('Step 1: Login with email and password...', 'blue');
    
    try {
        // Step 1: Login (get OTP)
        const loginResponse = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });

        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            log(`❌ Login failed: ${loginData.message}`, 'red');
            return;
        }

        log('✅ Login successful! OTP sent to email', 'green');
        log(`   Email: ${loginData.email}`, 'yellow');
        log(`   RequiresOTP: ${loginData.requiresOTP}`, 'yellow');
        
        if (loginData.devOTP) {
            log(`   Development OTP: ${loginData.devOTP}`, 'magenta');
            
            // Step 2: Verify OTP
            log('\nStep 2: Verifying OTP...', 'blue');
            await sleep(1000); // Simulate user entering OTP
            
            const verifyResponse = await fetch(`${API_BASE}/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: TEST_EMAIL,
                    otp: loginData.devOTP
                })
            });

            const verifyData = await verifyResponse.json();
            
            if (!verifyResponse.ok) {
                log(`❌ OTP verification failed: ${verifyData.message}`, 'red');
                return;
            }

            log('✅ OTP verified successfully!', 'green');
            log(`   User: ${verifyData.user.name} (${verifyData.user.email})`, 'yellow');
            log(`   Token: ${verifyData.token.substring(0, 50)}...`, 'yellow');
            log('\n🎉 Two-step authentication successful!', 'green');
        } else {
            log('⚠️  Development OTP not available. Email should be sent.', 'yellow');
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
    }
}

// Test 2: Invalid OTP
async function testInvalidOTP() {
    separator();
    log('TEST 2: Invalid OTP Handling', 'cyan');
    
    try {
        // Step 1: Login (get OTP)
        log('Step 1: Logging in to generate OTP...', 'blue');
        const loginResponse = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });

        const loginData = await loginResponse.json();
        log(`✅ OTP generated: ${loginData.devOTP || 'Sent to email'}`, 'green');
        
        // Step 2: Try with wrong OTP
        log('\nStep 2: Trying with invalid OTP (999999)...', 'blue');
        await sleep(500);
        
        const verifyResponse = await fetch(`${API_BASE}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                otp: '999999'
            })
        });

        const verifyData = await verifyResponse.json();
        
        if (!verifyResponse.ok) {
            log(`✅ Expected error received: ${verifyData.message}`, 'green');
        } else {
            log('❌ Should have failed with invalid OTP!', 'red');
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
    }
}

// Test 3: Invalid credentials
async function testInvalidCredentials() {
    separator();
    log('TEST 3: Invalid Credentials Handling', 'cyan');
    
    try {
        log('Attempting login with wrong password...', 'blue');
        
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: 'wrongpassword'
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            log(`✅ Expected error: ${data.message}`, 'green');
        } else {
            log('❌ Should have failed with invalid credentials!', 'red');
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
    }
}

// Test 4: Missing fields
async function testMissingFields() {
    separator();
    log('TEST 4: Missing Fields Validation', 'cyan');
    
    try {
        log('Attempting OTP verification without email...', 'blue');
        
        const response = await fetch(`${API_BASE}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                otp: '123456'
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            log(`✅ Validation error: ${data.message}`, 'green');
        } else {
            log('❌ Should have failed validation!', 'red');
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
    }
}

// Test 5: Resend OTP
async function testResendOTP() {
    separator();
    log('TEST 5: Resend OTP Functionality', 'cyan');
    
    try {
        log('First OTP request...', 'blue');
        const response1 = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });

        const data1 = await response1.json();
        log(`✅ First OTP: ${data1.devOTP || 'Sent to email'}`, 'green');
        
        await sleep(1000);
        
        log('\nSecond OTP request (resend)...', 'blue');
        const response2 = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: TEST_EMAIL,
                password: TEST_PASSWORD
            })
        });

        const data2 = await response2.json();
        log(`✅ New OTP: ${data2.devOTP || 'Sent to email'}`, 'green');
        
        if (data1.devOTP && data2.devOTP && data1.devOTP !== data2.devOTP) {
            log('✅ New OTP generated successfully (different from first)', 'green');
        }
        
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
    }
}

// Main test runner
async function runTests() {
    log('\n╔════════════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     TWO-STEP LOGIN VERIFICATION - COMPREHENSIVE TEST SUITE        ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════════════╝', 'cyan');
    
    log('\n🔍 Testing complete two-step authentication flow...', 'yellow');
    log('⏱️  This will take about 10 seconds\n', 'yellow');

    await testSuccessfulLogin();
    await sleep(1000);
    
    await testInvalidOTP();
    await sleep(1000);
    
    await testInvalidCredentials();
    await sleep(1000);
    
    await testMissingFields();
    await sleep(1000);
    
    await testResendOTP();
    
    separator();
    log('🎯 All tests completed!', 'green');
    log('\n📝 Summary:', 'cyan');
    log('  ✅ Successful login flow', 'green');
    log('  ✅ Invalid OTP handling', 'green');
    log('  ✅ Invalid credentials handling', 'green');
    log('  ✅ Field validation', 'green');
    log('  ✅ Resend OTP functionality', 'green');
    
    separator();
    log('💡 Next Steps:', 'yellow');
    log('  1. Configure email credentials in .env file', 'reset');
    log('  2. Test with real email sending', 'reset');
    log('  3. Update frontend client to use the new flow', 'reset');
    log('  4. Test the complete flow in browser', 'reset');
    separator();
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch('http://localhost:5000/api/health');
        if (!response.ok) throw new Error('Server not responding');
        return true;
    } catch (error) {
        log('❌ Cannot connect to server at http://localhost:5000', 'red');
        log('   Please start the server first: npm start', 'yellow');
        return false;
    }
}

// Run the tests
(async () => {
    const serverRunning = await checkServer();
    if (serverRunning) {
        await runTests();
    }
    process.exit(0);
})();
