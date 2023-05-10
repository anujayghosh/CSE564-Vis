from flask import Flask, jsonify, render_template, request
import pandas as pd
from sklearn.decomposition import PCA
# import matplotlib.pyplot as plt
import numpy as np
import os
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import json
import csv
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances
import random


# Columns to skip for PCA calculation
skip_cols = ['month', 'month_number', 'year', 'start_date', 'end_date', 'bank_name']

app = Flask(__name__, static_url_path='/static')

data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
df = pd.read_csv(data_path)

df = df.melt(id_vars=['Region', 'State', 'Bank Group', 'Bank'], var_name=['Quarter : Population Group'], value_name='Value')
df = df.dropna()

df = df[~df["Quarter : Population Group"].str.contains('Total', case=False)]

# Create a dictionary to map state names to their codes
state_codes = {
    'Andaman and Nicobar Islands': 'IN-AN',
    'Andhra Pradesh': 'IN-AP',
    'Arunachal Pradesh': 'IN-AR',
    'Assam': 'IN-AS',
    'Bihar': 'IN-BR',
    'Chandigarh': 'IN-CH',
    'Chhattisgarh': 'IN-CT',
    'Dadra and Nagar Haveli and Daman and Diu': 'IN-DN',
    'Delhi': 'IN-DL',
    'Goa': 'IN-GA',
    'Gujarat': 'IN-GJ',
    'Haryana': 'IN-HR',
    'Himachal Pradesh': 'IN-HP',
    'Jammu and Kashmir': 'IN-JK',
    'Jharkhand': 'IN-JH',
    'Karnataka': 'IN-KA',
    'Kerala': 'IN-KL',
    'Ladakh': 'IN-LA',
    'Lakshadweep': 'IN-LD',
    'Madhya Pradesh': 'IN-MP',
    'Maharashtra': 'IN-MH',
    'Manipur': 'IN-MN',
    'Meghalaya': 'IN-ML',
    'Mizoram': 'IN-MZ',
    'Nagaland': 'IN-NL',
    'Odisha': 'IN-OR',
    'Puducherry': 'IN-PY',
    'Punjab': 'IN-PB',
    'Rajasthan': 'IN-RJ',
    'Sikkim': 'IN-SK',
    'Tamil Nadu': 'IN-TN',
    'Telangana': 'IN-TG',
    'Tripura': 'IN-TR',
    'Uttar Pradesh': 'IN-UP',
    'Uttarakhand': 'IN-UT',
    'West Bengal': 'IN-WB'
}

@app.route('/')
def index():

    return render_template('index.html')


@app.route('/get_states_data')
def get_states_data():
    data = df
    # Group the data by state and calculate the total number of offices
    state_data = data.groupby('State')['Value'].sum().reset_index()

    # Convert the data to a JSON object
    state_data_json = state_data.to_dict(orient='records')

    # Return a JSON response with proper encoding and content-type header
    return jsonify(state_data_json)

@app.route('/get_banks_data')
def get_banks_data():
    data = df
    bank_data_json = data.to_dict(orient='records')

    # Return a JSON response with proper encoding and content-type header
    return jsonify(bank_data_json)


@app.route('/full_data_india')
def india_map_data():
    data_path_india = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'full_data-1.json')
    with open(data_path_india, 'r') as f:
        json_data = json.load(f)
    return jsonify(json_data)



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
    


