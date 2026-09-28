variable "project_id" {
  description = "The ID of the project in which to provision resources."
  type        = string
}

variable "region" {
  description = "The region in which to provision resources."
  type        = string
}

variable "zone" {
  description = "The zone in which to provision resources."
  type        = string
}

variable "db_password" {
  description = "Password for the fictional_lab_user database user"
  type        = string
  sensitive   = true
}