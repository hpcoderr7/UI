import pandas as pd

def check_missing_and_duplicates(filepath):
    df = pd.read_csv(filepath)

    # Missing values info
    missing_info = {}
    for col in df.columns:
        missing_count = df[col].isnull().sum()
        if missing_count > 0:
            missing_info[col] = missing_count

    # Duplicates
    duplicate_indices = df[df.duplicated()].index.tolist()

    return missing_info, duplicate_indices
