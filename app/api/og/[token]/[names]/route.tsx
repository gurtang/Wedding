import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const size = { width: 1200, height: 630 };

function displayNames(value: string) {
  return value.trim().replace(/\s+i\s+/i, " & ") || "Pozivnica za venčanje";
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string; names: string }> },
) {
  const { names: rawNames } = await params;
  const names = displayNames(rawNames);
  const fontSize = names.length > 28 ? 48 : names.length > 22 ? 54 : 62;

  const background = await readFile(join(process.cwd(), "public", "images", "wedding-og-v4.jpg"));
  const backgroundUrl = `data:image/jpeg;base64,${background.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: "#fbf8f1",
        }}
      >
        <img
          src={backgroundUrl}
          width={size.width}
          height={size.height}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <div
          style={{
            position: "absolute",
            left: 330,
            top: 382,
            display: "flex",
            width: 540,
            height: 88,
            alignItems: "center",
            justifyContent: "center",
            background: "#fcfaf5",
            color: "#111111",
            fontFamily: "serif",
            fontSize,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          {names}
        </div>
      </div>
    ),
    size,
  );
}
