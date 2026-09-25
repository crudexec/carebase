import { offerBodyToEditorHtml, sanitizeOfferHtml } from "@/lib/offer-letters/html";

describe("offer letter HTML", () => {
  it("keeps supported formatting while dropping executable content and attributes", () => {
    expect(sanitizeOfferHtml('<p onclick="run()">Hello <strong>there</strong><script>alert(1)</script></p>'))
      .toBe("<p>Hello <strong>there</strong></p>");
  });

  it("keeps safe links and strips unsafe link targets", () => {
    expect(sanitizeOfferHtml('<a href="https://example.com" onclick="run()">Safe</a><a href="javascript:alert(1)">Unsafe</a>'))
      .toBe('<a href="https://example.com">Safe</a><a>Unsafe</a>');
  });

  it("converts legacy plain text into paragraphs without treating text as markup", () => {
    expect(offerBodyToEditorHtml("Hello <candidate>\n\nWelcome"))
      .toBe("<p>Hello &lt;candidate&gt;</p><p>Welcome</p>");
  });
});
