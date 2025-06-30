from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import date

app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///mood.db'
db = SQLAlchemy(app)

class MoodEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entry_date = db.Column(db.String, unique=True, nullable=False)
    mood = db.Column(db.String, nullable=False)
    note = db.Column(db.String, nullable=True)

with app.app_context():
    db.create_all()


@app.route('/api/moods', methods=['GET'])
def get_moods():
    entries = MoodEntry.query.all()
    return jsonify([
        {'date': e.entry_date, 'mood': e.mood, 'note': e.note}
        for e in entries
    ])

@app.route('/api/moods/<entry_date>', methods=['GET', 'POST'])
def mood_entry(entry_date):
    if request.method == 'GET':
        entry = MoodEntry.query.filter_by(entry_date=entry_date).first()
        if entry:
            return jsonify({'date': entry.entry_date, 'mood': entry.mood, 'note': entry.note})
        else:
            return jsonify({'error': 'Not found'}), 404
    if request.method == 'POST':
        data = request.json
        entry = MoodEntry.query.filter_by(entry_date=entry_date).first()
        if entry:
            entry.mood = data['mood']
            entry.note = data['note']
        else:
            entry = MoodEntry(entry_date=entry_date, mood=data['mood'], note=data['note'])
            db.session.add(entry)
        db.session.commit()
        return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True)
