import pg from "pg";
import { Connector } from "@google-cloud/cloud-sql-connector";

// NUMERIC columns (unit_price, line_total, total_amount) come back from pg as
// strings by default. The API returned numbers under the mock data, so parse them.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);

const config = {
  user: process.env.DB_USER || "fictional_lab_user",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "fictional_lab_db",
  // db-f1-micro allows very few connections, keep the pool small.
  max: Number(process.env.DB_POOL_MAX) || 5,
};

// Default mode: the Cloud SQL Node.js Connector. It connects to the instance's
// public IP over an IAM-authorized, encrypted tunnel, so no authorized network
// is needed. It works the same on Cloud Run (service account credentials) and
// locally (run `gcloud auth application-default login` first). The identity
// needs roles/cloudsql.client and the Cloud SQL Admin API must be enabled.
//
// Fallback: set DB_HOST to connect directly instead, e.g. a Cloud SQL Auth
// Proxy at localhost, or the /cloudsql/<connection-name> socket that Cloud Run
// mounts when deployed with --add-cloudsql-instances.
async function createPool() {
  if (process.env.DB_HOST) {
    return new pg.Pool({
      ...config,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
    });
  }

  const connector = new Connector();
  const clientOpts = await connector.getOptions({
    instanceConnectionName:
      process.env.INSTANCE_CONNECTION_NAME || "fictional-lab-dev:us-central1:fictional-lab-instance",
    ipType: "PUBLIC",
  });
  return new pg.Pool({ ...clientOpts, ...config });
}

export const pool = await createPool();

pool.on("error", (err) => {
  console.error("Unexpected error on idle database client", err);
});

export const query = (text, params) => pool.query(text, params);
