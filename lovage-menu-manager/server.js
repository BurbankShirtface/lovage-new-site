require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const { storage } = require("./firebase-config");
const {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
} = require("firebase/storage");
const heicConvert = require("heic-convert");
const app = express();
const port = process.env.PORT || 3000;

// Add these constants at the top of your file
const DEFAULT_LUNCH_MENU = "defaults/default-lunch-menu.png";
const DEFAULT_DINNER_MENU = "defaults/default-dinner-menu.png";

// Basic authentication middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.setHeader("WWW-Authenticate", "Basic");
    return res.status(401).send("Authentication required");
  }

  try {
    const auth = Buffer.from(authHeader.split(" ")[1], "base64")
      .toString()
      .split(":");
    const username = auth[0];
    const password = auth[1];

    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      next();
    } else {
      res.setHeader("WWW-Authenticate", "Basic");
      res.status(401).send("Invalid credentials");
    }
  } catch (error) {
    res.setHeader("WWW-Authenticate", "Basic");
    res.status(401).send("Invalid authentication format");
  }
};

// Configure multer for memory storage (renamed from 'storage' to 'multerStorage')
const multerStorage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  console.log("Uploaded file type:", file.mimetype);

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "application/pdf",
    "image/webp",
    "image/tiff",
    "text/plain",
    "image/heic-sequence",
    "application/octet-stream",
  ];

  if (
    allowedTypes.includes(file.mimetype) ||
    file.originalname.toLowerCase().endsWith(".heic")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, HEIC, HEIF, WebP, TIFF, PDF, and TXT files are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Important: Place authentication before static files
app.use("/uploader.html", authenticate);
app.use("/upload", authenticate);

// Serve static files
app.use(express.static(__dirname));

// Handle file upload
app.post(
  "/upload",
  authenticate,
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      let fileBuffer = req.file.buffer;

      // Convert HEIC to JPEG if it's a HEIC file
      if (req.file.originalname.toLowerCase().endsWith(".heic")) {
        console.log("Converting HEIC to JPEG...");
        try {
          fileBuffer = await heicConvert({
            buffer: req.file.buffer,
            format: "JPEG",
            quality: 0.9,
          });
          console.log("HEIC conversion successful");
        } catch (conversionError) {
          console.error("HEIC conversion error:", conversionError);
          return res
            .status(500)
            .json({ error: "Failed to convert HEIC image" });
        }
      }

      const menuType = req.body.menuType; // 'lunch' or 'dinner'
      console.log("Uploading menu type:", menuType);

      // Ensure the filename matches what we're looking for in the /menus endpoint
      const fileName = `${menuType}-menu.jpg`;
      const storageRef = ref(storage, `menus/${fileName}`);

      console.log("Uploading to path:", `menus/${fileName}`);

      await uploadBytes(storageRef, fileBuffer);
      const downloadURL = await getDownloadURL(storageRef);

      console.log("File uploaded successfully, URL:", downloadURL);

      res.json({
        message: "File uploaded successfully",
        url: downloadURL,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get menu URLs
app.get("/menus", async (req, res) => {
  try {
    console.log("Fetching menu URLs...");

    // Function to safely get URL with fallback
    async function getMenuURL(mainPath, defaultPath) {
      try {
        return await getDownloadURL(ref(storage, mainPath));
      } catch (error) {
        console.log(`Failed to get ${mainPath}, trying default...`);
        return await getDownloadURL(ref(storage, defaultPath));
      }
    }

    const [lunchURL, dinnerURL] = await Promise.all([
      getMenuURL("menus/lunch-menu.jpg", "defaults/default-lunch-menu.png"),
      getMenuURL("menus/dinner-menu.jpg", "defaults/default-dinner-menu.png"),
    ]);

    console.log("URLs retrieved:", { lunchURL, dinnerURL });

    res.json({
      lunch: lunchURL,
      dinner: dinnerURL,
    });
  } catch (error) {
    console.error("Error in /menus endpoint:", error);
    res.status(500).json({
      error: error.message,
      details: "Failed to retrieve both regular and default menu images",
    });
  }
});

// Add this new endpoint
app.post("/reset-menus", authenticate, async (req, res) => {
  try {
    // Get reference to menus folder
    const menusRef = ref(storage, "menus");

    // List all files in menus folder
    const menusList = await listAll(menusRef);

    // Delete all files in menus folder
    const deletePromises = menusList.items.map((fileRef) => {
      console.log(`Deleting ${fileRef.fullPath}`);
      return deleteObject(fileRef);
    });

    // Wait for all deletions to complete
    await Promise.all(deletePromises);

    console.log("All menu files deleted");

    res.json({
      message: "Menus reset to defaults successfully",
      lunch: await getDownloadURL(ref(storage, DEFAULT_LUNCH_MENU)),
      dinner: await getDownloadURL(ref(storage, DEFAULT_DINNER_MENU)),
    });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ error: "Failed to reset menus: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
