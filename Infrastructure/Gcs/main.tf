resource "google_storage_bucket" "fictional-lab-dev-tfstate" {
  name = "fictional-lab-dev-tfstate"
  storage_class = "STANDARD"
  location = var.region
}

