# -*- coding: utf-8 -*-
"""
Created on Fri Mar  3 16:18:14 2023

@author: anuja
"""
from flask import Flask, jsonify, render_template, request
import pandas as pd
from sklearn.decomposition import PCA
# import matplotlib.pyplot as plt
import numpy as np
import os
from sklearn.preprocessing import StandardScaler

# Columns to skip for PCA calculation
skip_cols = ['month', 'month_number', 'year', 'start_date', 'end_date', 'bank_name']


data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
df = pd.read_csv(data_path)

num_cols = [col for col in df.columns if col not in skip_cols]

df = df[num_cols]

attribute_names = df.columns.values[1:]

# Extract the data values
X = df.iloc[:, 1:].values

# Standardize the data
scaler = StandardScaler()
X_std = scaler.fit_transform(X)

# Calculate the covariance matrix
cov_mat = np.cov(X_std.T)

# Perform PCA
n_components = len(attribute_names)
pca = PCA(n_components=n_components)
pca.fit(X_std)
eigenvalues = pca.explained_variance_
eigenvectors = pca.components_

# Calculate the cumulative explained variance ratio
cumulative_variance_ratio = np.cumsum(pca.explained_variance_ratio_)

# Calculate the loadings data for each PC
loadings_data = []
for i in range(n_components):
    loading_scores = eigenvectors[i] * np.sqrt(eigenvalues[i])
    loading_data = []
    for j in range(len(attribute_names)):
        loading_data.append({
            'Attribute': attribute_names[j],
            'Loading Score': loading_scores[j],
            'SS Loading': eigenvalues[i] * loading_scores[j]**2
        })
    loading_data = sorted(loading_data, key=lambda x: abs(x['Loading Score']), reverse=True)
    loadings_data.append(loading_data)
    
i = 4

# Get the number of PCs to consider
num_pcs = i + 1

# Calculate the sum of square loadings for each attribute
ss_loadings = []
for j in range(len(attribute_names)):
    ss_loading = 0
    for k in range(num_pcs):
        ss_loading += loadings_data[k][j]['SS Loading']
    ss_loadings.append(ss_loading)

# Sort the attributes by their sum of square loadings and select the top 4
sorted_indices = sorted(range(len(ss_loadings)), key=lambda x: ss_loadings[x], reverse=True)
top_4_indices = sorted_indices[:4]
top_4_attributes = [attribute_names[i] for i in top_4_indices]
top_4_ss_loadings = [ss_loadings[i] for i in top_4_indices]

# Create a dictionary with the top 4 attributes and their sum of square loadings
data = {'attributes': top_4_attributes, 'ss_loadings': top_4_ss_loadings}