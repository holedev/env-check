import { fireEvent, render, screen } from "@testing-library/react";
import { ToolIcon } from "@/components/custom/Tools/ToolIcon";

test("loads the icon straight from simpleicons, bypassing /_next/image", () => {
  render(<ToolIcon icon='mongodb' name='MongoDB' size={24} />);

  const img = screen.getByRole("img", { name: "MongoDB" });
  expect(img).toHaveAttribute("src", "https://cdn.simpleicons.org/mongodb");
  expect(img).toHaveAttribute("width", "24");
  expect(img.className).toContain("dark:invert");
});

test("shows a letter tile when the tool has no simpleicons slug", () => {
  render(<ToolIcon name='OpenAI' size={32} />);

  const tile = screen.getByRole("img", { name: "OpenAI" });
  expect(tile.tagName).toBe("SPAN");
  expect(tile).toHaveTextContent("O");
});

test("falls back to the letter tile when the CDN request fails", () => {
  render(<ToolIcon icon='gone' name='Slack' size={16} />);

  fireEvent.error(screen.getByRole("img", { name: "Slack" }));

  expect(screen.getByRole("img", { name: "Slack" })).toHaveTextContent("S");
});

test("decorative icons are hidden from assistive tech", () => {
  const { container } = render(<ToolIcon decorative name='Slack' size={16} />);

  expect(screen.queryByRole("img")).not.toBeInTheDocument();
  expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
});
