import * as express from "express";

// import { upload } from "../../middlewares/s3";
import { apiAuth } from "../../middlewares/apiAuth";

import ctrl from "./image.ctrl";

const router: express.Router = express.Router();

// router.post("/", upload.array("files", 5), ctrl.upload);
// router.delete("/", ctrl.delete);

export default router;
