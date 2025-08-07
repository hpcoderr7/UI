from flask import Flask, render_template, request, redirect, url_for, session
import pandas as pd
import os
from werkzeug.utils import secure_filename
from preprocess import check_missing_and_duplicates


app = Flask(__name__)
app.secret_key = 'supersecretkey'
app.config['UPLOAD_FOLDER'] = 'uploads'


# Ensure uploads folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


def read_rows_from_csv(filepath, start, end):
    chunk_size = end - start
    skip_rows = list(range(1, start + 1))  # skip header + earlier rows
    try:
        df = pd.read_csv(filepath, skiprows=skip_rows, nrows=chunk_size)
        df.columns = pd.read_csv(filepath, nrows=0).columns  # Ensure correct column names
        return df
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return None


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file or file.filename == '':
            return "No file uploaded", 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        session['filepath'] = filepath
        return redirect(url_for('upload'))  # Redirect to GET to show preview

    # ---------- GET request: show first 5 rows ----------
    filepath = session.get('filepath')
    if not filepath or not os.path.exists(filepath):
        return redirect(url_for('index'))

    try:
        start = int(request.args.get('start', 0))
        end = int(request.args.get('end', start + 5))  # Default to first 5 rows
    except ValueError:
        return "Invalid row range", 400

    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        return f"Error reading file: {e}", 500

    # Prepare preview data
    df_range = df.iloc[start:end]
    column_names = df.columns.tolist()
    row_data = df_range.to_dict(orient='records')

    # Calculate stats
    total_rows = len(df)
    total_columns = len(df.columns)
    missing_percent = round(df.isnull().sum().sum() / (total_rows * total_columns) * 100, 1)
    duplicate_rows = df.duplicated().sum()

    return render_template("preview.html",
                           filename=os.path.basename(filepath),
                           column_names=column_names,
                           row_data=row_data,
                           total_rows=total_rows,
                           total_columns=total_columns,
                           missing_percent=missing_percent,
                           duplicate_rows=duplicate_rows,
                           start=start,
                           end=end)


@app.route('/preprocess')
def preprocess():
    filepath = session.get('filepath')
    if not filepath:
        return redirect(url_for('index'))


    missing_info, duplicate_indices = check_missing_and_duplicates(filepath)


    return render_template('preprocess.html',
                           missing_info=missing_info,
                           duplicates=duplicate_indices)


@app.route('/preview')
def dataset_preview():
    filepath = session.get('filepath', 'uploads/movies_data.csv')
    if not os.path.exists(filepath):
        return "File not found", 404


    try:
        start = int(request.args.get('start', 0))
        end = int(request.args.get('end', start + 100))
    except ValueError:
        return "Invalid row range", 400


    try:
        df = pd.read_csv(filepath)
    except Exception as e:
        return f"Error reading file: {e}", 500


    df_range = df.iloc[start:end]
    column_names = df.columns.tolist()
    row_data = df_range.to_dict(orient='records')


    total_rows = len(df)
    total_columns = len(df.columns)
    missing_percent = round(df.isnull().sum().sum() / (total_rows * total_columns) * 100, 1)
    duplicate_rows = df.duplicated().sum()


    return render_template("preview.html",
                           filename=os.path.basename(filepath),
                           column_names=column_names,
                           row_data=row_data,
                           total_rows=total_rows,
                           total_columns=total_columns,
                           missing_percent=missing_percent,
                           duplicate_rows=duplicate_rows,
                           start=start,
                        end=end
                           )


@app.route('/data-quality')
def data_quality():
    filepath = session.get('filepath')
    filename = os.path.basename(filepath)
    if not filepath or not os.path.exists(filepath):
        return redirect(url_for('index'))

    try:
        df = pd.read_csv(filepath)
        report = {}
        for col in df.columns:
            col_data = df[col]
            report[col] = {
                'missing': int(col_data.isnull().sum()),
                'unique': int(col_data.nunique()),
                'mean': round(col_data.mean(), 2) if pd.api.types.is_numeric_dtype(col_data) else '—',
                'mode': col_data.mode().iloc[0] if not col_data.mode().empty else '—'
            }
        return render_template('data_quality.html', quality_report=report, filename=filename)
    except Exception as e:
        print(f"Data Quality Error: {e}")
        return render_template('data_quality.html', quality_report=None,filename=filename)


if __name__ == '__main__':
    app.run(debug=True)
