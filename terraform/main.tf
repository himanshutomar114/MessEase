terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "backend" {
  name = "himanshutomar114/messease-backend:latest"
}

resource "docker_container" "backend" {
  image = docker_image.backend.image_id
  name  = "messease-backend"
  ports {
    internal = 5000
    external = 5001
  }
}