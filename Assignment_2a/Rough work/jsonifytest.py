# -*- coding: utf-8 -*-
"""
Created on Fri Mar  3 21:36:46 2023

@author: anuja
"""
import csv
from flask import Flask, jsonify
data = []
with open('data/data.csv', 'r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        data.append(row)

# Select the attributes to include in the scatterplot matrix
attrs = ['no_atms_off_site', 'no_pos_on_line', 'no_pos_off_line', 'no_credit_cards','bank_name']
selected_data = [{attr: d[attr] for attr in attrs} for d in data]

# Send the selected data to the scatterplot matrix
print((selected_data))