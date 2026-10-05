from google.cloud import bigquery
from google.cloud.sql.connector import Connector
import os

def connect_to_database(instance_connection_name, db_user, db_password, db_name):
    connector = Connector()
    connection = connector.connect(
        instance_connection_name,
        "pg8000",
        user=db_user,
        password=db_password,
        db=db_name
    )
    return connection

def truncate_tables(connection, db_schema, tables):
    for table in tables:
        truncate_execution(connection, db_schema, table)
    return True

def insert_to_tables(client, connection, dataset_id, db_schema, tables):
    for table in tables:
        insert_execution(client, connection, dataset_id, db_schema, table)
    return True


def fetch_data_from_bigquery(client, dataset_id, table):
    rows = client.query(f"SELECT * FROM `{dataset_id}.{table}`").result()
    columns = [field.name.lower() for field in rows.schema]
    values = [tuple(row.values()) for row in rows]
    print("columns:", columns)
    print("values:", values)
    return columns, values

def truncate_execution(connection, db_schema, table):
    truncate_query = f"TRUNCATE TABLE {db_schema}.{table}"
    cursor = connection.cursor()
    cursor.execute(truncate_query)
    connection.commit()
    cursor.close()

def insert_execution(client, connection, dataset_id, db_schema, table):
    columns, values = fetch_data_from_bigquery(client, dataset_id, table)
    placeholder = ", ".join(["%s"] * len(columns))
    insert_query = f"INSERT INTO {db_schema}.{table} ({', '.join(columns)}) VALUES ({placeholder})"
    cursor = connection.cursor()
    cursor.executemany(insert_query, values)
    connection.commit()
    cursor.close()

