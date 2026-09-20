resource "google_sql_database_instance" "fictional_lab_instance" {
  name = "fictional-lab-instance"
  database_version = "POSTGRES_15"
  region = "us-central1"
  deletion_protection = false
  settings {
    tier = "db-f1-micro"

    backup_configuration {
      enabled                        = true
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

resource "google_sql_user" "name" {
  name     = "fictional_lab_user"
  password = "Password@123"
  instance = google_sql_database_instance.fictional_lab_instance.name
}

resource "google_sql_database" "fictional_lab_db" {
  name     = "fictional_lab_db"
  instance = google_sql_database_instance.fictional_lab_instance.name
  charset  = "UTF8"
  collation = "en_US.UTF8"
}