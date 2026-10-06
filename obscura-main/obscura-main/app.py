import os
import sys
import tempfile
import subprocess
# pyrefly: ignore [missing-import]
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/obfuscate', methods=['POST'])
def obfuscate():
    data = request.json
    code = data.get('code', '')
    level = data.get('level', '4')

    if not code.strip():
        return jsonify({'error': 'Code cannot be empty'}), 400

    # Create temporary files for input and output
    fd_in, temp_in_path = tempfile.mkstemp(suffix='.lua')
    fd_out, temp_out_path = tempfile.mkstemp(suffix='.lua')
    
    try:
        # Write the original code to the input file
        with os.fdopen(fd_in, 'w', encoding='utf-8') as f_in:
            f_in.write(code)
            
        os.close(fd_out) # Close the output file descriptor so the subprocess can write to it

        # Run the obfuscator CLI
        command = [
            sys.executable, 'main.py',
            '--input', temp_in_path,
            '--output', temp_out_path,
            '--level', str(level)
        ]
        
        process = subprocess.run(command, capture_output=True, text=True)

        if process.returncode != 0:
            return jsonify({'error': 'Obfuscation failed', 'details': process.stderr or process.stdout}), 500

        # Read the obfuscated result
        with open(temp_out_path, 'r', encoding='utf-8') as f_out:
            obfuscated_code = f_out.read()

        return jsonify({'result': obfuscated_code})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        # Clean up temporary files
        if os.path.exists(temp_in_path):
            os.remove(temp_in_path)
        if os.path.exists(temp_out_path):
            os.remove(temp_out_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
