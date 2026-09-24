"""
Student Feedback Web Application
A simple Flask web app that allows students to submit feedback
(name, course, and comments) and displays all submitted feedback.
"""

from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# In-memory storage for feedback entries
feedbacks = []


@app.route("/")
def index():
    """Render the home page with the feedback form and all submitted feedback."""
    return render_template("index.html", feedbacks=feedbacks)


@app.route("/submit", methods=["POST"])
def submit():
    """Handle feedback form submission."""
    name = request.form.get("name", "").strip()
    course = request.form.get("course", "").strip()
    feedback = request.form.get("feedback", "").strip()

    if name and course and feedback:
        feedbacks.append(
            {"name": name, "course": course, "feedback": feedback}
        )

    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=True)
