import { createProject, getProjectsByUser } from "./controllers/ProjectRecord.ts";
import { deployProject } from "./controllers/DeployProject.ts";
import { addCorsHeaders } from "./helpers/CorsHeader.ts";
import * as mongoose from "mongoose";

type Method = "GET" | "PUT" | "POST" | "OPTIONS";

mongoose
  .connect(`mongodb+srv://Cluster53271:${process.env.MONGODB_PASSWORD}@cluster53271.l3uzg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster53271`)
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((err) => {
    return console.log(err);
  });

const server = Bun.serve({
  port: 3000,
  development: true,
  async fetch(req: Request) {
    try {
      const url = new URL(req.url);
      const method = req.method as Method;

      if (method === "OPTIONS") {
        return addCorsHeaders(new Response("Preflight request successful"));
      }

      const apiEndpoint = `${method} ${url.pathname}`;
      console.log(Date.now(), apiEndpoint); // works as morgan for Bun

      switch (apiEndpoint) {
        case "POST /api/v1/deploy-project":
          return deployProject(req);
        case "POST /api/v1/create-project":
          return createProject(req);
        case "GET /api/v1/get-projects":
          return getProjectsByUser(req)
        case "GET /api/v1/status":
          return addCorsHeaders(
            new Response(
              JSON.stringify({ message: `I am alive! Thanks for asking. 🥲` }),
              {
                headers: { "Content-Type": "application/json" },
                status: 200,
              }
            )
          );
        default:
          return addCorsHeaders(
            new Response(
              JSON.stringify({
                message: `You called ${apiEndpoint}, which I don't know how to handle!`,
              }),
              { headers: { "Content-Type": "application/json" }, status: 404 }
            )
          );
      }
    } catch (err) {
      console.error(err);
      return addCorsHeaders(
        new Response(JSON.stringify({ message: "Internal Server Error" }), {
          headers: { "Content-Type": "application/json" },
          status: 500,
        })
      );
    }
  },
  error(error: Error) {
    return addCorsHeaders(
      new Response(`<pre>${error}\n${error.stack}</pre>`, {
        headers: {
          "Content-Type": "text/html",
        },
      })
    );
  },
});

console.log(`Server running at http://localhost:3000/`);
