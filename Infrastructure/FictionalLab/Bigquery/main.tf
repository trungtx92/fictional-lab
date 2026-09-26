resource "google_service_account" "fictional_lab_service_account" {
  account_id   = "fictional-lab-service-account"
  display_name = "Fictional Lab Service Account"
}

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