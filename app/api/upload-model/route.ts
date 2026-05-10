import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const objFile = formData.get("objFile") as File | null;
    const mtlFile = formData.get("mtlFile") as File | null;
    const rawSlug = (formData.get("slug") as string | null) ?? "model";

    if (!objFile || !mtlFile) {
      return NextResponse.json(
        { error: "Both an OBJ file and an MTL file are required." },
        { status: 400 }
      );
    }

    // Sanitise folder name: only a-z, 0-9, hyphens and underscores
    const slug = rawSlug
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "");

    const dir = join(process.cwd(), "public", "models", slug);
    mkdirSync(dir, { recursive: true });

    const objBuffer = Buffer.from(await objFile.arrayBuffer());
    const mtlBuffer = Buffer.from(await mtlFile.arrayBuffer());

    const objName = objFile.name;
    const mtlName = mtlFile.name;

    writeFileSync(join(dir, objName), objBuffer);
    writeFileSync(join(dir, mtlName), mtlBuffer);

    return NextResponse.json({
      objPath: `/models/${slug}/${objName}`,
      mtlPath: `/models/${slug}/${mtlName}`,
    });
  } catch (err) {
    console.error("[upload-model]", err);
    return NextResponse.json(
      { error: "Upload failed. Check server logs." },
      { status: 500 }
    );
  }
}
