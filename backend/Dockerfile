# --- Builder Stage ---
# This stage installs dependencies into a virtual environment.
FROM python:3.11-slim as builder

# Set environment variables for a saner Python environment
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

# Create a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Copy and install requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


# --- Final Stage ---
# This stage copies the application and the installed dependencies from the builder.
FROM python:3.11-slim

# Set the working directory
WORKDIR /code

# Create a non-root user
RUN addgroup --system app && adduser --system --group app

# Copy the virtual environment from the builder stage
COPY --from=builder /opt/venv /opt/venv

# Activate the virtual environment
ENV PATH="/opt/venv/bin:$PATH"

# Copy the application code
COPY . .

# Change ownership of the code to the non-root user
RUN chown -R app:app /code

# Switch to the non-root user
USER app

# Expose the port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 