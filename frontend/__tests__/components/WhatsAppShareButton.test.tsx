import { render, screen, fireEvent } from "@testing-library/react";
import WhatsAppShareButton, {
  buildWhatsAppShareMessage,
  buildWhatsAppShareUrl,
} from "@/components/WhatsAppShareButton";

describe("buildWhatsAppShareMessage", () => {
  it("includes the context when provided", () => {
    const message = buildWhatsAppShareMessage({
      title: "TNPSC Group 4 General Science — Full Pack",
      context: "Er. Thangamuthu",
      url: "https://mcqpalagu.in/experts/er-thangamuthu/tnpsc-group-4-general-science",
    });
    expect(message).toBe(
      'Check out "TNPSC Group 4 General Science — Full Pack" by Er. Thangamuthu on MCQ Palagu: https://mcqpalagu.in/experts/er-thangamuthu/tnpsc-group-4-general-science'
    );
  });

  it("omits the context when not provided", () => {
    const message = buildWhatsAppShareMessage({
      title: "TNPSC Study Materials",
      url: "https://mcqpalagu.in/tnpsc-study-materials",
    });
    expect(message).toBe('Check out "TNPSC Study Materials" on MCQ Palagu: https://mcqpalagu.in/tnpsc-study-materials');
  });
});

describe("buildWhatsAppShareUrl", () => {
  it("builds a wa.me link with the message URL-encoded", () => {
    const shareUrl = buildWhatsAppShareUrl({
      title: "Pack",
      context: "Creator",
      url: "https://mcqpalagu.in/pack",
    });
    expect(shareUrl).toBe(
      "https://wa.me/?text=" + encodeURIComponent('Check out "Pack" by Creator on MCQ Palagu: https://mcqpalagu.in/pack')
    );
  });
});

describe("WhatsAppShareButton", () => {
  it("renders an accessible button", () => {
    render(<WhatsAppShareButton title="Pack" context="Creator" />);
    expect(screen.getByRole("button", { name: "Share on WhatsApp" })).toBeInTheDocument();
  });

  it("opens a wa.me link for the current page on click", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<WhatsAppShareButton title="Pack" context="Creator" />);
    fireEvent.click(screen.getByRole("button", { name: "Share on WhatsApp" }));
    expect(openSpy).toHaveBeenCalledWith(
      buildWhatsAppShareUrl({ title: "Pack", context: "Creator", url: window.location.href }),
      "_blank",
      "noopener,noreferrer"
    );
    openSpy.mockRestore();
  });
});
