// update user profile and get user profile controller functions
import User from "../models/userModel.js";

// Controller function to get user profile details
export const getUserProfile = async (req, res) => {
  // const userId = req.user.id; // Get user ID from authenticated user (set by auth middleware)
  // this is for testing purposes, remove auth middleware to access without authentication;
  // const name = "Mohd Noman";
  // const user = await User.findOne({ name }).select("-password -refreshTokens"); // Exclude password and refresh tokens from the response
  const user = {
    _id: {
      $oid: "69aab46db49d308df8f3b1c1",
    },
    name: "Mohd Noman",
    phone: {
      $numberLong: "9573751736",
    },
    terms: true,
    defaultLanguage: "en",
    isVerified: true,
    status: "active",
    createdAt: {
      $date: "2026-03-06T11:03:09.653Z",
    },
    updatedAt: {
      $date: "2026-03-06T11:21:55.620Z",
    },
    __v: 0,
    refreshTokens: {
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YWFiNDZkYjQ5ZDMwOGRmOGYzYjFjMSIsImlhdCI6MTc3Mjc5NjExNSwiZXhwIjoxNzczNDAwOTE1fQ.4rdlEkTQ9qa7V0E8s7ZX3D1MWhak7cOX0iBex5c0GIs",
      expiresAt: {
        $date: "2026-03-13T11:21:55.619Z",
      },
    },
    addresses: [
      {
        label: "Home",
        houseNumber: "12-4-56",
        buildingName: "Green Residency",
        street: "MG Road",
        landmark: "Near Metro Station",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        pincode: "500081",
        location: {
          type: "Point",
          coordinates: [78.3875, 17.4485],
        },
        deliveryInstructions: "Call before arrival",
        isDefault: true,
      },
      {
        label: "Work",
        houseNumber: "5th Floor",
        buildingName: "Cyber Towers",
        street: "Hitech City Road",
        landmark: "Opposite Inorbit Mall",
        city: "Hyderabad",
        state: "Telangana",
        country: "India",
        pincode: "500081",
        location: {
          type: "Point",
          coordinates: [78.383, 17.45],
        },
        deliveryInstructions: "Deliver at reception",
      },
    ],
  };
  
  console.log("User profile retrieved:", user);
  res.json(user);
};

// Controller function to update user profile personal details like name, phone, email
export const updateUserProfile = async (req, res) => {
  const userId = req.user.id; // Get user ID from authenticated user (set by auth middleware)

  const allowedFields = ["name", "phone", "email"]; // Define allowed fields for update
  const updatesFiled = {};

  allowedFields.forEach((field) => {
    if (req.body[field]) {
      updatesFiled[field] = req.body[field];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(userId, {
    $set: updatesFiled,
  });
  res.json({ message: "User profile updated successfully", user: updatedUser });
};

// controller function to get user address details
export const getUserAddress = async (req, res) => {
  const userId = req.user.id; // Get user ID from authenticated user (set by auth middleware)
  const user = await User.findById(userId).select("addresses"); // Find the user by ID and select only the addresses field
  res.json(user.addresses); // Return the user's addresses
};

// controller function to add new user address details
export const addUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      label,
      addressLine,
      city,
      state,
      country,
      latitude,
      longitude,
      isDefault,
    } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        addresses: {
          $not: {
            $elemMatch: { label: label },
          },
        },
      },
      {
        $push: {
          addresses: {
            label,
            addressLine,
            city,
            state,
            country,
            isDefault: isDefault || false,
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
          },
        },
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    // ❌ If null → label already exists OR user not found
    if (!updatedUser) {
      return res.status(400).json({
        message: "Address label already exists or user not found",
      });
    }

    res.status(201).json({
      message: "Address added successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// controller function to edit user address details
export const editUserAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    if (!addressId) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    const allowedFields = [
      "label",
      "addressLine",
      "city",
      "state",
      "country",
      "isDefault",
    ];

    const updateFields = {};

    // Only include provided fields
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateFields[`addresses.$.${field}`] = req.body[field];
      }
    });

    // Handle location update
    if (req.body.latitude !== undefined && req.body.longitude !== undefined) {
      updateFields["addresses.$.location"] = {
        type: "Point",
        coordinates: [req.body.longitude, req.body.latitude],
      };
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }

    // ⭐ Only unset others IF address exists
    const addressExists = await User.exists({
      _id: userId,
      "addresses._id": addressId,
    });

    if (!addressExists) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (req.body.isDefault === true) {
      await User.updateOne(
        { _id: userId },
        { $set: { "addresses.$[].isDefault": false } },
      );
    }

    const updatedUser = await User.findOneAndUpdate(
      {
        _id: userId,
        "addresses._id": addressId,
      },
      {
        $set: updateFields,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    res.status(200).json({
      message: "Address updated successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
