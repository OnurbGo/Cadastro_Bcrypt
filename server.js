const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const multer = require("multer");

const fs = require("fs");

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

app.get("/", (req, res) => {
  res.send("Servidor de upload esta no ar!");
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

function createUploadDirectory(uploadDir) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log(`Diretorio ${uploadDir} criado automaticamente.`);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/";
    createUploadDirectory(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(
      new Error("Tipo de arquivo invalido. Apenas JPEG e PNG são permitidos."),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
});

app.post("/uploads", (req, res) => {
  upload.single("meuArquivo")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({
        message: "Erro do multer: " + err.message,
        detail: "Verifique o tamanho do arquivo",
      });
    }

    if (err) {
      return res.status(400).send({
        message: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).send({
        message: "Nenhum arquivo enviado.",
      });
    }

    res.send(`Arquivo ${req.file.originalname} enviado com sucesso!`);
  });
});
