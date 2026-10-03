
from google.cloud import bigquery

def load_csv_to_bigquery(uri, table_id, table_schema, client, write_disposition=bigquery.WriteDisposition.WRITE_APPEND):
    job_config = bigquery.LoadJobConfig(
        schema=table_schema,
        write_disposition=write_disposition,
        skip_leading_rows=1,
        source_format=bigquery.SourceFormat.CSV,
    )
    load_job = client.load_table_from_uri(
        uri,
        table_id,
        job_config=job_config
    )
    load_job.result()  # Waits for the job to complete.
    destination_table = client.get_table(table_id)
    print("Loaded {} rows.".format(destination_table.num_rows))
    # End of file: gcs_bq.py
