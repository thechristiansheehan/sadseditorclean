import express from "express";
import multer from "multer";
import cors from "cors";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "Uploads");

const allowedFiles = [
  "banner1.jpg",
  "banner2.jpg",
  "banner3.jpg",
  "about.jpg",
  "nia.jpg",
  "sarah.jpg",
  "mara.jpg",
  "hillary.jpg",
  "radha.jpg",
  "christian.jpg",
  "ameen.jpg",
];

try {
  await fs.mkdir(uploadDir, { recursive: true });
  console.log(`Uploads directory ready at: ${uploadDir}`);
} catch (err) {
  console.error("Failed to create uploads directory:", err);
}

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const validTypes = {
      textfile: "text/plain",
      file: "image/jpeg",
    };
    if (validTypes[file.fieldname] === file.mimetype) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${file.fieldname}. Expected ${validTypes[file.fieldname]}.`));
    }
  },
}).fields([
  { name: "textfile", maxCount: 1 },
  { name: "file", maxCount: 1 },
]);

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.post("/upload", upload, async (req, res) => {
  try {
    console.log("Received files:", JSON.stringify(req.files, null, 2));
    console.log("Request body:", JSON.stringify(req.body, null, 2));

    const textFile = req.files["textfile"]?.[0];
    const imageFile = req.files["file"]?.[0];

    if (textFile && imageFile) {
      console.log("Processing Resources.jsx upload (sequential naming)");
      console.log("Text file details:", {
        originalname: textFile.originalname,
        mimetype: textFile.mimetype,
        size: textFile.size,
      });
      console.log("Image file details:", {
        originalname: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
      });

      let existingNumbers;
      try {
        existingNumbers = (await fs.readdir(uploadDir))
          .filter(f => f.match(/^\d+\.(txt|jpg)$/))
          .map(f => {
            const match = f.match(/^(\d+)\.(txt|jpg)$/);
            return match ? parseInt(match[1]) : NaN;
          })
          .filter(n => !isNaN(n));
        console.log("Existing file numbers:", existingNumbers);
      } catch (err) {
        console.error("Error reading uploads directory:", err);
        existingNumbers = [];
      }

      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      console.log("Next number:", nextNumber);

      const textFilename = `${nextNumber}.txt`;
      const imageFilename = `${nextNumber}.jpg`;
      const textPath = path.join(uploadDir, textFilename);
      const imagePath = path.join(uploadDir, imageFilename);

      console.log("Generated file names:", { textFilename, imageFilename });
      console.log("Save paths:", { textPath, imagePath });

      try {
        if (await fs.access(textPath).then(() => true).catch(() => false)) {
          throw new Error(`File ${textFilename} already exists`);
        }
        if (await fs.access(imagePath).then(() => true).catch(() => false)) {
          throw new Error(`File ${imageFilename} already exists`);
        }
      } catch (err) {
        console.error("File existence check error:", err);
        return res.status(500).json({ message: "File name conflict", error: err.message });
      }

      try {
        await Promise.all([
          fs.writeFile(textPath, textFile.buffer),
          fs.writeFile(imagePath, imageFile.buffer),
        ]);
        console.log(`Saved files: ${textFilename} (${textFile.size} bytes), ${imageFilename} (${imageFile.size} bytes)`);
      } catch (err) {
        console.error("Error saving files:", err);
        return res.status(500).json({ message: "Failed to save files", error: err.message });
      }

      try {
        const savedFiles = await fs.readdir(uploadDir);
        console.log("Files in uploads directory after save:", savedFiles);
      } catch (err) {
        console.error("Error listing uploads directory:", err);
      }

      return res.json({
        message: "Upload successful",
        textfile: textFilename,
        image: imageFilename,
        urls: {
          text: `https://sadseditor-production.up.railway.app/uploads/
${textFilename}`,
          image: `https://sadseditor-production.up.railway.app/uploads/
${imageFilename}`,
        },
      });
    }

    if (imageFile && !textFile) {
      console.log("Processing Images.jsx upload (original name)");
      console.log("Image file details:", {
        originalname: imageFile.originalname,
        mimetype: imageFile.mimetype,
        size: imageFile.size,
      });

      const filename = imageFile.originalname.toLowerCase();
      if (!allowedFiles.includes(filename)) {
        console.log("Invalid file name:", filename);
        return res.status(400).json({ message: `File name must be one of: ${allowedFiles.join(", ")}` });
      }

      const imagePath = path.join(uploadDir, filename);
      console.log("Save path:", imagePath);

      try {
        await fs.writeFile(imagePath, imageFile.buffer);
        console.log(`Saved file: ${filename} (${imageFile.size} bytes)`);
      } catch (err) {
        console.error("Error saving file:", err);
        return res.status(500).json({ message: "Failed to save file", error: err.message });
      }

      try {
        const savedFiles = await fs.readdir(uploadDir);
        console.log("Files in uploads directory after save:", savedFiles);
      } catch (err) {
        console.error("Error listing uploads directory:", err);
      }

      return res.json({
        message: "Upload successful",
        filename,
        url: `http://localhost:5000/uploads/${filename}`,
      });
    }

    console.log("Invalid upload request:", { textFile: !!textFile, imageFile: !!imageFile });
    return res.status(400).json({ message: "Invalid upload request. Provide either both textfile and file, or only file." });
  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ message: "Server error during upload.", error: err.message });
  }
});

app.delete("/delete/:filename", async (req, res) => {
  const filename = req.params.filename.toLowerCase();
  console.log(`Delete request for: ${filename}`);

  if (!allowedFiles.includes(filename)) {
    console.log("Invalid file name for deletion:", filename);
    return res.status(400).json({ message: `File name must be one of: ${allowedFiles.join(", ")}` });
  }

  const filePath = path.join(uploadDir, filename);
  try {
    await fs.unlink(filePath);
    console.log(`Deleted file: ${filename}`);
    return res.json({ message: `File ${filename} deleted successfully` });
  } catch (err) {
    console.error("Error deleting file:", err);
    if (err.code === "ENOENT") {
      return res.status(404).json({ message: `File ${filename} not found` });
    }
    return res.status(500).json({ message: "Failed to delete file", error: err.message });
  }
});

app.delete("/delete-resource/:number", async (req, res) => {
  const number = req.params.number;
  console.log(`Delete request for resource number: ${number}`);

  if (!/^\d+$/.test(number)) {
    console.log("Invalid number for deletion:", number);
    return res.status(400).json({ message: "Invalid number. Must be a positive integer." });
  }

  const textFilename = `${number}.txt`;
  const imageFilename = `${number}.jpg`;
  const textPath = path.join(uploadDir, textFilename);
  const imagePath = path.join(uploadDir, imageFilename);

  let deletedText = false;
  let deletedImage = false;

  try {
    if (await fs.access(textPath).then(() => true).catch(() => false)) {
      await fs.unlink(textPath);
      deletedText = true;
      console.log(`Deleted file: ${textFilename}`);
    }
    if (await fs.access(imagePath).then(() => true).catch(() => false)) {
      await fs.unlink(imagePath);
      deletedImage = true;
      console.log(`Deleted file: ${imageFilename}`);
    }

    if (!deletedText && !deletedImage) {
      return res.status(404).json({ message: `No files found for number ${number}` });
    }

    return res.json({ message: "Delete successful." });
  } catch (err) {
    console.error("Error deleting files:", err);
    return res.status(500).json({ message: "Failed to delete files", error: err.message });
  }
});

app.use("/uploads", express.static(uploadDir));
app.get("/", (req, res) => {
  res.send("Server is running ✅");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));