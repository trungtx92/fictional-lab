import datetime as dt
import os
from airflow import DAG
from airflow.providers.google.cloud.operators.cloud_run import CloudRunExecuteJobOperator
from airflow.operators.bash import BashOperator

default_args = {
    'start_date': dt.datetime(2026,1,1),
    'retries': 0
}

dag = DAG(
    'fictional_lab_extraction_pipeline',
    default_args=default_args,
    description='Trigger the extraction pipeline Cloud Run job',
    schedule='@daily',
    max_active_runs=1,
    catchup=False,
    dagrun_timeout=dt.timedelta(minutes=60),
)

extraction_pipeline = CloudRunExecuteJobOperator(
    task_id='extraction_pipeline',
    project_id=os.environ['GCP_PROJECT'],
    region=os.environ['COMPOSER_LOCATION'],
    job_name='fictional-lab-extraction-pipeline',
    dag=dag
)

transformation_pipeline = CloudRunExecuteJobOperator(
    task_id='transformation_pipeline',
    project_id=os.environ['GCP_PROJECT'],
    region=os.environ['COMPOSER_LOCATION'],
    job_name='fictional-lab-transformation-pipeline',
    dag=dag
)

load_pipeline = BashOperator(
    task_id='load_pipeline',
    bash_command='echo "running load pipeline!"',
    dag=dag
)

extraction_pipeline >> transformation_pipeline >> load_pipeline
