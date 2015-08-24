import os
import json

from flask import Flask, render_template, request, make_response

app = Flask(__name__)
app.debug = True

@app.route('/')
def index():
    return render_template('notes.html')

@app.route('/sketch/<int:pagenum>', methods=['GET', 'PUT'])
def sketch(pagenum):
    filename = 'storage/image_%d.png' % pagenum
    if request.method == 'GET':
        if os.path.exists(filename):
            return make_response(open(filename, 'rb').read().encode('base64'), 200)
        else:
            content = {'error': 'Not Found'}
            return make_response(json.dumps(content), 404)

    if request.method == 'PUT':
        # We save the state
        data = request.data
        data = data.replace('data:image/png;base64,', '')
        with open(filename, "wb") as fh:
            fh.write(data.decode('base64'))

        return make_response(json.dumps({'status': 'success'}), 200)

@app.route('/pages', methods=['GET'])
def pages():
    content = [{'num': i + 1} for i, fname in enumerate(os.listdir('storage'))]
    return make_response(json.dumps(content))

if __name__ == '__main__':
    app.run()
