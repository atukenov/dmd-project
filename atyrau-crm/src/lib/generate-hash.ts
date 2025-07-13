import { compare, hash } from "bcryptjs";

// The password to check
const plainPassword = "password123";

// The hash from our mock data
const currentHash =
  "$2a$12$K6vvj0gxZtPFBrP3QXw9teNLJlY3.LO8NE6qiQmzJg9j9WpA4Bqm2";

// Test the hash and generate a new one
async function testAndGenerateHash() {
  try {
    console.log("Testing current hash...");
    const isValid = await compare(plainPassword, currentHash);
    console.log(
      `Current hash validation result: ${isValid ? "valid" : "invalid"}`
    );

    // Generate a new hash regardless of the result
    console.log("\nGenerating new hash...");
    const newHash = await hash(plainPassword, 12); // Use cost factor 12 (same as original)
    console.log("New hash:", newHash);

    // Verify new hash
    const isNewHashValid = await compare(plainPassword, newHash);
    console.log(`New hash validation: ${isNewHashValid ? "valid" : "invalid"}`);

    // Provide instructions
    console.log("\n-------------------------------------");
    console.log(
      "Copy the new hash above to update your mock data in src/lib/mock/data.ts"
    );
    console.log(
      "Replace the passwordHash value with this new hash for all mock users."
    );
    console.log("-------------------------------------");
  } catch (error) {
    console.error("Error:", error);
  }
}

testAndGenerateHash();

