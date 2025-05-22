const { Router } = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { AppDataSource } = require("../db/data-source");
const { User } = require("../models/entities");

const router = Router();

const userRepository = AppDataSource.getRepository(User);

router.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingUser = await userRepository.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = userRepository.create({
      username,
      password: hashedPassword,
    });

    const savedUser = await userRepository.save(newUser);

    const accessToken = generateAccessToken({ user: savedUser });
    const refreshToken = generateRefreshToken({ user: savedUser });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: savedUser,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await userRepository.findOne({ where: { username } });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const accessToken = generateAccessToken({ user });
    const refreshToken = generateRefreshToken({ user });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error during login" });
  }
});

router.get("/get-user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await userRepository.findOne({
      where: { id },
      select: ["id", "username", "role"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      user,
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/refresh-token", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const refreshToken = authHeader && authHeader.split(" ")[1];

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, user) => {
        if (err) {
          if (err.name === "TokenExpiredError") {
            return res.status(401).json({
              message: "Refresh token has expired. Please login again.",
              code: "REFRESH_TOKEN_EXPIRED",
            });
          }

          return res.status(403).json({
            message: "Invalid refresh token",
            code: "REFRESH_TOKEN_INVALID",
          });
        }

        const existingUser = await userRepository.findOne({
          where: { username: user.username },
        });

        if (!existingUser) {
          return res.status(403).json({ message: "User not found" });
        }

        const accessToken = generateAccessToken({
          user: existingUser,
        });
        const newRefreshToken = generateRefreshToken({
          user: existingUser,
        });

        res.status(200).json({
          accessToken,
          refreshToken: newRefreshToken,
          user: existingUser,
        });
      }
    );
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Server error during token refresh" });
  }
});

router.patch("/update-role/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const validRoles = ["Admin", "Manager", "Employee"];

    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: " invalid role",
      });
    }

    const existingUser = await userRepository.findOne({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await userRepository.update({ id }, { role });

    const updatedUser = await userRepository.findOne({
      where: { id },
      select: ["id", "username", "role"],
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        user: updatedUser,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

function generateAccessToken(user) {
  const { user: currentUser } = user;
  return jwt.sign(
    {
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

function generateRefreshToken(user) {
  const { user: currentUser } = user;
  return jwt.sign(
    {
      id: currentUser.id,
      username: currentUser.username,
      role: currentUser.role,
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "1d" }
  );
}

module.exports = router;
