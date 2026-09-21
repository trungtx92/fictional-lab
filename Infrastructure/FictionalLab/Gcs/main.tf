resource "google_storage_bucket" "fictional-lab-tfstate" {
  name = "fictional-lab-tfstate"
  storage_class = "STANDARD"
  location = var.region
}

