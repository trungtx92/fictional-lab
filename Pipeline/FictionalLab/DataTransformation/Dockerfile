FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
ENV DBT_PROFILES_DIR=/app/profiles
WORKDIR /app/fictional_lab_dbt
CMD [ "dbt", "build" ]