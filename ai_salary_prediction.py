# -*- coding: utf-8 -*-
"""AI_Salary_Prediction.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1J9yTFouyNT8JV0qB_Yk6xJZ0jZAbu5--
"""

from google.colab import files
uploaded = files.upload()

!pip install pandas matplotlib seaborn scikit-learn

import pandas as pd

# Load the dataset (if uploaded manually or cloned from the repo)
df = pd.read_csv('Salary_Data.csv')  # Use the correct path if necessary

# Display the first few rows of the dataset
df.head()

import matplotlib.pyplot as plt
import seaborn as sns

# Plotting the data
sns.scatterplot(data=df, x='Years of Experience', y='Salary')
plt.title('Years of Experience vs Salary')
plt.show()

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# Splitting the data into features and target
x = df[['Years of Experience']]  # Feature (YearsExperience)
y = df['Salary']  # Target (Salary)

# Splitting into training and testing sets
x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)

# Create a Linear Regression model
model = LinearRegression()

# Train the model
model.fit(x_train, y_train)

# Predictions
y_pred = model.predict(x_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f'Mean Squared Error: {mse}')
print(f'R-squared: {r2}')

df.isnull().sum()  # Check for missing values

df = df.dropna()  # Removes any row with NaN values

# Splitting the data into features (X) and target (y)
X = df[['Years of Experience']]
y = df['Salary']

# Splitting into training and testing sets
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Now you can train the model without the NaN issue
model = LinearRegression()
model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Evaluate
from sklearn.metrics import mean_squared_error, r2_score
print(f'Mean Squared Error: {mean_squared_error(y_test, y_pred)}')
print(f'R-squared: {r2_score(y_test, y_pred)}')

# Example: Predicting the salary for 5 years of experience
years_of_experience = 5  # Input number of years
predicted_salary = model.predict([[years_of_experience]])

# Print the result
print(f'Predicted Salary for {years_of_experience} years of experience: ${predicted_salary[0]:,.2f}')

from sklearn.preprocessing import LabelEncoder

# Initialize LabelEncoder
le = LabelEncoder()

# Convert 'JobTitle' to integer values
df['Job Title'] = le.fit_transform(df['Job Title'])

# Add JobTitle as a feature
X = df[['Years of Experience', 'Job Title']]  # Include JobTitle in the features
y = df['Salary']  # Target variable: Salary

# Splitting into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model again with the updated features
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

print(f'Mean Squared Error: {mse}')
print(f'R-squared: {r2}')

# Example input: 5 years of experience and "Data Scientist"
job_title = 'Data Scientist'
years_of_experience = 5

# Convert the job title using the label encoder or one-hot encoding
job_title_encoded = le.transform([job_title])[0]  # Label Encoding Example

# Predict salary
predicted_salary = model.predict([[years_of_experience, job_title_encoded]])
print(f'Predicted Salary for {years_of_experience} years of experience as a {job_title}: Rs.{predicted_salary[0]:,.2f}')

# Example input: 5 years of experience and "Data Scientist"
job_title = 'Data Analyst'
years_of_experience = 5

# Convert the job title using the label encoder or one-hot encoding
job_title_encoded = le.transform([job_title])[0]  # Label Encoding Example

# Predict salary
predicted_salary = model.predict([[years_of_experience, job_title_encoded]])

# Divide the predicted salary by 90
predicted_salary_in_rupees = predicted_salary[0] / 30

# Print the result
print(f'Predicted Salary for {years_of_experience} years of experience as a {job_title}: ₹{predicted_salary_in_rupees:,.2f} per day')