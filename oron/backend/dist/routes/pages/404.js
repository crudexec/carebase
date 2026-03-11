"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get('*', (req, res, next) => {
    return res.status(404).json('404 Not Found');
});
exports.default = router;
//# sourceMappingURL=404.js.map