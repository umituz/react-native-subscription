/**
 * Package Type Detector Tests
 * Test various product ID patterns
 */

import { detectPackageType } from "./packageTypeDetector";
import { PACKAGE_TYPE } from "../domains/subscription/core/SubscriptionConstants";

// Test common product ID patterns
const testCases = [
  // Standard patterns
  { id: "com.umituz.aibabyfacepredictor.weekly", expected: PACKAGE_TYPE.WEEKLY },
  { id: "com.umituz.aibabyfacepredictor.monthly", expected: PACKAGE_TYPE.MONTHLY },
  { id: "com.umituz.aibabyfacepredictor.yearly", expected: PACKAGE_TYPE.YEARLY },

  // Test store patterns
  { id: "com.umituz.aibabyfacepredictor.test.weekly", expected: PACKAGE_TYPE.WEEKLY },
  { id: "com.umituz.aibabyfacepredictor.test.monthly", expected: PACKAGE_TYPE.MONTHLY },
  { id: "com.umituz.aibabyfacepredictor.test.yearly", expected: PACKAGE_TYPE.YEARLY },

  // Alternative naming
  { id: "weekly_subscription", expected: PACKAGE_TYPE.WEEKLY },
  { id: "monthly_subscription", expected: PACKAGE_TYPE.MONTHLY },
  { id: "annual_subscription", expected: PACKAGE_TYPE.YEARLY },

  // Edge cases
  { id: "week_pass", expected: PACKAGE_TYPE.WEEKLY },
  { id: "month_pass", expected: PACKAGE_TYPE.MONTHLY },
  { id: "year_pass", expected: PACKAGE_TYPE.YEARLY },

  // Should NOT match
  { id: "credit_package", expected: PACKAGE_TYPE.UNKNOWN },
  { id: "random_product", expected: PACKAGE_TYPE.UNKNOWN },
];

console.log("=== Package Type Detector Tests ===\n");

let passed = 0;
let failed = 0;

testCases.forEach(({ id, expected }) => {
  const result = detectPackageType(id);
  const isPass = result === expected;

  if (isPass) {
    passed++;
    console.log(`✅ PASS: "${id}" → ${result}`);
  } else {
    failed++;
    console.log(`❌ FAIL: "${id}" → ${result} (expected: ${expected})`);
  }
});

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

// Test actual RevenueCat product IDs (if available)
console.log("\n=== Test Your Actual Product IDs ===");
console.log("Add your actual product IDs below to test:\n");

const yourProductIds = [
  // Add your actual product IDs here
  // "com.yourapp.yourproduct.weekly",
];

if (yourProductIds.length > 0) {
  yourProductIds.forEach(id => {
    const result = detectPackageType(id);
    console.log(`Product: "${id}" → Detected as: ${result}`);
  });
}
