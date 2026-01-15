import { validatePassword } from "@/lib/password";

describe("validatePassword", () => {
  it("returns valid for a strong password", () => {
    const result = validatePassword("Password123!");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for password shorter than 8 characters", () => {
    const result = validatePassword("Pass1!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must be at least 8 characters long");
  });

  it("returns error for password without uppercase", () => {
    const result = validatePassword("password123!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one uppercase letter");
  });

  it("returns error for password without lowercase", () => {
    const result = validatePassword("PASSWORD123!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one lowercase letter");
  });

  it("returns error for password without number", () => {
    const result = validatePassword("Password!");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one number");
  });

  it("returns error for password without special character", () => {
    const result = validatePassword("Password123");
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Password must contain at least one special character");
  });

  it("returns multiple errors for very weak password", () => {
    const result = validatePassword("weak");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
  });

  it("accepts various special characters", () => {
    const specialChars = ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", ",", ".", "?", '"', ":", "{", "}", "|", "<", ">"];

    specialChars.forEach((char) => {
      const result = validatePassword(`Password123${char}`);
      expect(result.valid).toBe(true);
    });
  });

  it("handles edge case of empty string", () => {
    const result = validatePassword("");
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles edge case of exactly 8 characters", () => {
    const result = validatePassword("Pass12!@");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
