import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import pool from "@/lib/db";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUri = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: "cocoir/profiles",
      public_id: `profile_${session.userId}`,
      overwrite: true, // replaces old profile picture automatically
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" }, // auto crop to face
      ],
    });

    const pictureUrl = uploadResult.secure_url;

    // Save Cloudinary URL to database
    await pool.query(
      "UPDATE users SET profile_picture = ? WHERE id = ?",
      [pictureUrl, session.userId]
    );

    return NextResponse.json({
      success: true,
      message: "Profile picture updated successfully",
      profilePicture: pictureUrl,
    });

  } catch (error) {
    console.error("Upload profile picture error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}