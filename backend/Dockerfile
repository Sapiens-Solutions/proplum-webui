FROM python:3.12 as python-base

# Create workdir folder and copy file with dependencies
RUN mkdir backend_app
WORKDIR /backend_app
COPY pyproject.toml .

# Install dependencies
RUN pip3 install poetry
# Disable virtual environment creation inside the container, as it is only needed on the local machine
RUN poetry config virtualenvs.create false
RUN poetry install

COPY . .
CMD ["fastapi", "run", "./app/main.py", "--port", "8001"]