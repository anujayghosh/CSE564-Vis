# -*- coding: utf-8 -*-
"""
Created on Fri Mar  3 00:49:46 2023

@author: anuja
"""
from flask import Flask, jsonify, render_template
import pandas as pd
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import numpy as np
import os
from sklearn.preprocessing import StandardScaler



# Columns to skip for PCA calculation
skip_cols = ['month', 'month_number', 'year', 'start_date', 'end_date', 'bank_name']

# Load data from CSV
data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
df = pd.read_csv(data_path)
data_scaler = StandardScaler()
# Get numerical columns
num_cols = [col for col in df.columns if col not in skip_cols]

data_scaler.fit(df[num_cols])
scaled_data_frame = data_scaler.transform(df[num_cols])

# Perform PCA
pca = PCA()
score= pca.fit_transform(scaled_data_frame)
# Get eigenvalues and scree plot data
eigenvalues = pca.explained_variance_
variance = pca.explained_variance_ratio_
cumulative_variance_ratio = np.cumsum(variance)

loadings = pd.DataFrame(pca.components_[:4].T, columns=['PC1', 'PC2', 'PC3', 'PC4'], index=num_cols)
loadings['Sum of Squared Loadings'] = (loadings ** 2).sum(axis=1)
loadings = loadings.sort_values('Sum of Squared Loadings', ascending=False)
loadings = loadings.rename_axis('Attribute').reset_index()
print(loadings)

def biplot(score,coef,labels=None):
 
    xs = score[:,0]
    ys = score[:,1]
    n = coef.shape[0]
    scalex = 1.0/(xs.max() - xs.min())
    scaley = 1.0/(ys.max() - ys.min())
    plt.scatter(xs * scalex,ys * scaley,
                s=5, 
                color='orange')
 
    for i in range(n):
        plt.arrow(0, 0, coef[i,0], 
                  coef[i,1],color = 'purple',
                  alpha = 0.5)
        plt.text(coef[i,0]* 1.15, 
                 coef[i,1] * 1.15, 
                 labels[i], 
                 color = 'darkblue', 
                 ha = 'center', 
                 va = 'center')
 
    plt.xlabel("PC{}".format(1))
    plt.ylabel("PC{}".format(2))    
 
 
    plt.figure()
    
plt.title('Biplot of PCA')
 
biplot(score, 
       np.transpose(pca.components_), 
       num_cols)
    
