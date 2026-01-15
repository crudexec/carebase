import {
  cn,
  formatDate,
  formatDateTime,
  formatDuration,
  formatCurrency,
  capitalize,
  getInitials,
  truncate,
  generateId,
} from "./utils";

describe("cn (className utility)", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    const showBar = false;
    const showBaz = true;
    expect(cn("foo", showBar && "bar", "baz")).toBe("foo baz");
    expect(cn("foo", showBaz && "bar", "baz")).toBe("foo bar baz");
  });

  it("handles tailwind conflicts", () => {
    expect(cn("p-4", "p-2")).toBe("p-2");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles arrays", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });

  it("handles objects", () => {
    expect(cn({ foo: true, bar: false })).toBe("foo");
  });
});

describe("formatDate", () => {
  it("formats date correctly", () => {
    // Use explicit time to avoid timezone issues
    const date = new Date("2024-01-15T12:00:00");
    const formatted = formatDate(date);
    expect(formatted).toMatch(/Jan/);
    expect(formatted).toMatch(/2024/);
  });

  it("handles string input", () => {
    const formatted = formatDate("2024-01-15T12:00:00");
    expect(formatted).toMatch(/Jan/);
  });
});

describe("formatDateTime", () => {
  it("formats date and time correctly", () => {
    const date = new Date("2024-01-15T14:30:00");
    const formatted = formatDateTime(date);
    expect(formatted).toMatch(/Jan/);
    expect(formatted).toMatch(/15/);
    expect(formatted).toMatch(/2024/);
  });
});

describe("formatDuration", () => {
  it("formats whole hours", () => {
    expect(formatDuration(2)).toBe("2h");
    expect(formatDuration(8)).toBe("8h");
  });

  it("formats hours and minutes", () => {
    expect(formatDuration(2.5)).toBe("2h 30m");
    expect(formatDuration(1.25)).toBe("1h 15m");
  });

  it("formats minutes only", () => {
    expect(formatDuration(0.5)).toBe("30m");
    expect(formatDuration(0.25)).toBe("15m");
  });
});

describe("formatCurrency", () => {
  it("formats currency correctly", () => {
    expect(formatCurrency(100)).toBe("$100.00");
    expect(formatCurrency(1234.56)).toBe("$1,234.56");
    expect(formatCurrency(0)).toBe("$0.00");
  });
});

describe("capitalize", () => {
  it("capitalizes first letter", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("HELLO")).toBe("Hello");
    expect(capitalize("hELLO")).toBe("Hello");
  });

  it("handles single character", () => {
    expect(capitalize("a")).toBe("A");
  });

  it("handles empty string", () => {
    expect(capitalize("")).toBe("");
  });
});

describe("getInitials", () => {
  it("returns correct initials", () => {
    expect(getInitials("John", "Doe")).toBe("JD");
    expect(getInitials("jane", "smith")).toBe("JS");
  });
});

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("Hello World", 5)).toBe("Hello...");
  });

  it("does not truncate short strings", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("handles exact length", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });
});

describe("generateId", () => {
  it("generates unique IDs", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it("generates string IDs", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });
});
