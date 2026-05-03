#!/usr/bin/env node

/**
 * BRUTAL HONEST TEST FOR PHASE 7 - Monetization & Business
 * This test checks what actually works and what doesn't
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 PHASE 7 BRUTAL HONEST TEST\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;
let warnings = 0;

function test(name, condition, severity = 'ERROR') {
  if (condition) {
    console.log(`✅ PASS: ${name}`);
    passed++;
  } else {
    if (severity === 'WARNING') {
      console.log(`⚠️  WARNING: ${name}`);
      warnings++;
    } else {
      console.log(`❌ FAIL: ${name}`);
      failed++;
    }
  }
}

// Test 1: File Existence
console.log('\n📁 FILE EXISTENCE TESTS:');
console.log('-'.repeat(60));

const backendDir = __dirname;
const frontendDir = path.join(__dirname, '..', 'frontend');

const requiredFiles = {
  backend: [
    'models/subscription.model.js',
    'models/payment.model.js',
    'models/marketplace.model.js',
    'services/monetization.service.js',
    'services/pay-per-use.service.js',
    'services/whitelabel.service.js',
    'routes/monetization.routes.js',
    'routes/pay-per-use.routes.js',
    'routes/admin-business.routes.js'
  ],
  frontend: [
    'src/pages/SubscriptionPage.jsx',
    'src/pages/BusinessDashboard.jsx',
    'src/pages/AdminBusinessDashboard.jsx'
  ]
};

for (const file of requiredFiles.backend) {
  test(`Backend: ${file}`, fs.existsSync(path.join(backendDir, file)));
}

for (const file of requiredFiles.frontend) {
  test(`Frontend: ${file}`, fs.existsSync(path.join(frontendDir, file)));
}

// Test 2: Model Syntax and Imports
console.log('\n📦 MODEL VALIDATION TESTS:');
console.log('-'.repeat(60));

const subscriptionModel = fs.readFileSync(path.join(backendDir, 'models/subscription.model.js'), 'utf8');
const paymentModel = fs.readFileSync(path.join(backendDir, 'models/payment.model.js'), 'utf8');
const marketplaceModel = fs.readFileSync(path.join(backendDir, 'models/marketplace.model.js'), 'utf8');

test('Subscription model has proper schema', subscriptionModel.includes('mongoose.Schema'));
test('Payment model has proper schema', paymentModel.includes('mongoose.Schema'));
test('Marketplace model has proper schema', marketplaceModel.includes('mongoose.Schema'));

// Test 3: Critical Dependencies
console.log('\n🔗 DEPENDENCY CHECKS:');
console.log('-'.repeat(60));

test('Subscription model references Clinic model', subscriptionModel.includes("ref: 'Clinic'"), 'WARNING');
test('Payment model references Clinic model', paymentModel.includes("ref: 'Clinic'"), 'WARNING');
test('Monetization service imports Clinic model', fs.readFileSync(path.join(backendDir, 'services/monetization.service.js'), 'utf8').includes("require('../models/clinic.model')"), 'WARNING');

// Test 4: Route Registration
console.log('\n⚠️  ROUTE REGISTRATION TESTS:');
console.log('-'.repeat(60));

const serverFile = fs.readFileSync(path.join(backendDir, 'server.js'), 'utf8');

test('Monetization routes registered in server.js', serverFile.includes('monetization'));
test('Pay-per-use routes registered in server.js', serverFile.includes('pay-per-use') || serverFile.includes('payPerUse'));
test('Admin business routes registered in server.js', serverFile.includes('admin-business') || serverFile.includes('adminBusiness'));

// Test 5: Service Implementation
console.log('\n🛠️  SERVICE IMPLEMENTATION TESTS:');
console.log('-'.repeat(60));

const monetizationService = fs.readFileSync(path.join(backendDir, 'services/monetization.service.js'), 'utf8');
const payPerUseService = fs.readFileSync(path.join(backendDir, 'services/pay-per-use.service.js'), 'utf8');
const whitelabelService = fs.readFileSync(path.join(backendDir, 'services/whitelabel.service.js'), 'utf8');

test('Monetization service has getPlans method', monetizationService.includes('getPlans'));
test('Monetization service has createSubscription method', monetizationService.includes('createSubscription'));
test('Monetization service has processPayment method', monetizationService.includes('processPayment'));

test('Pay-per-use service has getIAPricing method', payPerUseService.includes('getIAPricing'));
test('Pay-per-use service has calculateFeatureCost method', payPerUseService.includes('calculateFeatureCost'));
test('Pay-per-use service has processPayPerUse method', payPerUseService.includes('processPayPerUse'));

test('Whitelabel service has updateBranding method', whitelabelService.includes('updateBranding'));
test('Whitelabel service has generateWhiteLabelApp method', whitelabelService.includes('generateWhiteLabelApp'));

// Test 6: Route Implementation
console.log('\n🛣️  ROUTE IMPLEMENTATION TESTS:');
console.log('-'.repeat(60));

const monetizationRoutes = fs.readFileSync(path.join(backendDir, 'routes/monetization.routes.js'), 'utf8');
const payPerUseRoutes = fs.readFileSync(path.join(backendDir, 'routes/pay-per-use.routes.js'), 'utf8');
const adminBusinessRoutes = fs.readFileSync(path.join(backendDir, 'routes/admin-business.routes.js'), 'utf8');

test('Monetization routes has /plans endpoint', monetizationRoutes.includes("'/plans'"));
test('Monetization routes has /subscription endpoint', monetizationRoutes.includes("'/subscription'"));
test('Monetization routes has /billing endpoint', monetizationRoutes.includes("'/billing'"));

test('Pay-per-use routes has /features endpoint', payPerUseRoutes.includes("'/features'"));
test('Pay-per-use routes has /process endpoint', payPerUseRoutes.includes("'/process'"));
test('Pay-per-use routes has /balance endpoint', payPerUseRoutes.includes("'/balance'"));

test('Admin business routes has /metrics endpoint', adminBusinessRoutes.includes('/metrics') || adminBusinessRoutes.includes('/business/metrics'));
test('Admin business routes has /clients endpoint', adminBusinessRoutes.includes('/clients') || adminBusinessRoutes.includes('/business/clients'));

// Test 7: Frontend Components
console.log('\n⚛️  FRONTEND COMPONENT TESTS:');
console.log('-'.repeat(60));

const subscriptionPage = fs.readFileSync(path.join(frontendDir, 'src/pages/SubscriptionPage.jsx'), 'utf8');
const businessDashboard = fs.readFileSync(path.join(frontendDir, 'src/pages/BusinessDashboard.jsx'), 'utf8');
const adminBusinessDashboard = fs.readFileSync(path.join(frontendDir, 'src/pages/AdminBusinessDashboard.jsx'), 'utf8');

test('SubscriptionPage imports React', subscriptionPage.includes('import React'));
test('SubscriptionPage imports axios', subscriptionPage.includes('axios'));
test('BusinessDashboard imports Recharts', businessDashboard.includes('recharts'));
test('AdminBusinessDashboard imports Recharts', adminBusinessDashboard.includes('recharts'));

// Test 8: IA Features Pricing
console.log('\n🤖 IA FEATURES PRICING TESTS:');
console.log('-'.repeat(60));

test('Pay-per-use has demand_prediction pricing', payPerUseService.includes('demand_prediction'));
test('Pay-per-use has appointment_optimization pricing', payPerUseService.includes('appointment_optimization'));
test('Pay-per-use has chatbot_triage pricing', payPerUseService.includes('chatbot_triage') || payPerUseService.includes('chatbot'));
test('Pay-per-use has vision_analysis pricing', payPerUseService.includes('vision'));

// Test 9: Pricing Structure
console.log('\n💰 PRICING STRUCTURE TESTS:');
console.log('-'.repeat(60));

test('Free plan exists', monetizationService.includes('free:'));
test('Basic plan exists with correct price', monetizationService.includes('basic:') && monetizationService.includes('499000'));
test('Professional plan exists with correct price', monetizationService.includes('professional:') && monetizationService.includes('1299000'));
test('Enterprise plan exists with correct price', monetizationService.includes('enterprise:') && monetizationService.includes('2999000'));

// Test 10: Critical Issues Summary
console.log('\n🚨 CRITICAL ISSUES SUMMARY:');
console.log('-'.repeat(60));

const clinicModelExists = fs.existsSync(path.join(backendDir, 'models/clinic.model.js'));
test('❌ Clinic model exists (CRITICAL)', clinicModelExists);

const monetizationRoutesRegistered = serverFile.includes('monetization') || serverFile.includes('monetization.routes');
test('❌ Monetization routes registered (CRITICAL)', monetizationRoutesRegistered);

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 TEST SUMMARY:');
console.log('-'.repeat(60));
console.log(`✅ Passed: ${passed}`);
console.log(`⚠️  Warnings: ${warnings}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📈 Total: ${passed + warnings + failed}`);

if (failed === 0) {
  console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
} else {
  console.log('\n❌ CRITICAL ISSUES FOUND - SEE ABOVE');
}

// Detailed Issues
if (!clinicModelExists || !monetizationRoutesRegistered) {
  console.log('\n🔧 REQUIRED FIXES:');
  console.log('-'.repeat(60));

  if (!clinicModelExists) {
    console.log('1. Create Clinic model (models/clinic.model.js)');
    console.log('   - Required by subscription and payment models');
  }

  if (!monetizationRoutesRegistered) {
    console.log('2. Register monetization routes in server.js:');
    console.log('   - const monetizationRoutes = require(\'./routes/monetization.routes\');');
    console.log('   - const payPerUseRoutes = require(\'./routes/pay-per-use.routes\');');
    console.log('   - const adminBusinessRoutes = require(\'./routes/admin-business.routes\');');
    console.log('   - app.use(\'/api/monetization\', monetizationRoutes);');
    console.log('   - app.use(\'/api/pay-per-use\', payPerUseRoutes);');
    console.log('   - app.use(\'/api/admin/business\', adminBusinessRoutes);');
  }
}

console.log('\n' + '='.repeat(60));

process.exit(failed > 0 ? 1 : 0);