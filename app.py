import sqlite3
import uuid
from flask import Flask, render_template, request, redirect, url_for, session, flash, g

app = Flask(__name__)
app.secret_key = "super_secret_manager_key"  # Needed for sessions/flash messages

DATABASE = 'feedback.db'

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# Initialize the database table
with app.app_context():
    db = get_db()
    db.execute('''
        CREATE TABLE IF NOT EXISTS feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            receipt_id TEXT UNIQUE,
            name TEXT NOT NULL,
            course TEXT NOT NULL,
            feedback TEXT NOT NULL,
            submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    db.commit()

# --- Routes ---

@app.route("/")
def index():
    return render_template("landing.html")

# ==========================================
# STUDENT ROUTES
# ==========================================
@app.route("/student", methods=["GET", "POST"])
def student():
    if request.method == "POST":
        name = request.form.get("name", "").strip()
        course = request.form.get("course", "").strip()
        feedback = request.form.get("feedback", "").strip()
        
        if name and course and feedback:
            receipt_id = str(uuid.uuid4())[:8].upper()
            db = get_db()
            db.execute("INSERT INTO feedback (receipt_id, name, course, feedback) VALUES (?, ?, ?, ?)",
                       (receipt_id, name, course, feedback))
            db.commit()
            return redirect(url_for("receipt", receipt_id=receipt_id))
    return render_template("student_form.html")

@app.route("/student/receipt/<receipt_id>")
def receipt(receipt_id):
    db = get_db()
    cur = db.execute("SELECT * FROM feedback WHERE receipt_id = ?", (receipt_id,))
    entry = cur.fetchone()
    if not entry:
        return "Receipt not found", 404
    return render_template("student_receipt.html", entry=entry)


# ==========================================
# MANAGER ROUTES
# ==========================================
@app.route("/manager/login", methods=["GET", "POST"])
def manager_login():
    if request.method == "POST":
        password = request.form.get("password")
        if password == "admin123":  # Simple hardcoded password for demo
            session["manager_logged_in"] = True
            return redirect(url_for("manager_dashboard"))
        else:
            flash("Invalid password!", "error")
    return render_template("manager_login.html")

@app.route("/manager")
def manager_dashboard():
    if not session.get("manager_logged_in"):
        return redirect(url_for("manager_login"))
    
    db = get_db()
    cur = db.execute("SELECT * FROM feedback ORDER BY submitted_at DESC")
    feedbacks = cur.fetchall()
    
    # Calculate some basic stats
    total_feedbacks = len(feedbacks)
    return render_template("manager_dashboard.html", feedbacks=feedbacks, total=total_feedbacks)

@app.route("/manager/delete/<int:feedback_id>", methods=["POST"])
def delete_feedback(feedback_id):
    if not session.get("manager_logged_in"):
        return redirect(url_for("manager_login"))
    
    db = get_db()
    db.execute("DELETE FROM feedback WHERE id = ?", (feedback_id,))
    db.commit()
    flash("Feedback deleted successfully.", "success")
    return redirect(url_for("manager_dashboard"))

@app.route("/manager/logout")
def manager_logout():
    session.pop("manager_logged_in", None)
    return redirect(url_for("index"))

if __name__ == "__main__":
    app.run(debug=True)
