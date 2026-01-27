/* global require, console, process */
/* eslint-disable @typescript-eslint/no-require-imports */
const axios = require("axios");

async function testAuth() {
  try {
    console.log("Testing authentication...\n");

    // 1. Login
    console.log("Step 1: Logging in...");
    const loginResponse = await axios.post(
      "http://localhost:3000/api/auth/login",
      {
        email: "admin_1767547983726@demo.com",
        password: "DemoAdmin@2024",
      },
    );

    console.log("Login successful!");
    console.log("Response:", loginResponse.data);

    // Extract cookies from the response headers
    const cookies = loginResponse.headers["set-cookie"];
    console.log("\nCookies received:", cookies);

    // 2. Test /api/user/me endpoint
    console.log("\nStep 2: Testing /api/user/me endpoint...");
    const cookieString = cookies ? cookies.join("; ") : "";

    const meResponse = await axios.get("http://localhost:3000/api/user/me", {
      headers: {
        Cookie: cookieString,
      },
    });

    console.log("User data received:");
    console.log(JSON.stringify(meResponse.data, null, 2));

    // Check the role
    if (meResponse.data && meResponse.data.data) {
      console.log("\n=== User Details ===");
      console.log("Email:", meResponse.data.data.email);
      console.log(
        "Name:",
        meResponse.data.data.firstName,
        meResponse.data.data.lastName,
      );
      console.log("Role:", meResponse.data.data.role);
      console.log("Provider ID:", meResponse.data.data.providerId);
      console.log("====================\n");

      if (!meResponse.data.data.role) {
        console.log("⚠️  WARNING: User has no role assigned!");
      } else {
        console.log("✅ User has role:", meResponse.data.data.role);
      }
    }
  } catch (error) {
    console.error("Error during testing:", error.message);
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
  }
}

testAuth();
