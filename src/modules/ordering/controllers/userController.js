// update user profile and get user profile controller functions
import mongoose from "mongoose";
import User from "../models/userModel.js";

// Controller function to get user profile details
export const getUserProfile = async (req, res) => {
  // const userId = req.user.id; // Get user ID from authenticated user (set by auth middleware)
  // this is for testing purposes, remove auth middleware to access without authentication;
  const name = "Mohd Noman";
  const user = await User.findOne({ name }).select("-password -refreshTokens"); // Exclude password and refresh tokens from the response
  // const user = {
  //   _id: {
  //     $oid: "69aab46db49d308df8f3b1c1",
  //   },
  //   name: "Mohd Noman",
  //   phone: {
  //     $numberLong: "9573751736",
  //   },
  //   terms: true,
  //   defaultLanguage: "en",
  //   isVerified: true,
  //   status: "active",
  //   createdAt: {
  //     $date: "2026-03-06T11:03:09.653Z",
  //   },
  //   updatedAt: {
  //     $date: "2026-03-06T11:21:55.620Z",
  //   },
  //   __v: 0,
  //   refreshTokens: {
  //     token:
  //       "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YWFiNDZkYjQ5ZDMwOGRmOGYzYjFjMSIsImlhdCI6MTc3Mjc5NjExNSwiZXhwIjoxNzczNDAwOTE1fQ.4rdlEkTQ9qa7V0E8s7ZX3D1MWhak7cOX0iBex5c0GIs",
  //     expiresAt: {
  //       $date: "2026-03-13T11:21:55.619Z",
  //     },
  //   },
  //   addresses: [
  //     {
  //       label: "Home",
  //       shortAddress: "RAGI2929",
  //       buildingNumber: "4821",
  //       streetName: "King Fahd Road",
  //       district: "Al Olaya",
  //       city: "Riyadh",
  //       region: "Riyadh",
  //       postalCode: "12211",
  //       secondaryNumber: "7643",
  //       buildingName: "Al Fahd Tower",
  //       apartmentNumber: "1203",
  //       floor: "12",
  //       landmark: "Near Kingdom Centre",
  //       contactNumber: "+966501234567",
  //       location: {
  //         type: "Point",
  //         coordinates: [46.6753, 24.7136],
  //       },
  //       deliveryInstructions: "Call before arrival",
  //       isDefault: true,
  //     },
  //     {
  //       label: "Work",
  //       shortAddress: "MADI4832",
  //       buildingNumber: "1934",
  //       streetName: "Prince Mohammed Bin Abdulaziz Street",
  //       district: "Al Rawdah",
  //       city: "Jeddah",
  //       region: "Makkah",
  //       postalCode: "23432",
  //       secondaryNumber: "5512",
  //       buildingName: "Business Gate",
  //       apartmentNumber: "305",
  //       floor: "3",
  //       landmark: "Opposite Red Sea Mall",
  //       contactNumber: "0551234567",
  //       location: {
  //         type: "Point",
  //         coordinates: [39.1925, 21.5433],
  //       },
  //       deliveryInstructions: "Deliver to reception",
  //       isDefault: false,
  //     },
  //     {
  //       label: "Other",
  //       shortAddress: "FADI7744",
  //       buildingNumber: "6612",
  //       streetName: "Prince Sultan Road",
  //       district: "Al Shati",
  //       city: "Jeddah",
  //       region: "Makkah",
  //       postalCode: "23513",
  //       secondaryNumber: "9921",
  //       buildingName: "Sea View Residence",
  //       apartmentNumber: "502",
  //       floor: "5",
  //       landmark: "Near Corniche Beach",
  //       contactNumber: "+966541234567",
  //       location: {
  //         type: "Point",
  //         coordinates: [39.1047, 21.543],
  //       },
  //       deliveryInstructions: "Leave with security if unavailable",
  //       isDefault: false,
  //     },
  //   ],
  // };

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
    // const userId = req.user.id;
    const userId = "69aab46db49d308df8f3b1c1"; // This is for testing purposes, remove auth middleware to access without authentication;

    const {
      label,
      shortAddress,
      buildingNumber,
      streetName,
      district,
      city,
      region,
      postalCode,
      secondaryNumber,
      buildingName,
      apartmentNumber,
      floor,
      landmark,
      latitude = 0,
      longitude = 0,
      deliveryInstructions,
      isDefault,
    } = req.body;

    // If this address is set as default, unset other default addresses
    if (isDefault === true) {
      await User.updateOne(
        { _id: userId },
        { $set: { "addresses.$[].isDefault": false } },
      );
    }

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
            shortAddress,
            buildingNumber,
            streetName,
            district,
            city,
            region,
            postalCode,
            secondaryNumber,
            buildingName,
            apartmentNumber,
            floor,
            landmark,
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            deliveryInstructions,
            isDefault: isDefault || false,
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
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.status(400).json({
        message: "Address label already exists",
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
    const userId = '69aab46db49d308df8f3b1c1'; // This is for testing purposes, remove auth middleware to access without authentication;
    // const userId = req.user.id; // Get user ID from authenticated user (set by auth middleware)
    const { addressId } = req.params;

    if (!addressId) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid Address ID" });
    }

    console.log("Data is sending to edit address with ID:", addressId, req.body);
    // ⭐ Only unset others IF address exists
    const addressExists = await User.exists({
      _id: userId,
      "addresses._id": addressId,
    });

    if (!addressExists) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Check for duplicate label if label is being updated
    if (req.body.label) {
      const labelExists = await User.exists({
        _id: userId,
        addresses: {
          $elemMatch: {
            label: req.body.label,
            _id: { $ne: new mongoose.Types.ObjectId(addressId) },
          },
        },
      });
      if (labelExists) {
        return res.status(400).json({ message: "Address label already exists" });
      }
    }


    const allowedFields = [
      "label",
      "shortAddress",
      "buildingNumber",
      "streetName",
      "district",
      "city",
      "region",
      "postalCode",
      "secondaryNumber",
      "buildingName",
      "apartmentNumber",
      "floor",
      "landmark",
      "deliveryInstructions",
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
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
};

// controller function to delete user address details
export const deleteUserAddress = async (req, res) => {
  try {
    const userId = "69aab46db49d308df8f3b1c1"; // This is for testing purposes, remove auth middleware to access without authentication;
    // const userId = req.user.id; // Get user ID from authenticated user (set by auth middleware)
    const { addressId } = req.params;

    console.log(addressId, "is the address ID to be deleted");

    if (!addressId) {
      return res.status(400).json({ message: "Address ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({ message: "Invalid Address ID" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { addresses: { _id: addressId } },
      },
      {
        returnDocument: "after",
      }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Address deleted successfully",
      addresses: updatedUser.addresses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
