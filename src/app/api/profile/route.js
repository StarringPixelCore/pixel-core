import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { sendAccountDeletionEmail } from "@/lib/email";
import { validatePasswordChange, validateAddress, validateMobileNumber, validateFirstName, validateLastName } from "@/lib/validation";

// Check if user is authenticated
function getSessionUser(req) {
  const sessionCookie = req.cookies.get("session");
  if (!sessionCookie) return null;
  return JSON.parse(sessionCookie.value);
}

// GET - Get user profile
export async function GET(req) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [users] = await pool.query(
      "SELECT id, first_name, last_name, email, address, mobile_number, role, profile_picture, created_at FROM users WHERE id = ?",
      [session.userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        address: user.address,
        mobileNumber: user.mobile_number,
        role: user.role,
        profilePicture: user.profile_picture,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

// PUT - Update user profile (only Buyers and Sellers can edit info)
export async function PUT(req) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { firstName, lastName, address, mobileNumber } = body;

    const errors = {};

    // Validate fields
    if (firstName !== undefined) {
      errors.firstName = validateFirstName(firstName);
    }
    if (lastName !== undefined) {
      errors.lastName = validateLastName(lastName);
    }
    if (address !== undefined) {
      errors.address = validateAddress(address);
    }
    if (mobileNumber !== undefined) {
      errors.mobileNumber = validateMobileNumber(mobileNumber);
    }

    Object.keys(errors).forEach((key) => !errors[key] && delete errors[key]);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // Update user
    const updateFields = [];
    const updateValues = [];

    if (firstName) {
      updateFields.push("first_name = ?");
      updateValues.push(firstName);
    }
    if (lastName) {
      updateFields.push("last_name = ?");
      updateValues.push(lastName);
    }
    if (address) {
      updateFields.push("address = ?");
      updateValues.push(address);
    }
    if (mobileNumber) {
      updateFields.push("mobile_number = ?");
      updateValues.push(mobileNumber);
    }

    updateValues.push(session.userId);

    await pool.query(
      `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    return NextResponse.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

// POST - Change password
export async function POST(req) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, oldPassword, newPassword, confirmPassword } = body;

    if (action === "change-password") {
      // Validate inputs
      const errors = validatePasswordChange(oldPassword, newPassword, confirmPassword);

      if (Object.keys(errors).length > 0) {
        return NextResponse.json({ errors }, { status: 400 });
      }

      // Get user's current password
      const [users] = await pool.query(
        "SELECT password FROM users WHERE id = ?",
        [session.userId]
      );

      if (users.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify old password
      const isPasswordValid = await bcrypt.compare(oldPassword, users[0].password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { errors: { oldPassword: "Current password is incorrect" } },
          { status: 401 }
        );
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await pool.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        session.userId,
      ]);

      return NextResponse.json({ message: "Password changed successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}

// DELETE - Delete account (only for Buyers, not Sellers)
export async function DELETE(req) {
  try {
    const session = getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user role
    const [users] = await pool.query(
      "SELECT role, email FROM users WHERE id = ?",
      [session.userId]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Only Buyers can delete their account (not Sellers)
    if (user.role === "Seller") {
      return NextResponse.json(
        { error: "Sellers cannot delete their account" },
        { status: 403 }
      );
    }

    // Send deletion confirmation email
    await sendAccountDeletionEmail(user.email);

    // Delete user (cascade will handle cart and orders)
    await pool.query("DELETE FROM users WHERE id = ?", [session.userId]);

    // Clear session cookie
    const response = NextResponse.json({ message: "Account deleted successfully" });

    response.cookies.set("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}
