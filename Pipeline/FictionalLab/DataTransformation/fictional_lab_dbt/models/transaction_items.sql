SELECT *
FROM {{ source('fictional_lab_dataset', 'raw_transaction_items') }}