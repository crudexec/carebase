"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_1 = require("controllers/upload/upload");
const router = (0, express_1.Router)();
router.post('/', upload_1.uploadDocument);
exports.default = router;
//# sourceMappingURL=upload.js.map