from datetime import datetime
from app import db  # Assumes 'db' is created in 'app.py' or 'app/__init__.py'
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.hybrid import hybrid_property

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_freelancer = db.Column(db.Boolean, default=False, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    skills = db.Column(db.Text, nullable=True)  # "Python,React,Graphic Design"
    
    # --- NEW FIELDS FOR RANKING ---
    # These would ideally be calculated and updated periodically by a background task
    avg_rating = db.Column(db.Float, default=0.0)
    completion_rate = db.Column(db.Float, default=0.0) # e.g., 0.9 = 90%
    on_time_rate = db.Column(db.Float, default=0.0)    # e.g., 0.95 = 95%
    portfolio_score = db.Column(db.Float, default=0.0) # A score from 0.0 to 1.0
    # ---------------------------------

    # Relationships
    projects_as_client = db.relationship('Project', foreign_keys='Project.client_id', back_populates='client', lazy='dynamic')
    projects_as_freelancer = db.relationship('Project', foreign_keys='Project.freelancer_id', back_populates='freelancer', lazy='dynamic')
    bids = db.relationship('Bid', back_populates='freelancer', lazy='dynamic')
    reviews_given = db.relationship('Review', foreign_keys='Review.reviewer_id', back_populates='reviewer', lazy='dynamic')
    reviews_received = db.relationship('Review', foreign_keys='Review.reviewee_id', back_populates='reviewee', lazy='dynamic')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    # Example: You could use a hybrid_property to calculate avg_rating on the fly,
    # but this can be slow. It's often better to store it as a column.
    # @hybrid_property
    # def avg_rating(self):
    #     reviews = self.reviews_received.all()
    #     if not reviews:
    #         return 0.0
    #     return sum(r.rating for r in reviews) / len(reviews)

    def __repr__(self):
        return f'<User {self.username}>'

class Project(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    budget = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='open', nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # --- NEW FIELD FOR RANKING ---
    required_skills = db.Column(db.Text, nullable=True) # "Python,Flask,Stripe"
    # -----------------------------

    # ForeignKeys
    client_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    # Relationships
    client = db.relationship('User', foreign_keys=[client_id], back_populates='projects_as_client')
    freelancer = db.relationship('User', foreign_keys=[freelancer_id], back_populates='projects_as_freelancer')
    bids = db.relationship('Bid', back_populates='project', lazy='dynamic', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='project', lazy='dynamic', cascade="all, delete-orphan")

    def __repr__(self):
        return f'<Project {self.title}>'

class Bid(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    proposal = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # --- NEW FIELD FOR RANKING ---
    proposed_timeline_days = db.Column(db.Integer, nullable=True)
    # -----------------------------

    # ForeignKeys
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Relationships
    project = db.relationship('Project', back_populates='bids')
    freelancer = db.relationship('User', back_populates='bids')

    def __repr__(self):
        return f'<Bid {self.amount} on Project {self.project_id}>'

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5
    comment = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # ForeignKeys
    project_id = db.Column(db.Integer, db.ForeignKey('project.id'), nullable=False)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reviewee_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Relationships
    project = db.relationship('Project', back_populates='reviews')
    reviewer = db.relationship('User', foreign_keys=[reviewer_id], back_populates='reviews_given')
    reviewee = db.relationship('User', foreign_keys=[reviewee_id], back_populates='reviews_received')

    def __repr__(self):
        return f'<Review {self.rating}/5 for Project {self.project_id}>'