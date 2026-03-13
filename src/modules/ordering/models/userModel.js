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
    addresses: [
      {
        label: {
          type: String,
          trim: true,
          default: "Home",
        },

        shortAddress: {
          type: String,
          trim: true,
          uppercase: true,
          match: [
            /^[A-Z]{4}\d{4}$/,
            "Invalid Short Address (Example: RAGI2929)",
          ],
        },

        buildingNumber: {
          type: String,
          required: true,
          trim: true,
          match: [/^\d{4}$/, "Building number must be 4 digits"],
        },

        streetName: {
          type: String,
          required: true,
          trim: true,
        },

        district: {
          type: String,
          required: true,
          trim: true,
        },

        city: {
          type: String,
          required: true,
          trim: true,
        },

        region: {
          type: String,
          required: true,
          trim: true,
        },

        postalCode: {
          type: String,
          required: true,
          trim: true,
          match: [/^\d{5}$/, "Postal code must be 5 digits"],
        },

        secondaryNumber: {
          type: String,
          trim: true,
          match: [/^\d{4}$/, "Secondary number must be 4 digits"],
        },

        buildingName: {
          type: String,
          trim: true,
        },

        apartmentNumber: {
          type: String,
          trim: true,
        },

        floor: {
          type: String,
          trim: true,
        },

        landmark: {
          type: String,
          trim: true,
        },

        contactNumber: {
          type: String,
          required: true,
          match: [/^(\+966|05)\d{8}$/, "Invalid Saudi phone number"],
        },

        location: {
          type: {
            type: String,
            enum: ["Point"],
            default: "Point",
          },
          coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
          },
        },

        deliveryInstructions: {
          type: String,
          trim: true,
        },

        isDefault: {
          type: Boolean,
          default: false,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

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
