import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dgdfxukbk",
  api_key: "192698678724172",
  api_secret:"_sWBEWeVtA3wHgQGcOSyh4jXa04",
});

console.log( process.env.CLOUDINARY_CLOUD_NAME)
export default cloudinary;
