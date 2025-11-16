import app from "./server.ts";
import { connectMongo } from "./src/mongo.ts";

(async (): Promise<void> => {
  try {
    await connectMongo();
    app.listen(8000, (): void => {
      console.log("Server started.");
    });
  } catch (e) {
    console.error(e);
  }
})();
