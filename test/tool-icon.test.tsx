import { render, screen } from "@testing-library/react";
import { ToolIcon } from "@/components/custom/Tools/ToolIcon";

test("loads the icon straight from simpleicons, bypassing /_next/image", () => {
  render(<ToolIcon alt='MongoDB' icon='mongodb' size={24} />);

  const img = screen.getByRole("img", { name: "MongoDB" });
  expect(img).toHaveAttribute("src", "https://cdn.simpleicons.org/mongodb");
  expect(img).toHaveAttribute("width", "24");
  expect(img.className).toContain("dark:invert");
});
