import { ImageResponse } from "next/og";
export const dynamic = "force-static";
export function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", background: "#101827", color: "#ffffff", padding: 80 }}>
      <div style={{ display: "flex", color: "#a7f3d0", fontSize: 42, marginBottom: 30 }}>Heya</div>
      <div style={{ display: "flex", fontSize: 76, fontWeight: 700 }}>Free stock photos</div>
      <div style={{ display: "flex", fontSize: 76, fontWeight: 700 }}>&amp; videos.</div>
      <div style={{ display: "flex", fontSize: 28, marginTop: 35 }}>Creative content for everyone.</div>
    </div>, { width: 1200, height: 630 }
  );
}
