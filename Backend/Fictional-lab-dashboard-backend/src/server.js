import { createApp } from "./app.js";

// 8080 is the default of Fictional-lab-backend, so both APIs can run side by side.
const port = process.env.PORT || 8081;
const app = createApp();

app.listen(port, () => {
  console.log(`Sales dashboard backend listening on http://localhost:${port}`);
});
