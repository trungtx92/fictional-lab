
################################################################################
# Create a service account 
################################################################################
resource "google_service_account" "fictional_lab_service_account" {
  account_id   = "fictional-lab-service-account"
  display_name = "Fictional Lab Service Account"
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
  password = var.pg_db_password
}

resource "google_sql_database" "fictional_lab_database" {
  name     = "fictional_lab_database"
  instance = google_sql_database_instance.fictional_lab_instance.name
}
