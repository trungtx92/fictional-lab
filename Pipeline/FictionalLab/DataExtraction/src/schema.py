from google.cloud import bigquery

raw_customers_schema=[
    bigquery.SchemaField("CUSTOMER_ID", "INTEGER"),
    bigquery.SchemaField("FIRST_NAME", "STRING"),
    bigquery.SchemaField("LAST_NAME", "STRING"),
    bigquery.SchemaField("GENDER", "STRING"),
    bigquery.SchemaField("DATE_OF_BIRTH", "DATE"),
    bigquery.SchemaField("EMAIL", "STRING"),
    bigquery.SchemaField("PHONE", "STRING"),
    bigquery.SchemaField("COUNTRY", "STRING"),
    bigquery.SchemaField("STATE", "STRING"),
    bigquery.SchemaField("POSTCODE", "STRING"),
    bigquery.SchemaField("CREATED_AT", "TIMESTAMP"),
]

raw_stores_schema = [
    bigquery.SchemaField("STORE_ID", "INTEGER"),
    bigquery.SchemaField("STORE_NAME", "STRING"),
    bigquery.SchemaField("REGION", "STRING"),
    bigquery.SchemaField("COUNTRY", "STRING"),
    bigquery.SchemaField("STATE", "STRING"),
    bigquery.SchemaField("POSTCODE", "STRING"),
    bigquery.SchemaField("MANAGER_NAME", "STRING"),
]

raw_products_schema = [
    bigquery.SchemaField("PRODUCT_ID", "INTEGER"),
    bigquery.SchemaField("SKU", "STRING"),
    bigquery.SchemaField("PRODUCT_NAME", "STRING"),
    bigquery.SchemaField("CATEGORY", "STRING"),
    bigquery.SchemaField("UNIT_PRICE", "FLOAT"),
    bigquery.SchemaField("IS_ACTIVE", "BOOLEAN"),
    bigquery.SchemaField("CREATED_AT", "TIMESTAMP"),
]

raw_transactions_schema = [
    bigquery.SchemaField("TRANSACTION_ID", "INTEGER"),
    bigquery.SchemaField("CUSTOMER_ID", "INTEGER"),
    bigquery.SchemaField("STORE_ID", "INTEGER"),
    bigquery.SchemaField("TRANSACTION_DATE", "TIMESTAMP"),
    bigquery.SchemaField("PAYMENT_METHOD", "STRING"),
    bigquery.SchemaField("STATUS", "STRING"),
    bigquery.SchemaField("TOTAL_AMOUNT", "FLOAT"),
    bigquery.SchemaField("CREATED_AT", "TIMESTAMP"),
]

raw_transaction_items_schema = [
    bigquery.SchemaField("TRANSACTION_ITEM_ID", "INTEGER"),
    bigquery.SchemaField("TRANSACTION_ID", "INTEGER"),
    bigquery.SchemaField("PRODUCT_ID", "INTEGER"),
    bigquery.SchemaField("QUANTITY", "INTEGER"),
    bigquery.SchemaField("UNIT_PRICE", "FLOAT"),
    bigquery.SchemaField("LINE_TOTAL", "FLOAT"),
]