const Cloud = require("@google-cloud/storage");
const { format } = require("util");

const { Storage } = Cloud;
const gc = new Storage({
  credentials: {
    private_key: process.env.PRIVATE_KEY,
    client_email: process.env.CLIENT_EMAIL,
  },
  projectId: "rticle",
});
console.log("PROCESS.ENV.CLIENT_EMAIL", process.env.CLIENT_EMAIL);
console.log("PROCESS.ENV.PRIVATE_KEY", process.env.PRIVATE_KEY);

const bucket = gc.bucket("rticle-assets");

const uploadImage = (file) =>
  new Promise((resolve, reject) => {
    const { originalname, buffer } = file;

    const blob = bucket.file(originalname.replace(/ /g, "_"));
    const blobStream = blob.createWriteStream({
      resumable: false,
    });
    blobStream
      .on("finish", () => {
        const publicUrl = format(
          `https://storage.googleapis.com/${bucket.name}/${blob.name}`
        );
        resolve(publicUrl);
      })
      .on("error", (err) => {
        console.log(`Unable to upload image, something went wrong`, err);
        reject();
      })
      .end(buffer);
  });

module.exports = { uploadImage: uploadImage };
