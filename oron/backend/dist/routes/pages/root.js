"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('/', (req, res, next) => {
    res.status(200).header('Content-Type', 'text/html').send(`<h4>💊 Creed Backend</h4>`);
});
exports.default = router;
//# sourceMappingURL=root.js.map