# setup.py

""" Project installation configuration """

from setuptools import setup, find_packages

setup(
    name="lambdaFunctions",
    version="0.1.1",
    packages=find_packages("src"),
    package_dir={"": "src"},
    author="Gregory Chow",
    author_email="greg.choww@gmail.com",
)
