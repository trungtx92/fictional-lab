resource "google_composer_environment" "fictional_lab_airflow" {
  name   = "fictional-lab-airflow"
  region = var.region

  config {
    software_config {
      image_version = "composer-3-airflow-2"
    }
    workloads_config {
      scheduler {
        cpu = 0.5
        memory_gb = 2
        storage_gb = 1
        count = 1
      }
      triggerer {
        cpu = 0.5
        memory_gb = 2
        count = 1
      }
      dag_processor {
        cpu = 1
        memory_gb = 2
        storage_gb = 1
        count = 1
      }
      web_server {
        cpu = 0.5
        memory_gb = 2
        storage_gb = 1
      }
      worker {
        cpu = 0.5
        memory_gb = 2
        storage_gb = 1
        min_count = 1
        max_count = 3
      }
    }
    environment_size = "ENVIRONMENT_SIZE_SMALL"
    node_config {
      service_account = "fictional-lab-service-account@${var.project_id}.iam.gserviceaccount.com"
    }
  }
}

resource "google_project_iam_member" "composer_worker" {
  project = var.project_id
  role    = "roles/composer.worker"
  member  = "serviceAccount:fictional-lab-service-account@${var.project_id}.iam.gserviceaccount.com"
}