# -*- coding: utf-8 -*-
"""
Created on Wed Mar  1 02:54:52 2023

@author: anauja
"""

import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import os


# Load the dataset from a CSV file
data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
df = pd.read_csv(data_path)

# Convert the categorical columns to one-hot encoded columns
df = pd.get_dummies(df, columns=['month', 'bank_name'])

# Separate the numerical columns and scale them
numerical_cols = ['year', 'month_number', 'no_atms_on_site', 'no_atms_off_site', 'no_pos_on_line', 'no_pos_off_line', 'no_credit_cards', 'no_credit_card_atm_txn', 'no_credit_card_pos_txn', 'no_credit_card_atm_txn_value_in_mn', 'no_credit_card_pos_txn_value_in_mn', 'no_debit_cards', 'no_debit_card_atm_txn', 'no_debit_card_pos_txn', 'no_debit_card_atm_txn_value_in_mn', 'no_debit_card_pos_txn_value_in_mn']
scaler = StandardScaler()
numerical_data = scaler.fit_transform(df[numerical_cols])

# Apply PCA to the numerical data
pca = PCA(n_components=2)
principal_components = pca.fit_transform(numerical_data)

# Create a new DataFrame with the principal components
pc_df = pd.DataFrame(data = principal_components, columns = ['PC1', 'PC2'])

# Concatenate the categorical columns with the principal components
categorical_cols = ['month', 'start_date', 'end_date', 'bank_name']
categorical_data = df[categorical_cols]
result = pd.concat([pc_df, categorical_data], axis=1)

# Print the results
print(result.head())