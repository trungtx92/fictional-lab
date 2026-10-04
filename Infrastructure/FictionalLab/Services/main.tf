locals {
    database = "fictional_lab_database"
    owner    = "fictional_lab_user"
    sa_role  = "fictional-lab-service-account@${var.project_id}.iam"

}
################################################################################
# Create a service account 
################################################################################

resource "google_service_account" "fictional_lab_service_account" {
  account_id   = "fictional-lab-service-account"
  display_name = "Fictional Lab Service Account"
}

################################################################################
# Create a GCS bucket grant access to the service account
################################################################################

resource "google_storage_bucket" "fictional_lab_source_bucket" {
  name     = "fictional-lab-source-bucket"
  location = var.region
}

resource "google_storage_bucket_iam_member" "fictional_lab_source_bucket_access" {
  bucket = google_storage_bucket.fictional_lab_source_bucket.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.fictional_lab_service_account.email}"
}

################################################################################
# Create a BigQuery dataset and grant access to the service account
################################################################################

resource "google_bigquery_dataset" "fictional_lab_dataset" {
  dataset_id = "fictional_lab_dataset"
  project    = var.project_id
  location   = var.region
}

resource "google_bigquery_dataset_access" "fictional_lab_access" {
  dataset_id = google_bigquery_dataset.fictional_lab_dataset.dataset_id
  role = "roles/bigquery.dataEditor"
  user_by_email = google_service_account.fictional_lab_service_account.email
}

resource "google_project_iam_member" "fictional_lab_bigquery_job_user" {
  project = var.project_id
  role = "roles/bigquery.jobUser"
  member = "serviceAccount:${google_service_account.fictional_lab_service_account.email}"
}

resource "google_project_iam_member" "fictional_lab_bigquery_read_session_user" {
  project = var.project_id
  role = "roles/bigquery.readSessionUser"
  member = "serviceAccount:${google_service_account.fictional_lab_service_account.email}"
  
}

################################################################################
# Create a PostgreSQL database and user, and grant access to the service account
################################################################################
resource "google_sql_database_instance" "fictional_lab_instance" {
  name             = "fictional-lab-instance"
  database_version = "POSTGRES_15"
  region          = var.region
  deletion_protection = false

  settings {
    tier = "db-f1-micro"

    # Lets IAM principals (like the service account below) log in without a password
    database_flags {
      name  = "cloudsql.iam_authentication"
      value = "on"
    }

    backup_configuration {
      enabled = true
      start_time                     = "03:00" # UTC
      point_in_time_recovery_enabled = true    # WAL archiving, Postgres PITR

      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }

      transaction_log_retention_days = 7
    }
  }
}

resource "google_sql_user" "fictional_lab_user" {
  name     = "fictional_lab_user"
  instance = google_sql_database_instance.fictional_lab_instance.name
  password = var.db_password
}

resource "google_sql_database" "fictional_lab_database" {
  name     = "fictional_lab_database"
  instance = google_sql_database_instance.fictional_lab_instance.name
}

################################################################################
# Grant the service account access to Cloud SQL
################################################################################

# Allows connecting to the instance (Cloud SQL Connector / Auth Proxy)
resource "google_project_iam_member" "fictional_lab_sa_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.fictional_lab_service_account.email}"
}

# Allows logging in to the database with its IAM identity
resource "google_project_iam_member" "fictional_lab_sa_cloudsql_instance_user" {
  project = var.project_id
  role    = "roles/cloudsql.instanceUser"
  member  = "serviceAccount:${google_service_account.fictional_lab_service_account.email}"
}

# Postgres user for the service account; the name must drop ".gserviceaccount.com"
resource "google_sql_user" "fictional_lab_sa_user" {
  name     = trimsuffix(google_service_account.fictional_lab_service_account.email, ".gserviceaccount.com")
  instance = google_sql_database_instance.fictional_lab_instance.name
  type     = "CLOUD_IAM_SERVICE_ACCOUNT"
}

################################################################################
# Grant the service account access to Database In Postgres
################################################################################

# See objects in the public schema
resource "postgresql_grant" "sa_schema_usage" {
  database = local.database
  role     = local.sa_role
  schema   = "public"
  object_type = "schema"
  privileges = ["USAGE"]
}

# READ/WRITE on all existing tables
resource "postgresql_grant" "sa_tables_rw" {
  database = local.database
  role     = local.sa_role
  schema   = "public"
  object_type = "table"
  privileges = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}
# Needed for INSERT into tables with serial / identity IDs
resource "postgresql_grant" "sq_sequences" {
  database = local.database
  role     = local.sa_role
  schema   = "public"
  object_type = "sequence"
  privileges = ["USAGE", "SELECT"]
}
# Same rights on tables fictional_lab_user creates in the future
resource "postgresql_default_privileges" "sa_future_tables" {
  database = local.database
  role     = local.sa_role
  owner    = local.owner
  schema   = "public"
  object_type = "table"
  privileges = ["SELECT", "INSERT", "UPDATE", "DELETE"]
}

resource "postgresql_default_privileges" "sa_future_sequences" {
  database = local.database
  role     = local.sa_role
  owner    = local.owner
  schema   = "public"
  object_type = "sequence"
  privileges = ["USAGE", "SELECT"]
}

################################################################################
# Grant the service account access to Trigger Cloud Run
################################################################################
# Grant Cloud Run Invoker role
resource "google_project_iam_member" "fictional_lab_run_invoker" {
  project = var.project_id
  role = "roles/run.invoker"
  member = "serviceAccount:${google_service_account.fictional_lab_service_account.email}"
}
# Grant Cloud Run Viewer Role
resource "google_project_iam_member" "fictional_lab_run_viewer" {
  project = var.project_id
  role = "roles/run.viewer"
  member = "serviceAccount:${google_service_account.fictional_lab_service_account.email}"
}