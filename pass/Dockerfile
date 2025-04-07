# Base image for development
FROM python:3.9 AS development

# Set working directory
WORKDIR /code

# Copy requirements.txt
COPY ./requirements.txt /code/requirements.txt

# Install development dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the application code
COPY . /code

# Command to start the FastAPI server using Hypercorn in development mode
CMD ["python", "-m", "main"]

# Base image for production
FROM python:3.9-slim AS production

# Set working directory
WORKDIR /code

# Copy requirements.txt
COPY ./requirements.txt /code/requirements.txt

# Install development dependencies
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the application code
COPY . /code

# Command to start the FastAPI server using Hypercorn in production mode
CMD ["python", "-m", "main"]
