const { Router } = require("express");
const { AppDataSource } = require("../db/data-source");
const { Software, Request } = require("../models/entities");

const router = Router();
const softwareRepository = AppDataSource.getRepository(Software);
const requestRepository = AppDataSource.getRepository(Request);
const { authenticateToken } = require("../middlewares/Authenticate");
const authorizeRole = require("../middlewares/Authorize");

router.post("/create-software", async (req, res) => {
  try {
    const { name, description, accessLevels } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Software name is required",
      });
    }

    if (accessLevels && !Array.isArray(accessLevels)) {
      return res.status(400).json({
        success: false,
        message: "Access levels must be an array",
      });
    }

    const existingSoftware = await softwareRepository.findOne({
      where: { name },
    });

    if (existingSoftware) {
      return res.status(409).json({
        success: false,
        message: "Software with this name already exists",
      });
    }

    const newSoftware = softwareRepository.create({
      name,
      description: description || "",
      accessLevels: accessLevels || ["Write", "Read", "Admin"],
    });

    const savedSoftware = await softwareRepository.save(newSoftware);

    return res.status(201).json({
      success: true,
      message: "Software created successfully",
      data: savedSoftware,
    });
  } catch (error) {
    console.error("Error creating software:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

router.post("/requests", authenticateToken, async (req, res) => {
  try {
    const { softwareId, reason, accessType } = req.body;
    const userId = req.user.id;

    if (!softwareId) {
      return res.status(400).json({
        success: false,
        message: "Software ID is required",
      });
    }

    if (!reason || reason.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
      });
    }

    if (!accessType) {
      return res.status(400).json({
        success: false,
        message: "Access type is required",
      });
    }

    const validAccessTypes = ["Read", "Write", "Admin"];
    if (!validAccessTypes.includes(accessType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid access type. Must be Read, Write, or Admin",
      });
    }

    const software = await softwareRepository.findOne({
      where: { id: softwareId },
    });
    if (!software) {
      return res.status(404).json({
        success: false,
        message: "Software not found",
      });
    }

    const approvedRequest = await requestRepository.findOne({
      where: {
        userId: userId,
        softwareId: softwareId,
        status: "Approved",
      },
    });

    if (approvedRequest) {
      const accessHierarchy = { Read: 1, Write: 2, Admin: 3 };
      const currentAccessLevel = accessHierarchy[approvedRequest.accessType];
      const requestedAccessLevel = accessHierarchy[accessType];

      if (currentAccessLevel >= requestedAccessLevel) {
        return res.status(409).json({
          success: false,
          message: `You already have ${approvedRequest.accessType} access to this software, which includes ${accessType} permissions`,
          currentAccess: {
            accessType: approvedRequest.accessType,
            status: approvedRequest.status,
          },
        });
      }
    }

    const pendingRequest = await requestRepository.findOne({
      where: {
        userId: userId,
        softwareId: softwareId,
        status: "Pending",
      },
    });

    if (pendingRequest) {
      return res.status(409).json({
        success: false,
        message:
          "You already have a pending request for this software. Please wait for it to be processed.",
        existingRequest: {
          id: pendingRequest.id,
          status: pendingRequest.status,
          accessType: pendingRequest.accessType,
          reason: pendingRequest.reason,
        },
      });
    }

    const newRequest = requestRepository.create({
      userId: userId,
      softwareId: softwareId,
      accessType: accessType,
      reason: reason.trim(),
      status: "Pending",
    });

    const savedRequest = await requestRepository.save(newRequest);

    res.status(201).json({
      success: true,
      message: "Request submitted successfully",
      request: {
        id: savedRequest.id,
        userId: savedRequest.userId,
        softwareId: savedRequest.softwareId,
        accessType: savedRequest.accessType,
        reason: savedRequest.reason,
        status: savedRequest.status,
      },
    });
  } catch (error) {
    console.error("Error creating software request:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/get-softwares", async (req, res) => {
  try {
    const allSoftware = await softwareRepository.find();

    return res.json({
      softwares: allSoftware,
    });
  } catch (error) {
    console.error("Error fetching software entries:", error);
    return res.status(500).json({
      message: "Failed to fetch software entries",
      error: error.message,
    });
  }
});

router.get("/get-requests/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const userRequests = await requestRepository.find({
      where: { userId: userId },
      relations: ["software"],
    });

    return res.json({
      requests: userRequests,
    });
  } catch (error) {
    console.error("Error fetching user requests:", error);
    return res.status(500).json({
      message: "Failed to fetch user requests",
      error: error.message,
    });
  }
});

router.get("/get-requests", async (req, res) => {
  try {
    const allRequests = await requestRepository.find({
      relations: ["software", "user"],
    });

    return res.json({
      requests: allRequests,
    });
  } catch (error) {
    console.error("Error fetching all requests:", error);
    return res.status(500).json({
      message: "Failed to fetch all requests",
      error: error.message,
    });
  }
});

router.patch(
  "/requests/:id",
  authenticateToken,
  authorizeRole("Manager"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Request ID is required",
        });
      }

      const validStatuses = ["Pending", "Approved", "Rejected"];
      if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message:
            "Valid status is required. Must be one of: Pending, Approved, Rejected",
        });
      }

      const existingRequest = await requestRepository.findOne({
        where: { id },
      });

      if (!existingRequest) {
        return res.status(404).json({
          success: false,
          message: "Request not found",
        });
      }

      await requestRepository.update({ id }, { status });

      const updatedRequest = await requestRepository.findOne({
        where: { id },
        relations: ["user", "software"],
      });

      return res.status(200).json({
        success: true,
        message: "Request status updated successfully",
        data: updatedRequest,
      });
    } catch (error) {
      console.error("Error updating request status:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
);

module.exports = router;
