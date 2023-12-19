from flask import Flask, render_template, request
from deepface import DeepFace
import urllib.parse
import matplotlib.pyplot as plt
import sqlite3
import hashlib
import os
from deepface.basemodels import VGGFace as vggface

def md5(data):
    return hashlib.md5(repr(data).encode()).hexdigest()

def download_models():
    vggface.loadModel()

con = sqlite3.connect("faces.db")
cur = con.cursor()
cur.execute("CREATE TABLE if not exists faces(id char(32) primary key not null, name varchar(50) not null)")
con.commit()

if not os.path.isdir("dataset"): os.mkdir("dataset")

download_models()

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/recognise')
def route_recognise():
    return render_template('recognise.html')

@app.route('/register')
def route_register():
    return render_template('register.html')

@app.route('/api/register', methods=['POST'])
def api_register():

    if not 'name' in request.form or not 'image' in request.form:
        return '<span class="log log-err">Invalid Request<span>'

    name = request.form['name']
    img = request.form['image']
    
    try:
        base64_image = urllib.parse.unquote(img)
        result = DeepFace.extract_faces(base64_image, detector_backend = 'opencv')
    except:
        return '<span class="log log-err">No Faces<span>'

    if len(result) > 1: return '<span class="log log-err">Multiple Faces<span>'

    face = result[0]['face']
    imghash = md5(face)
    filename = "dataset/"+imghash+".jpg"
    plt.imsave(filename, face)
    if os.path.exists("dataset/representations_vgg_face.pkl"): os.unlink("dataset/representations_vgg_face.pkl")
    con = sqlite3.connect("faces.db")
    cur = con.cursor()
    try:
        cur.execute("INSERT INTO faces VALUES(?, ?)", [imghash, name])
    except:
        pass
    con.commit()
    con.close()

    return '<span class="log-scs">Registered Successfully<span>'


@app.route('/api/recognise', methods=['POST'])
def api_recognise():

    if not 'image' in request.form:
        return '<span class="log-err">Invalid Request<span>'

    img = request.form['image']

    try:
        base64_image = urllib.parse.unquote(img)
        result = DeepFace.find(base64_image, db_path = 'dataset/', model_name = 'VGG-Face')
    except Exception as e:
        print(e)
        return '<span class="log-err">No Match<span>'

    if result is None or len(result) == 0 or len(result[0]) == 0:
        return '<span class="log-err">No Match<span>'

    match = os.path.basename(result[0]['identity'][0]).split('.')[0]

    con = sqlite3.connect("faces.db")
    cur = con.cursor()
    res = cur.execute("SELECT name from faces where id == (?)", [match])
    name = res.fetchone()
    con.close()

    if name is None: return '<span class="log-err">face found but no record<span>'
    return '<span class="log-name">'+name[0]+'<span>'


if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5000)
