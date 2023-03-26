# -*- coding: utf-8 -*-
"""
Created on Fri Mar  3 06:45:00 2023

@author: anuja
"""

import pandas as pd
import plotly.express as px
from sklearn.decomposition import PCA
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
pca = PCA(n_components=4)
score= pca.fit_transform(scaled_data_frame)
# Get eigenvalues and scree plot data
eigenvalues = pca.explained_variance_
variance = pca.explained_variance_ratio_
cumulative_variance_ratio = np.cumsum(variance)

loadings = pd.DataFrame(pca.components_[:4].T, columns=['PC1', 'PC2', 'PC3', 'PC4'], index=num_cols)
loadings['Sum of Squared Loadings'] = (loadings ** 2).sum(axis=1)
loadings = loadings.sort_values('Sum of Squared Loadings', ascending=False)
loadings = loadings.rename_axis('Attribute').reset_index()
# print(loadings)

n_components=4
total_var = pca.explained_variance_ratio_.sum() * 100

labels = {str(i): f"PC {i+1}" for i in range(n_components)}
labels['color'] = 'bank_name'

fig = px.scatter_matrix(
    df,
    dimensions=['no_credit_card_pos_txn_value_in_mn','no_credit_card_atm_txn_value_in_mn','no_debit_card_pos_txn_value_in_mn','no_debit_card_atm_txn_value_in_mn'],
    color="bank_name"
)
fig.show()