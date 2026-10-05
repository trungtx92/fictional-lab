from google.cloud import bigquery
from google.cloud.sql.connector import Connector
from src import data_process as dp
import os

dataset_id = os.environ.get("DATASET_ID")
instance_connection_name = os.environ.get("INSTANCE_CONNECTION_NAME") 
db_user = os.environ.get("DB_USER")
db_password = os.environ.get("DB_PASSWORD")
db_database = os.environ.get("DB_NAME")
db_schema = os.environ.get("DB_SCHEMA")

# instance_connection_name = "fictional-lab-dev:us-central1:fictional-lab-instance"
# db_user = "fictional_lab_user"
# db_password = "Password@123"
# db_name = "fictional_lab_database"
# db_schema = "public"

def main():
    client = bigquery.Client()
    connection = dp.connect_to_database(instance_connection_name, db_user, db_password, db_name)
    tables = ["customers", "stores", "products", "transactions", "transaction_items"]
    dp.truncate_tables(connection, db_schema, tables)
    dp.insert_to_tables(client, connection, dataset_id, db_schema, tables)
    connection.close()

if __name__ == "__main__":
    main()