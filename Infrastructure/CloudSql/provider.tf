terraform {
  required_version = ">= 1.10"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 5.0.0"
    }
  }
}

provider "google" {
  project = "fictional-lab-dev"
  region  = "us-central1"
  zone    = "us-central1-a"
  credentials = "keys.json"
}