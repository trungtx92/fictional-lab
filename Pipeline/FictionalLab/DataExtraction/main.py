from google.cloud import bigquery
import load_csv as load_csv
import schema as schema


def main():
    # Initialize BigQuery client
    client = bigquery.Client()
    uri = "gs://fictional-lab-data"
    dataset_id = "fictional_lab_dataset"
    customers_table_id = f"raw_customers"
    stores_table_id = f"raw_stores"
    products_table_id = f"raw_products"
    transactions_table_id = f"raw_transactions"
    extension = "csv"
    # Load CSV files into BigQuery tables
    load_csv.load_csv_to_bigquery(f"{uri}/{customers_table_id}.{extension}", f"{dataset_id}.{customers_table_id}", schema.raw_customers_schema, client)
    load_csv.load_csv_to_bigquery(f"{uri}/{stores_table_id}.{extension}", f"{dataset_id}.{stores_table_id}", schema.raw_stores_schema, client)
    load_csv.load_csv_to_bigquery(f"{uri}/{products_table_id}.{extension}", f"{dataset_id}.{products_table_id}", schema.raw_products_schema, client)
    load_csv.load_csv_to_bigquery(f"{uri}/{transactions_table_id}.{extension}", f"{dataset_id}.{transactions_table_id}", schema.raw_transactions_schema, client)

if __name__ == "__main__":
    main()