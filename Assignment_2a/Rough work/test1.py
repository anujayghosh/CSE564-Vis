# -*- coding: utf-8 -*-
"""
Created on Wed Mar  1 02:37:30 2023

@author: anuja
"""

from flask import Flask, jsonify, render_template
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
import matplotli.pyplot as plt

app = Flask(__name__)

# Columns to skip for PCA calculation
skip_cols = ['month', 'month_number', 'year', 'start_date', 'end_date', 'bank_name']

@app.route('/compute_eigenvectors')
def compute_eigenvectors():
    # Load data from CSV
    df = pd.read_csv('data.csv', delimiter=' ')
    
    # Get numerical columns
    num_cols = [col for col in df.columns if col not in skip_cols]
    
    # Perform PCA
    pca = PCA()
    pca.fit(df[num_cols])
    
    # Get eigenvalues and eigenvectors
    eigenvalues = pca.explained_variance_
    eigenvectors = pca.components_.T.tolist()
    
    fig, ax = plt.subplots()
    ax.bar(range(len(eigenvalues)), eigenvalues / sum(eigenvalues))
    ax.set_xlabel('Principal Component')
    ax.set_ylabel('Explained Variance Ratio')
    
    # Return JSON response
    return jsonify({'eigenvalues': eigenvalues.tolist(), 'eigenvectors': eigenvectors})

@app.route('/')
def index():
    # Load data from CSV
    df = pd.read_csv('data.csv', delimiter=' ')
    
    # Get numerical columns
    num_cols = [col for col in df.columns if col not in skip_cols]
    
    # Perform PCA
    pca = PCA()
    pca.fit(df[num_cols])
    
    # Get eigenvalues and scree plot data
    eigenvalues = pca.explained_variance_
    scree_data = [{'component': i+1, 'eigenvalue': eigenvalue} for i, eigenvalue in enumerate(eigenvalues)]
    
    # Render template with scree plot data
    return render_template('index.html', scree_data=scree_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)

