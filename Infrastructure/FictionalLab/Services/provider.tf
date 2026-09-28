terraform {
    required_version = ">= 1.10"
    backend "gcs" {
        bucket  = "fictional-lab-dev-tfstate"
        prefix  = "fictional-lab/services"
    }
    required_providers {
        google = {
        source  = "hashicorp/google"
        version = ">= 5.0.0"
        }
        postgresl = {
        source  = "cyrilgdn/postgresql"
        version = ">= 1.22"
        }
    }
}

provider "google" {
    project = var.project_id
    region  = var.region
    zone    = var.zone
}

provider "postgresql" {
    schema   = "gcppostgres"
    host     = "${var.project_id}:${var.region}:${google_sql_database_instance.fictional_lab_instance.name}"
    username = "fictional_lab_user"
    password = var.db_password
    superuser = false
}