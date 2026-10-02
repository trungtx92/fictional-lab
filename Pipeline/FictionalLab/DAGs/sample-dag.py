import datetime as dt
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator

default_args = {
    'start_date': dt.datetime(2020, 1, 1),
    'retries': 1,
    'retry_delay': dt.timedelta(minutes=5)
}

def hello_world():
    print("Hello from PythonOperator!")

dag = DAG(
    'basic_dag',
    default_args=default_args,
    description='A simple DAG to demonstrate Airflow functionality',
    schedule='@daily',
    max_active_runs=2,
    catchup=False,
    dagrun_timeout=dt.timedelta(minutes=60),
)

bash_operator = BashOperator(
    task_id='bash_task',
    bash_command='echo "Hello from BashOperator!"',
    dag=dag
)

python_operator = PythonOperator(
    task_id='python_task',
    python_callable=hello_world,
    dag=dag
)

bash_operator >> python_operator