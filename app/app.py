import os
import json
from PIL import Image
from flask import Flask, render_template, request, make_response
from flask.ext.pymongo import PyMongo
from bson.objectid import ObjectId

app = Flask(__name__)
mongo = PyMongo(app)

app.debug = True

@app.route('/')
def index():
    return render_template('notes.html')

@app.route('/sketch/<string:id>', methods=['GET', 'PUT', 'POST', 'DELETE'])
def sketch(id):

    if request.method == 'GET':
        id = ObjectId(id)
        page = mongo.db.pages.find({'_id' : id})
        if page.count() > 0:
            return make_response(page[0]['data'], 200)
        else:
            content = {'error': 'Not Found'}
            return make_response(json.dumps(content), 404)

    if request.method == 'PUT':
        id = ObjectId(id)
        data = request.data
        data = data.replace('data:image/png;base64,', '')

        mongo.db.pages.update({'_id' : id}, {'$set': {'data': data}},
                              safe=True,
                              upsert=True)

        return make_response(json.dumps({'status': 'success'}), 200)


    if request.method == 'DELETE':
        id = ObjectId(id)
        mongo.db.pages.remove({'_id': id})
        return make_response(json.dumps({'status': 'success'}), 200)

@app.route('/sketch/new', methods=['POST'])
def new_sketch():
    if request.method == 'POST':
        data = request.data
        data = data.replace('data:image/png;base64,', '')
        inserted = mongo.db.pages.insert({ 'data': data })
        return make_response(json.dumps({'data': data, 'id': str(inserted)}))



@app.route('/pages', methods=['GET'])
def pages():
    pages = mongo.db.pages.find().sort('_id', 1)
    content = [{'id': str(p['_id']), 'thumb': _make_thumbnail(p['data'], (128, 128))} for p in pages]
    return make_response(json.dumps(content))

@app.route('/reset', methods=['GET'])
def reset():
    mongo.db.pages.remove({})
    return make_response({'status': 'success'})

def _make_thumbnail(data, size):
    '''Get a base64-encoded string of the image,
       return a base64-encoded version of the thumbnail'''
    from StringIO import StringIO
    inp = StringIO()
    inp.write(data.decode('base64'))
    image = Image.open(inp)
    image.thumbnail(size)
    out = StringIO()
    image.save(out, format='png')
    image.close()
    return out.getvalue().encode('base64')

if __name__ == '__main__':
    app.run()
