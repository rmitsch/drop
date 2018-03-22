#!/bin/sh

## Manual setup steps. ##

# Download repository and install package for multi-threaded t-SNE.
pip install --no-cache-dir git+https://github.com/DmitryUlyanov/Multicore-TSNE.git
pip install --no-cache-dir git+https://github.com/rappdw/tsne.git
pip install --no-cache-dir git+https://github.com/samueljackson92/coranking.git
pip install --no-cache-dir git+https://github.com/naught101/sobol_seq.git