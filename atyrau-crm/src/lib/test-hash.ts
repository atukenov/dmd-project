import { compare, hash } from "bcryptjs";

// The password to check
const plainPassword = "password123";

// The hash from our mock data
const hashedPassword =
  "$2a$12$K6vvj0gxZtPFBrP3QXw9teNLJlY3.LO8NE6qiQmzJg9j9WpA4Bqm2";

// Test the hash
async function testHash() {
  try {
    const isValid = await compare(plainPassword, hashedPassword);
    console.log(`Hash validation result: ${isValid ? "valid" : "invalid"}`);

    // Generate a new hash for comparison
    const newHash = await hash(plainPassword, 10);
    console.log("New hash generated:", newHash);

    const isNewHashValid = await compare(plainPassword, newHash);
    console.log(`New hash validation: ${isNewHashValid ? "valid" : "invalid"}`);
  } catch (error) {
    console.error("Error testing hash:", error);
  }
}

testHash();
