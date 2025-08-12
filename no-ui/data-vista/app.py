from flask import Flask, render_template, request, redirect, url_for, session
import pandas as pd
import os
from werkzeug.utils import secure_filename
from preprocess import check_missing_and_duplicates

app = Flask(__name__)
app.secret_key = 'supersecretkey'
app.config['UPLOAD_FOLDER'] = 'uploads'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST', 'GET'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        if not file:
            return "No file uploaded", 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        session['filepath'] = filepath

        # Default preview: first 100 rows
        start = 0
        end = 100

    else:
        # GET with range inputs
        start = int(request.args.get('start', 0))
        end = int(request.args.get('end', start + 100))
        filepath = session.get('filepath')
        if not filepath:
            return redirect(url_for('index'))

    # Read only selected rows
    skip = lambda x: x < start or x >= end
    df = pd.read_csv(filepath, skiprows=skip, header=0)
    df.reset_index(drop=True, inplace=True)

    col_info = [{'name': col, 'dtype': str(df[col].dtype)} for col in df.columns]

    return render_template('preview.html',
                           table=df.to_html(classes="table table-bordered table-hover"),
                           columns=col_info,
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

if __name__ == '__main__':
    app.run(debug=True)
