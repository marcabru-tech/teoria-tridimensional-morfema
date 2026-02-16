"""
Setup configuration for the Three-Dimensional Theory of the Morpheme package.
"""

from setuptools import setup, find_packages
import os

# Ler README para descrição longa
def read_file(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        return f.read()

# Versão
VERSION = "0.1.0"

# Dependências principais
INSTALL_REQUIRES = [
    "numpy>=1.21.0",
    "pandas>=1.3.0",
    "scipy>=1.7.0",
    "plotly>=5.0.0",
    "requests>=2.26.0",
    "pyyaml>=5.4.0",
    "tqdm>=4.62.0",
]

# Dependências opcionais
EXTRAS_REQUIRE = {
    "dev": [
        "pytest>=7.0.0",
        "pytest-cov>=3.0.0",
        "black>=22.0.0",
        "flake8>=4.0.0",
        "mypy>=0.950",
        "sphinx>=4.5.0",
        "sphinx-rtd-theme>=1.0.0",
    ],
    "nlp": [
        "transformers>=4.20.0",
        "torch>=1.12.0",
        "camel-tools>=1.5.0",  # Para árabe
        "pyarabic>=0.6.0",     # Para árabe
    ],
    "visualization": [
        "matplotlib>=3.5.0",
        "seaborn>=0.11.0",
        "plotly>=5.0.0",
        "kaleido>=0.2.0",      # Para exportar gráficos
    ],
    "ocr": [
        "pytesseract>=0.3.8",
        "opencv-python>=4.5.0",
        "pillow>=9.0.0",
    ],
}

# Todas as dependências extras
EXTRAS_REQUIRE["all"] = list(set(sum(EXTRAS_REQUIRE.values(), [])))

setup(
    name="teoria-tridimensional-morfema",
    version=VERSION,
    author="Guilherme Gonçalves Machado",
    author_email="",  # Adicionar email
    description="Uma implementação computacional da Teoria Tridimensional do Morfema",
    long_description=read_file("README.md"),
    long_description_content_type="text/markdown",
    url="https://github.com/marcabru-tech/teoria-tridimensional-morfema",
    project_urls={
        "Bug Reports": "https://github.com/marcabru-tech/teoria-tridimensional-morfema/issues",
        "Source": "https://github.com/marcabru-tech/teoria-tridimensional-morfema",
        "Documentation": "https://ttm.readthedocs.io",
    },
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Science/Research",
        "Topic :: Text Processing :: Linguistic",
        "License :: Free for non-commercial use",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Natural Language :: Arabic",
        "Natural Language :: Hebrew",
        "Natural Language :: Portuguese",
        "Natural Language :: English",
        "Natural Language :: Russian",
        "Natural Language :: Chinese (Simplified)",
    ],
    keywords=[
        "linguística", "morfologia", "semítica", "árabe", "hebraico",
        "nlp", "computational-linguistics", "morphology", "semitic",
        "hebrew", "arabic", "sanskrit", "hermeneutics"
    ],
    python_requires=">=3.8",
    install_requires=INSTALL_REQUIRES,
    extras_require=EXTRAS_REQUIRE,
    package_data={
        "ttm": [
            "data/*.json",
            "data/*.yaml",
            "data/roots/*.txt",
        ],
    },
    include_package_data=True,
    entry_points={
        "console_scripts": [
            "ttm-analyze=ttm.cli:analyze",
            "ttm-visualize=ttm.cli:visualize",
            "ttm-convert=ttm.cli:convert",
        ],
    },
    zip_safe=False,
    license="CC BY-NC-SA 4.0",
    platforms=["any"],
)
