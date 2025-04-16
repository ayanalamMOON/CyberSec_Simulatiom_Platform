FROM jupyter/scipy-notebook:latest

USER root

# Install additional dependencies
RUN pip install --no-cache-dir \
    sympy==1.12 \
    cryptography==41.0.4 \
    matplotlib==3.8.0 \
    plotly==5.17.0

# Create a directory for our notebooks
WORKDIR /home/jovyan/work

# Switch back to jovyan to avoid permission issues
USER jovyan

# Expose the notebook port
EXPOSE 8888

# Set up the command to start the notebook server
CMD ["start-notebook.sh", "--NotebookApp.token=''", "--NotebookApp.password=''"]