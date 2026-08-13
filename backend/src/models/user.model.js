import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: [true, "Username already exists"],
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: [true, "Account already exists with this email address"],
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Hide password by default so it is not returned accidentally.
    },
    refreshToken: {
      type: String,
      default: null, // Stores the current refresh token for rotation/logout.
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);
export default UserModel;