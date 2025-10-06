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
const DEFAULT_DRINKS_MENU = "defaults/default-drinks-menu.png";

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

      const menuType = req.body.menuType; // 'lunch', 'dinner', or 'drinks'
      console.log("Uploading menu type:", menuType);

      // Validate menu type
      if (!['lunch', 'dinner', 'drinks'].includes(menuType)) {
        return res.status(400).json({ error: "Invalid menu type. Must be 'lunch', 'dinner', or 'drinks'" });
      }

      // Create timestamp for unique filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `${menuType}-${timestamp}.jpg`;
      const storageRef = ref(storage, `menus/${fileName}`);

      console.log("Uploading to path:", `menus/${fileName}`);

      await uploadBytes(storageRef, fileBuffer);
      const downloadURL = await getDownloadURL(storageRef);

      console.log("File uploaded successfully, URL:", downloadURL);

      res.json({
        message: "File uploaded successfully",
        url: downloadURL,
        fileName: fileName,
        menuType: menuType,
        uploadedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

// Get menu URLs - Updated to return data in new format
app.get("/menus", async (req, res) => {
  try {
    console.log("Fetching menu URLs...");

    // Function to safely get URLs with fallback
    async function getMenuURLs(menuType, defaultPath) {
      try {
        // Try to get the latest uploaded menu first
        const mainPath = `menus/${menuType}-menu.jpg`;
        return await getDownloadURL(ref(storage, mainPath));
      } catch (error) {
        console.log(`Failed to get ${menuType} menu, trying default...`);
        try {
          return await getDownloadURL(ref(storage, defaultPath));
        } catch (defaultError) {
          console.log(`No default ${menuType} menu found`);
          return null;
        }
      }
    }

    // Get URLs for all menu types
    const [lunchURL, dinnerURL, drinksURL] = await Promise.all([
      getMenuURLs("lunch", DEFAULT_LUNCH_MENU),
      getMenuURLs("dinner", DEFAULT_DINNER_MENU),
      getMenuURLs("drinks", DEFAULT_DRINKS_MENU),
    ]);

    console.log("URLs retrieved:", { lunchURL, dinnerURL, drinksURL });

    // Return data in the new format expected by the frontend
    const response = {};
    
    if (lunchURL) {
      response.lunch = [{
        url: lunchURL,
        uploadedAt: new Date().toISOString(),
        name: "lunch-menu.jpg"
      }];
    } else {
      response.lunch = [];
    }
    
    if (dinnerURL) {
      response.dinner = [{
        url: dinnerURL,
        uploadedAt: new Date().toISOString(),
        name: "dinner-menu.jpg"
      }];
    } else {
      response.dinner = [];
    }
    
    if (drinksURL) {
      response.drinks = [{
        url: drinksURL,
        uploadedAt: new Date().toISOString(),
        name: "drinks-menu.jpg"
      }];
    } else {
      response.drinks = [];
    }

    res.set("Cache-Control", "no-store");
    res.json(response);
  } catch (error) {
    console.error("Error in /menus endpoint:", error);
    res.status(500).json({
      error: error.message,
      details: "Failed to retrieve menu images",
      lunch: [],
      dinner: [],
      drinks: []
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
      drinks: await getDownloadURL(ref(storage, DEFAULT_DRINKS_MENU)),
    });
  } catch (error) {
    console.error("Reset error:", error);
    res.status(500).json({ error: "Failed to reset menus: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
