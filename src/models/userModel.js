import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    terms: {
      type: Boolean,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
    },

    // password: {
    //   type: String,
    //   required: true,
    //   minlength: 6,
    // },
    defaultLanguage: {
      type: String,
      enum: ["en", "ar"],
      default: "en",
    },
    otp: {
      code: String,
      expiresAt: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "blocked"],
      default: "active",
    },

    // Array of addresses for the user
    // addresses: [
    //   {
    //     label: {
    //       type: String,
    //       enum: ["Home", "Work", "Other"],
    //       default: "Home",
    //     },

    //     addressLine: {
    //       type: String,
    //       required: true,
    //     },

    //     city: {
    //       type: String,
    //       required: true,
    //     },

    //     state: {
    //       type: String,
    //       required: true,
    //     },

    //     country: {
    //       type: String,
    //       required: true,
    //     },

    //     location: {
    //       type: {
    //         type: String,
    //         enum: ["Point"],
    //         default: "Point",
    //       },
    //       coordinates: {
    //         type: [Number], // [longitude, latitude]
    //         required: true,
    //       },
    //     },

    //     isDefault: {
    //       type: Boolean,
    //       default: false,
    //     },

    //     createdAt: {
    //       type: Date,
    //       default: Date.now,
    //     },
    //   },
    // ],

    // // cart field to store user's cart items
    // cart: [
    //   {
    //     restaurantId: {
    //       type: mongoose.Schema.Types.ObjectId,
    //       ref: "Restaurant",
    //       required: true,
    //     },

    //     items: [
    //       {
    //         foodId: {
    //           type: mongoose.Schema.Types.ObjectId,
    //           ref: "Food",
    //           required: true,
    //         },

    //         name: {
    //           type: String,
    //           required: true,
    //         },

    //         price: {
    //           type: Number,
    //           required: true,
    //         },

    //         quantity: {
    //           type: Number,
    //           required: true,
    //           min: 1,
    //         },

    //         isVeg: {
    //           type: Boolean,
    //           default: true,
    //         },
    //       },
    //     ],

    //     updatedAt: {
    //       type: Date,
    //       default: Date.now,
    //     },
    //   },
    // ],

    // Array to store refresh tokens for the user
    refreshTokens: {
      token: {
        type: String,
      },
      expiresAt: {
        type: Date,
      },
    },
  },

  { timestamps: true },
);

// userSchema.pre("save", async function () {
//   if (!this.isModified("password")) return; // Only hash if password is new or modified
//   const salt = await bcrypt.genSalt(12); // Generate salt with 12 rounds
//   this.password = await bcrypt.hash(this.password, salt); // Hash the password with the generated salt
// });

// userSchema.methods.comparePassword = function (password) {
//   return bcrypt.compare(password, this.password); // Compare the provided password with the hashed password in the database
// };

export default mongoose.model("User", userSchema);
