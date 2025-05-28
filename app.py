from flask import Flask, send_file
import subprocess
import os

app = Flask(__name__)

@app.route('/generate_report', methods=['GET'])
def generate_report():
    try:
        # Run the Python script to generate the report
        subprocess.run(['python', 'test.py'], check=True)

        # Send the generated PDF file
        return send_file('AI_Health_Report9.pdf', as_attachment=True)
    except subprocess.CalledProcessError as e:
        return f"Error generating report: {e}", 500
    except Exception as e:
        return f"Error: {e}", 500

if __name__ == '__main__':
    app.run(debug=True)
