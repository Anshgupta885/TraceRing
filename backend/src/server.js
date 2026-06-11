"use strict";
/**
 * Local development server for TraceRing.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
const app = index_1.default || index_1;
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});