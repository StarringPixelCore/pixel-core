import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import pool from "@/lib/db";

function getSessionUser(req) {
  const sessionCookie = req.cookies.get("session");
  if (!sessionCookie) return null;
  return JSON.parse(sessionCookie.value);
}

export async function POST(req) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only image files (JPEG, PNG, GIF, WebP) are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Create filename with timestamp
    const timestamp = Date.now();
    const extension = file.name.split(".").pop();
    const filename = `profile_${session.userId}_${timestamp}.${extension}`;
    
    // Save to public/uploads directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadDir, { recursive: true });
    
    const filepath = path.join(uploadDir, filename);
    const buffer = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(buffer));

    // Save filename to database
    const picturePath = `/uploads/profiles/${filename}`;
    await pool.query(
      "UPDATE users SET profile_picture = ? WHERE id = ?",
      [picturePath, session.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: picturePath,
    });
  } catch (error) {
    console.error("Upload profile picture error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}
