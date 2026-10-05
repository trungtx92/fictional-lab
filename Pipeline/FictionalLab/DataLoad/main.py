from google.cloud import bigquery
from google.cloud.sql.connector import Connector
import os

# instance_connection_name = os.environ.get("INSTANCE_CONNECTION_NAME") 
# db_user = os.environ.get("DB_USER")
# db_password = os.environ.get("DB_PASSWORD")
# db_database = os.environ.get("DB_NAME")

instance_connection_name = "fictional-lab-dev:us-central1:fictional-lab-instance"
db_user = "fictional_lab_user"
db_password = "Password@123"
db_database = "fictional_lab_database"

def main():
    client = bigquery.Client()
    connector = Connector()
    connection = connector.connect(
        instance_connection_name,
        "pg8000",
        user=db_user,
        password=db_password,
        db=db_database
    )
    customer_rows = client.query(f"SELECT * FROM `{db_database}.customers`").result()
    columns = [field.name for field in customer_rows.schema]
    print(f"Columns: {columns}")
    for row in customer_rows:
        print(dict(zip(columns, row)))


    return None

if __name__ == "__main__":
    main()