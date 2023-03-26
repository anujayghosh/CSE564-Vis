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


@app.route('/compute_eigenvectors')
def compute_eigenvectors():
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
    
    # Get eigenvalues and eigenvectors
    eigenvalues = pca.explained_variance_
    eigenvectors = pca.components_.T
    
    # Calculate percentage of variance explained by each component
    variance_ratio = pca.explained_variance_ratio_
    cumulative_variance_ratio = np.cumsum(variance_ratio)
    
    # Get score, coef and labels
    #score = pca.fit_transform(scaled_data_frame)
    coef = eigenvectors[:,:2]
    labels = num_cols
    
    loadings = pd.DataFrame(pca.components_[:4].T, columns=['PC1', 'PC2', 'PC3', 'PC4'], index=num_cols)
    loadings['Sum of Squared Loadings'] = (loadings ** 2).sum(axis=1)
    loadings = loadings.sort_values('Sum of Squared Loadings', ascending=False)
    loadings = loadings.rename_axis('Attribute').reset_index()

    
    # Return JSON response
    return jsonify({
        'eigenvalues': eigenvalues.tolist(),
        'eigenvectors': eigenvectors.tolist(),
        'variance_ratio': variance_ratio.tolist(),
        'cumulative_variance_ratio': cumulative_variance_ratio.tolist(),
        'score': score.tolist(),
        'coef': coef.tolist(),
        'labels': labels,
        'loadings': loadings.values.tolist()
    })

@app.route('/compute_loadings', methods=['GET'])
def compute_loadings():
    bar = int(request.args.get('bar'))
    
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
    n_components = 4
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
        
    i = request.args.get('bar', type=int)

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

    # Return the data as a JSON response
    return jsonify(data)

@app.route('/')
def index():
    # Load data from CSV
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
    df = pd.read_csv(data_path)
    
    
    # Get numerical columns
    num_cols = [col for col in df.columns if col not in skip_cols]
    
    # Perform PCA
    pca = PCA()
    pca.fit(df[num_cols])
    
    # Get eigenvalues and scree plot data
    eigenvalues = pca.explained_variance_
    variance = pca.explained_variance_ratio_
    
    scree_data = [{'component': i+1, 'eigenvalue': eigenvalue, 'variance': variance[i]} for i, eigenvalue in enumerate(eigenvalues)]
    
    # Render template with scree plot data
    return render_template('index.html', scree_data=scree_data)

def perform_kmeans_clustering(dataset_path, num_clusters):
    # Load the dataset
    dataset = pd.read_csv(dataset_path)
    num_cols = [col for col in dataset.columns if col not in skip_cols]
    dataset= dataset[num_cols]
    
    # Perform K-means clustering
    kmeans = KMeans(n_clusters=num_clusters)
    kmeans.fit(dataset)
    
    # Add the cluster labels to the dataset
    dataset['cluster_label'] = kmeans.labels_
    
    # Return the dataset with cluster labels
    return dataset

@app.route('/kmeans', methods=['GET'])
def kmeans():
    # Parse the request parameters
    dataset_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
    num_clusters = 2
    
    # Perform K-means clustering
    dataset = perform_kmeans_clustering(dataset_path, num_clusters)
    
    # Convert the dataset to JSON and return it
    return jsonify(dataset.to_dict(orient='records'))

def sum_of_squared_loadings(n_clusters):
    
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
    df = pd.read_csv(data_path)
    
    num_cols = [col for col in df.columns if col not in skip_cols]
    X = df[num_cols].values
    scaler = StandardScaler()
    X_std = scaler.fit_transform(X)
    kmeans = KMeans(n_clusters=n_clusters)
    kmeans.fit(X_std)
    labels = kmeans.labels_
    centers = kmeans.cluster_centers_
    distances = np.empty(X_std.shape[0])
    for i, x in enumerate(X_std):
        cluster_center = centers[labels[i]]
        distances[i] = np.linalg.norm(x - cluster_center) ** 2
    ssq = np.sum(distances)
    return ssq

@app.route('/get_ssq_values', methods=['GET'])
def get_ssq_values():
    ssq_values = []
    for n_clusters in range(1, 21):
        ssq = sum_of_squared_loadings(n_clusters)
        ssq_values.append((n_clusters, ssq))
    ssq_dict = {"data": ssq_values}
    return json.dumps(ssq_dict)


@app.route('/get_scatter_data', methods=['GET'])
def get_scatter_data():
    # Load the data from the CSV file
    data = []
    with open('data/data.csv', 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)

    # Select the attributes to include in the scatterplot matrix
    attrs = ['no_atms_off_site', 'no_pos_on_line', 'no_pos_off_line', 'no_credit_cards','bank_name']
    selected_data = [{attr: d[attr] for attr in attrs} for d in data]

    # Send the selected data to the scatterplot matrix
    return jsonify(selected_data)

@app.route('/scatter')
def scatter():

    return render_template('scatter.html')

@app.route('/mds_dataplot')
def mds_dataplot():
    # Read in data
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
    data = pd.read_csv(data_path)
    num_cols = [col for col in data.columns if col not in skip_cols]
    data= data[num_cols]
    
    # Perform K-means clustering
    kmeans = KMeans(n_clusters=2)
    kmeans.fit(data)
    labels = kmeans.predict(data)
    
    # rstate=random.randint(1, 100)
    # print("RANDOM NUMBER = ",rstate)
    # Perform MDS
    mds = MDS(n_components=2, dissimilarity='euclidean',random_state=11)
    transformed_data = mds.fit_transform(data)
    
    json_data = [{'x': float(transformed_data[i, 0]),
                  'y': float(transformed_data[i, 1]),
                  'cluster': int(labels[i])} for i in range(len(data))]
    
    # Return JSON object
    return jsonify(json_data)

@app.route('/mds_variableplot')
def mds_variableplot():
    # Read in data
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
    data = pd.read_csv(data_path)
    num_cols = [col for col in data.columns if col not in skip_cols]
    data = data[num_cols]

    # Compute the distance matrix using correlation distance
    dist_matrix = 1 - np.abs(data.corr())

    # Perform MDS with correlation distance
    mds = MDS(n_components=2, dissimilarity='precomputed', random_state=42)
    transformed_data = mds.fit_transform(dist_matrix)

    # Perform K-means clustering on the transformed data
    kmeans = KMeans(n_clusters=2)
    kmeans.fit(transformed_data)
    labels = kmeans.predict(transformed_data)

    # Prepare data for client-side JavaScript
    json_data = [{'x': float(transformed_data[i, 0]),
                  'y': float(transformed_data[i, 1]),
                  'cluster': int(labels[i]),
                  'variable_name': num_cols[i]} for i in range(len(num_cols))]

    # Return JSON object
    return jsonify(json_data)


# Define a route for getting the data
@app.route("/parallel_data")
def get_paralleldata():
    data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'data.csv')
    data = pd.read_csv(data_path)
    num_cols = [col for col in data.columns if col not in skip_cols]

    # Perform K-means clustering with n=2 on the numerical columns
    kmeans = KMeans(n_clusters=2, random_state=42)
    kmeans.fit(data[num_cols])
    data["cluster_id"] = kmeans.labels_
    # Convert the DataFrame to a list of dictionaries
    dataset = data.to_dict(orient="records")
    return jsonify(dataset)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
    


