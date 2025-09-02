from setuptools import setup, find_packages

setup(
    name="deadgrid",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "openai",
        "python-dotenv",
        "requests",
        "pillow",
    ],
    python_requires=">=3.8",
) 