"""
attendance_predict_gui.py

Opens a file dialog to select an attendance Excel file,
shows relevant columns and data types, trains a model,
and predicts future attendance safely without Unicode issues.
"""

# ===== 1. Standard library imports =====
from tkinter import Tk
from tkinter.filedialog import askopenfilename

# ===== 2. Third-party imports =====
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import matplotlib.pyplot as plt

# ===== 3. File selection =====
Tk().withdraw()  # Hide root window
file_path = askopenfilename(
    title="Select Attendance Excel File",
    filetypes=[("Excel files", "*.xlsx *.xls")]
)

if not file_path:
    print("No file selected. Exiting.")
    exit()

print(f"Selected file: {file_path}\n")

# ===== 4. Read Excel =====
df = pd.read_excel(file_path)

# ===== 5. Preview only relevant columns =====
preview_cols = ['Student ID', 'Student Name', 'Action', 'Date']
print("Columns in Excel file (relevant for analysis):")
print(df[preview_cols].columns)
print("\nData types of relevant columns:")
print(df[preview_cols].dtypes)
print("\nFirst 5 rows (relevant columns):")
print(df[preview_cols].head())

# ===== 6. Preprocess =====
df = df[preview_cols]
df['Action'] = LabelEncoder().fit_transform(df['Action'])  # Present/Absent -> 1/0
df['DayOfWeek'] = pd.to_datetime(df['Date']).dt.dayofweek
df['Student ID Enc'] = LabelEncoder().fit_transform(df['Student ID'])

# ===== 7. Prepare features and target =====
X = df[['Student ID Enc', 'DayOfWeek']]
y = df['Action']

# ===== 8. Train/test split =====
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# ===== 9. Train model =====
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
# >>> Add this block here <<<
accuracy = model.score(X_test, y_test) * 100
print(f"\nModel Accuracy on Test Data: {accuracy:.2f}%")

# ===== 10. Predict for next Monday =====
future_df = pd.DataFrame({
    'Student ID Enc': X['Student ID Enc'].unique(),
    'DayOfWeek': [5] * len(X['Student ID Enc'].unique())  # 5 = Saturday
})
predictions = model.predict_proba(future_df)[:, 1]
future_df['Predicted_Attendance'] = predictions

# Map encoded ID back to student name(s)
id_name_map = (
    df.groupby('Student ID Enc')['Student Name']
    .apply(lambda names: ", ".join(names.unique()))
)
future_df['Student Name'] = future_df['Student ID Enc'].map(id_name_map)

future_df = future_df[
    ['Student ID Enc', 'Student Name', 'Predicted_Attendance']
]

# ===== 11. Show results =====
print("\nPredicted Attendance for next Saturday:")
print(future_df)

# ===== 12. Save to Excel =====
OUTPUT_FILE = "predicted_attendance_enhanced.xlsx"
future_df.to_excel(OUTPUT_FILE, index=False)
print(f"\nPredictions saved to {OUTPUT_FILE}")

# ===== 13. Plot chart =====
plt.figure(figsize=(12, 6))
plt.bar(future_df['Student Name'], future_df['Predicted_Attendance'])
plt.xlabel("Student Name")
plt.ylabel("Probability of Being Present")
plt.title("Predicted Attendance Probability for Next Saturday")
plt.xticks(rotation=45)
plt.ylim(0, 1)
plt.tight_layout()
plt.show()
