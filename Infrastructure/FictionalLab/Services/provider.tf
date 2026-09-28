terraform {
    required_version = ">= 1.10"
    backend "gcs" {
        bucket  = "fictional-lab-dev-tfstate"
        prefix  = "fictional-lab/services"
    }
    required_providers {
        google = {
        source  = "hashicorp/google"
        version = "~> 3.5"
        }
    }
}

provider "google" {
    project = var.project_id
    region  = var.region
    zone    = var.zone
}